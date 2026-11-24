import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/auth-form';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { safeDestination } from '@/lib/portal-access';
export const Route = createFileRoute('/signin')({
  validateSearch: (search: Record<string, unknown>): { redirect?: ReturnType<typeof safeDestination> } => (search['redirect'] ? { redirect: safeDestination(search['redirect']) } : {}),
  head: () => portalHead('تسجيل دخول', 'تسجيل الدخول ومتابعة طلبات وتراخيص المحال العامة.'),
  component: Page,
});
function Page() { const { redirect } = Route.useSearch(); return <PortalFrame title="تسجيل دخول"><AuthForm destination={safeDestination(redirect)} /></PortalFrame>; }