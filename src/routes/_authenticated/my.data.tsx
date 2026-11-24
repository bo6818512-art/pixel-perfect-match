import { createFileRoute } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { MyData, accountOptions } from '@/components/my-data';
import { useI18n } from '@/lib/i18n';
export const Route=createFileRoute('/_authenticated/my/data')({loader:({context})=>context.queryClient.ensureQueryData(accountOptions),head:()=>portalHead('بياناتي | My Data','بيانات الهوية والشركة والاتصال والمستندات الخاصة بحسابك في بوابة ACUD.'),component:Page});
function Page(){const {lang}=useI18n();return <PortalFrame title={lang==='ar'?'بياناتي':'My Data'}><MyData/></PortalFrame>;}