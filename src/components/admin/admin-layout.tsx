import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Building2, FileText, LayoutDashboard, Users, Mail, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalFrame } from '@/components/portal-frame';

export function AdminLayout({ title, children, refresh }: { title: string; children: ReactNode; refresh: () => void }) {
  const nav = [
    { to: '/admin', label: 'لوحة التحكم', Icon: LayoutDashboard },
    { to: '/admin/requests', label: 'الطلبات', Icon: FileText },
    { to: '/admin/citizens', label: 'المواطنون', Icon: Users },
    { to: '/admin/users', label: 'المستخدمون', Icon: Building2 },
    { to: '/admin/support', label: 'الاستفسارات والشكاوي', Icon: Mail },
    { to: '/admin/assistant', label: 'مساعد الأولويات', Icon: Sparkles },
  ] as const;
  return <PortalFrame title={title} wide><div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="min-w-0"><div className="mb-5 border-b border-border pb-4 text-sm font-bold text-primary">إدارة شركة العاصمة الإدارية</div><nav className="grid gap-1">{nav.map(({ to, label, Icon }) => <Button asChild variant="ghost" className="justify-start" key={to}><Link to={to} activeOptions={{ exact: true }} activeProps={{ className: 'bg-primary text-primary-foreground' }}><Icon />{label}</Link></Button>)}</nav><Button variant="outline" className="mt-4" onClick={refresh}><RefreshCw />تحديث البيانات</Button></aside><div className="min-w-0">{children}</div></div></PortalFrame>;
}