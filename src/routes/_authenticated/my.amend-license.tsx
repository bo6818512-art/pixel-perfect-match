import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { LicenseWizard } from '@/components/license-wizard';
export const Route = createFileRoute('/_authenticated/my/amend-license')({ head: () => portalHead('تعديل نشاط أو نقل ملكية', 'طلب تعديل النشاط أو نقل الملكية قبل وبعد إصدار رخصة المحال التجارية العامة.'), component: Page });
function Page() { return <PortalFrame title="تعديل نشاط أو نقل ملكية"><LicenseWizard mode="amendment" /></PortalFrame>; }