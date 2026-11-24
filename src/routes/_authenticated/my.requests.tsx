import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { LicenseRecords, licenseRequestsOptions } from '@/components/license-records';
export const Route = createFileRoute('/_authenticated/my/requests')({ loader: ({context}) => context.queryClient.ensureQueryData(licenseRequestsOptions), head: () => portalHead('مراجعة الطلبات', 'مراجعة طلبات الترخيص والتجديد والتعديل وطريقة الدفع الخاصة بحسابك.'), component: Page });
function Page() { return <PortalFrame title="مراجعة الطلبات"><LicenseRecords /></PortalFrame>; }