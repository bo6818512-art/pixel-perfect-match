import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { LicenseWizard } from '@/components/license-wizard';
export const Route = createFileRoute('/_authenticated/my/new-request')({ head: () => portalHead('طلب ترخيص المحال التجارية العامة', 'اختيار الشركة والمبنى أو الوحدة ورفع مستندات طلب الترخيص.'), component: Page });
function Page() { return <PortalFrame title="طلب ترخيص المحال التجارية العامة"><LicenseWizard /></PortalFrame>; }