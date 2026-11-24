import { Clock } from 'lucide-react';
export function ReviewNote() {
  return <div className="flex items-center gap-3 rounded-xl bg-gold/15 px-5 py-4 text-foreground"><Clock className="size-6 shrink-0 text-gold" /><p>تتم مراجعة الطلب خلال مدة أقصاها ٣٠ يوماً من تاريخ الاستلام.</p></div>;
}
