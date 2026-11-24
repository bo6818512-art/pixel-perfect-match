import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getCompanyAdminAccess } from '@/lib/admin.functions';
export const Route = createFileRoute('/_authenticated/_company')({ beforeLoad: async () => { const access = await getCompanyAdminAccess(); if (!access.isAdmin) throw redirect({ to: '/' }); }, component: Outlet });
