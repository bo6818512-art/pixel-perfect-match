import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/auth-form';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { safeDestination } from '@/lib/portal-access';
export const Route = createFileRoute('/signup')({
  validateSearch: (search: Record<string, unknown>): { redirect?: ReturnType<typeof safeDestination> } => (search['redirect'] ? { redirect: safeDestination(search['redirect']) } : {}),
  head: () => portalHead('إنشاء حساب جديد', 'اختيار نوع الحساب وتسجيل بيانات المستخدم والرقم القومي في بوابة تراخيص المحال العامة.'),
  component: Page,
});
function Page() { const { redirect } = Route.useSearch(); return <PortalFrame title="إنشاء حساب جديد"><AuthForm signup destination={safeDestination(redirect)} /></PortalFrame>; }