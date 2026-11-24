import type { LicenseInput } from './licensing';

type UploadCache = Map<number, File>;
export async function uploadLicenseDocuments({ files, userId, requestId, uploaded, attempted, upload, onProgress, requiredSlots = Array.from({length:12},(_,i)=>i+1), reused = [] }: {
  files: Record<number, File>;
  userId: string;
  requestId: string;
  uploaded: UploadCache;
  attempted: Set<number>;
  upload: (path: string, file: File, replace: boolean) => Promise<void>;
  onProgress: (completed: number) => void;
  requiredSlots?: number[];
  reused?: LicenseInput['documents'];
}): Promise<LicenseInput['documents']> {
  const documents: LicenseInput['documents'] = [];
  for (const slot of requiredSlots) {
    const saved = reused.find(d=>d.slot===slot);
    if (saved) { documents.push(saved); continue; }
    const file = files[slot];
    if (!file) throw new Error('ارفعي المستندات الاثني عشر.');
    const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
    if (signature !== '%PDF-') throw new Error(`المستند ${slot} ليس ملف PDF صالحًا.`);
    documents.push({ slot, path: `${userId}/${requestId}/${slot}.pdf`, name: file.name });
  }
  let completed = documents.filter(doc => reused.some(d=>d.slot===doc.slot) || uploaded.get(doc.slot) === files[doc.slot]).length;
  onProgress(completed);
  const pending = documents.filter(doc => !reused.some(d=>d.slot===doc.slot) && uploaded.get(doc.slot) !== files[doc.slot]);
  let cursor = 0;
  let failure: unknown;
  async function worker() {
    while (cursor < pending.length && !failure) {
      const doc = pending[cursor++];
      if (!doc) return;
      const file = files[doc.slot];
      if (!file) return;
      const replace = attempted.has(doc.slot);
      attempted.add(doc.slot);
      try {
        await upload(doc.path, file, replace);
        uploaded.set(doc.slot, file);
        onProgress(++completed);
      } catch (error) { failure = error; }
    }
  }
  // Three uploads keep the connection useful without flooding it with twelve files.
  await Promise.all(Array.from({ length: Math.min(3, pending.length) }, worker));
  if (failure) throw failure;
  return documents;
}