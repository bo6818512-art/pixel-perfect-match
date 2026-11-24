import { describe, expect, it } from 'vitest';
import { uploadLicenseDocuments } from '../lib/license-uploads';

function documents() {
  return Object.fromEntries(Array.from({ length: 12 }, (_, i) => {
    const file = new File(['%PDF-1.4 test'], `${i + 1}.pdf`, { type: 'application/pdf' });
    // jsdom's Blob does not implement arrayBuffer.
    Object.defineProperty(file, 'slice', { value: () => ({ arrayBuffer: async () => new TextEncoder().encode('%PDF-').buffer }) });
    return [i + 1, file];
  }));
}
describe('license upload scheduling', () => {
  it('uploads all twelve documents with at most three active transfers and no initial replacement', async () => {
    let active = 0; let maximum = 0; let calls = 0;
    const result = await uploadLicenseDocuments({ files: documents(), userId: 'owner', requestId: 'request', uploaded: new Map(), attempted: new Set(), onProgress: () => {}, upload: async (_path, _file, replace) => {
      expect(replace).toBe(false); calls++; active++; maximum = Math.max(maximum, active);
      await new Promise(resolve => setTimeout(resolve, 5)); active--;
    } });
    expect(result).toHaveLength(12); expect(calls).toBe(12); expect(maximum).toBe(3);
  });
  it('retains completed documents and retries only missing documents after a failure', async () => {
    const files = documents(); const uploaded = new Map<number, File>(); const attempted = new Set<number>();
    const args = { files, userId: 'owner', requestId: 'request', uploaded, attempted, onProgress: () => {} };
    await expect(uploadLicenseDocuments({ ...args, upload: async (_path, file) => { if (file === files[2]) throw new Error('connection interrupted'); } })).rejects.toThrow('connection interrupted');
    const completedBefore = uploaded.size; const retried: string[] = [];
    await uploadLicenseDocuments({ ...args, upload: async (path, _file, replace) => { retried.push(path); if (path.endsWith('/2.pdf')) expect(replace).toBe(true); } });
    expect(uploaded.size).toBe(12); expect(retried).toHaveLength(12 - completedBefore);
    const calls: string[] = [];
    await uploadLicenseDocuments({ ...args, upload: async path => { calls.push(path); } });
    expect(calls).toHaveLength(0);
  });
  it('validates all twelve PDFs before starting any upload', async () => {
    const files = documents(); delete files[12]; let calls = 0;
    await expect(uploadLicenseDocuments({ files, userId: 'owner', requestId: 'request', uploaded: new Map(), attempted: new Set(), onProgress: () => {}, upload: async () => { calls++; } })).rejects.toThrow('الاثني عشر');
    expect(calls).toBe(0);
  });
});