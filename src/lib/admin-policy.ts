export const adminStatuses = ['under_review', 'issued', 'rejected'] as const;
export const requestKindLabels: Record<string, string> = { new: 'طلب ترخيص جديد', renewal: 'تجديد سنوي', activity_change: 'تعديل نشاط', ownership_transfer: 'نقل ملكية' };
export const requestStatusLabels: Record<string, string> = { awaiting_document_review: 'بانتظار مراجعة المستندات', awaiting_payment: 'بانتظار الدفع', awaiting_payment_review: 'تم رفع الإيصال — بانتظار تأكيد الدفع', under_review: 'قيد المراجعة', issued: 'تم إصدار الترخيص', rejected: 'مرفوض' };
export function canIssueLicense(request: { paid_at: string | null; fee: number | null; status: string; deleted_at: string | null }) {
  return Boolean(request.paid_at && request.fee && request.fee > 0 && request.status !== 'issued' && !request.deleted_at);
}