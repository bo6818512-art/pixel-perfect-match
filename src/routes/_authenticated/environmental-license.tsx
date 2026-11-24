import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { EnvironmentalWizard } from '@/components/environmental-wizard';
export const Route = createFileRoute('/_authenticated/environmental-license')({ head: () => portalHead('إصدار التراخيص البيئية للمشروعات', 'إصدار التراخيص البيئية للمشروعات بالعاصمة الإدارية الجديدة للمطورين.'), component: Page });
function Page() { return <PortalFrame title="إصدار التراخيص البيئية للمشروعات بالعاصمة الإدارية الجديدة"><EnvironmentalWizard /></PortalFrame>; }
