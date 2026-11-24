import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Trash2, FilePenLine } from 'lucide-react';
import { listLicenseDrafts, removeLicenseDraft } from '@/lib/license-drafts.functions';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
export function LicenseDraftList() {
  const { lang } = useI18n(); const ar = lang === 'ar'; const list = useServerFn(listLicenseDrafts); const remove = useServerFn(removeLicenseDraft); const qc = useQueryClient(); const [error, setError] = useState(''); const [busy, setBusy] = useState('');
  const { data = [], error: loadError } = useQuery({ queryKey: ['license-drafts'], queryFn: () => list() });
  async function discard(id: string) { setBusy(id); try { await remove({ data: { id } }); await qc.invalidateQueries({ queryKey: ['license-drafts'] }); } catch(e) { setError(e instanceof Error ? e.message : 'Could not remove draft.'); } finally { setBusy(''); } }
  return <div className="space-y-3">{(error || loadError) && <p role="alert" className="text-destructive">{error || loadError?.message}</p>}{data.length > 0 && <h2 className="text-xl font-bold">{ar ? 'المسودات المحفوظة' : 'Saved drafts'}</h2>}{data.map(d => <article key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background p-4"><div><h3 className="font-semibold">{d.payload.plotNumber || (ar ? 'طلب غير مكتمل' : 'Incomplete request')}</h3><p className="text-sm text-muted-foreground">{ar ? 'مسودة — لم يُقدَّم الطلب' : 'Draft — not submitted'}</p></div><div className="flex gap-2"><Button variant="outline" asChild><Link to={d.mode === 'new' ? '/my/new-request' : d.mode === 'renewal' ? '/my/renew-license' : '/my/amend-license'}><FilePenLine />{ar ? 'استكمال' : 'Continue'}</Link></Button><Button size="icon" variant="ghost" disabled={busy === d.id} aria-label={ar ? 'حذف المسودة' : 'Delete draft'} onClick={() => discard(d.id)}><Trash2 /></Button></div></article>)}</div>;
}