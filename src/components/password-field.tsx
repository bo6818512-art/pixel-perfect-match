import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PasswordField({ name, label, signup = false }: { name: string; label: string; signup?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <label className="grid gap-2 text-sm font-semibold">{label}<span className="relative block">
    <Input name={name} type={visible ? 'text' : 'password'} dir="ltr" required minLength={signup ? 8 : undefined} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} className="h-12 bg-background px-12" />
    <Button type="button" variant="ghost" size="icon" className="absolute end-1 top-1.5 text-muted-foreground" aria-label={`${visible ? 'إخفاء' : 'إظهار'} ${label}`} title={`${visible ? 'إخفاء' : 'إظهار'} ${label}`} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button>
  </span></label>;
}