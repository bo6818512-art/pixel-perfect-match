import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { LicenseRecords, licenseRequestsOptions } from '@/components/license-records';
export const Route = createFileRoute('/_authenticated/inquiry')({ loader: ({context}) => context.queryClient.ensureQueryData(licenseRequestsOptions), head: () => portalHead('الاستعلام عن حالة طلب', 'البحث برقم الطلب أو الكود الخاص بقطعة الأرض في طلبات الترخيص الخاصة بحسابك.'), component: Page });
function Page() { return <PortalFrame title="الاستعلام عن حالة طلب"><LicenseRecords searchable /></PortalFrame>; }