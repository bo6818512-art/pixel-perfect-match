import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame,portalHead } from '@/components/portal-frame';
import { MyProperties,propertiesOptions } from '@/components/my-properties';
import { useI18n } from '@/lib/i18n';
export const Route=createFileRoute('/_authenticated/my/properties')({loader:({context})=>context.queryClient.ensureQueryData(propertiesOptions),head:()=>portalHead('أملاكي | My Properties','تراخيصك الصادرة وطلباتك الجارية وجميع العقارات والوحدات المرتبطة بحسابك في ACUD.'),component:Page});
function Page(){const {lang}=useI18n();return <PortalFrame title={lang==='ar'?'أملاكي':'My Properties'} wide><MyProperties/></PortalFrame>;}