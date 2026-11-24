import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { LicenseWizard } from '@/components/license-wizard';
export const Route = createFileRoute('/_authenticated/my/renew-license')({ head: () => portalHead('تجديد ترخيص المحال العامة', 'تجديد ترخيص محل عام من خلال حسابك.'), component: Page });
function Page() { return <PortalFrame title="تجديد ترخيص المحال التجارية العامة"><LicenseWizard mode="renewal" /></PortalFrame>; }