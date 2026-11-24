import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { LicenseRecords, licenseRequestsOptions } from '@/components/license-records';
export const Route = createFileRoute('/_authenticated/my/licenses')({ loader: ({context}) => context.queryClient.ensureQueryData(licenseRequestsOptions), head: () => portalHead('تراخيصي السابقة', 'التراخيص الصادرة الخاصة بحسابك في بوابة المحال التجارية العامة.'), component: Page });
function Page() { return <PortalFrame title="تراخيصي السابقة"><LicenseRecords issuedOnly /></PortalFrame>; }