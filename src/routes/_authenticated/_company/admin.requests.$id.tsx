import { createFileRoute } from '@tanstack/react-router';
import { AdminPortal } from '@/components/admin/admin-portal';
import { portalHead } from '@/components/portal-frame';
export const Route = createFileRoute('/_authenticated/_company/admin/requests/$id')({ head: () => portalHead('تفاصيل طلب الترخيص', 'إدارة طلبات بوابة تراخيص شركة العاصمة الإدارية وبيانات مقدمي الطلبات.'), component: Page });
function Page() { const { id } = Route.useParams(); return <AdminPortal view="detail" id={id} />; }
