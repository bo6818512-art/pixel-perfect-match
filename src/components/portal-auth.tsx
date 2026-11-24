import { useI18n } from '@/lib/i18n';
import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getCompanyAdminAccess } from '@/lib/admin.functions';
import { LogOut, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AccountNotifications } from '@/components/account-notifications';

export const PortalAuthContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export function usePortalAuth() { return useContext(PortalAuthContext); }
export function AccountControls() {
  const { t } = useI18n();
  const { user, ready } = usePortalAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(getCompanyAdminAccess);
  const { data: access } = useQuery({ queryKey: ['company-admin-access', user?.id], queryFn: () => checkAdmin(), enabled: ready && Boolean(user), retry: false });
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: '/auth', replace: true });
  }
  if (!ready) return <span className="px-4 py-4" aria-label="جارٍ تحميل الحساب">…</span>;
  return user ? <>
    {access?.isAdmin && <Button variant="ghost" asChild className="h-auto py-4 font-bold"><Link to="/admin">{t("adminPanel")}</Link></Button>}
    <div className="flex min-w-0 items-center gap-1"><Button variant="ghost" asChild className="h-auto max-w-56 py-4 font-bold"><Link to="/my/requests" title={t("myAccount")}><UserRound /><span className="truncate">{user.user_metadata?.['full_name'] || t('myAccount')}</span></Link></Button><AccountNotifications userId={user.id} /></div>
    <Button variant="ghost" className="h-auto py-4 font-bold" onClick={signOut}><LogOut />{t("signOut")}</Button>
  </> : <>
    <Button variant="ghost" asChild className="h-auto py-4 font-bold"><Link to="/signup">{t("newUser")}</Link></Button>
    <Button variant="ghost" asChild className="h-auto py-4 font-bold"><Link to="/signin">{t("signIn")}</Link></Button>
  </>;
}