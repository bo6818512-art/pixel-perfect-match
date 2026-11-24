import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { SiteHeader, Reveal } from "@/components/site-header";
import { SiteFooter, SocialIcons } from "@/components/site-footer";
import { portalCss } from "@/components/portal-frame";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitSupport } from "@/lib/support.functions";
import { useI18n, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "تواصل معنا | بوابة التراخيص ACUD" },
    { name: "description", content: "بيانات التواصل مع شركة العاصمة الإدارية للتنمية العمرانية: الهاتف والبريد والعنوان ومواعيد العمل ونموذج المراسلة." },
    { property: "og:title", content: "تواصل معنا | بوابة التراخيص ACUD" },
    { property: "og:description", content: "تواصل مع شركة العاصمة الإدارية للتنمية العمرانية وأرسل رسالتك مباشرة." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ContactPage,
});

const subjects: TKey[] = ["subjGeneral", "subjSupport", "subjOther"];

function ContactPage() {
  const { t, dir, lang } = useI18n();
  const send = useServerFn(submitSupport);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; const f = new FormData(form);
    setStatus("sending");
    try {
      await send({ data: { kind: "question", name: String(f.get("name")), email: String(f.get("email")), phone: String(f.get("phone") ?? ""), complaintType: String(f.get("subject") ?? ""), message: String(f.get("message")) } });
      form.reset(); setStatus("sent");
    } catch { setStatus("error"); }
  }
  const info = [
    { icon: Phone, title: t("callUs"), body: <a href="tel:01200882137" dir="ltr" className="hover:text-primary">01200882137</a> },
    { icon: Mail, title: t("email"), body: <a href="mailto:Hamada.Mahmoud@acud.eg" dir="ltr" className="hover:text-primary">Hamada.Mahmoud@acud.eg</a> },
    { icon: MapPin, title: t("visitUs"), body: t("address") },
    { icon: Clock, title: t("businessHours"), body: t("hours") },
  ];
  return (
    <div dir={dir} lang={lang} className="flex min-h-dvh flex-col bg-background font-sans text-foreground">
      <style>{portalCss}</style>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <img className="hero-zoom absolute inset-0 -z-10 h-full w-full object-cover" src="/site-assets/df8cc02b69ccaa16.jpg" alt="" />
          <div className="absolute inset-0 -z-10 bg-primary/75" />
          <div className="mx-auto max-w-3xl px-4 pb-40 pt-20 text-center text-primary-foreground md:pb-48 md:pt-28">
            <h1 className="hero-in text-4xl font-extrabold md:text-5xl">{t("contact")}</h1>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-background [clip-path:polygon(0_100%,100%_30%,100%_100%)]" />
        </section>

        <Reveal className="slide-group relative z-10 mx-auto -mt-32 max-w-6xl px-4">
          <div className="grid overflow-hidden rounded-2xl shadow-2xl md:grid-cols-2">
            <div className="slide-item from-start glass-card space-y-7 bg-muted/80 p-8 md:p-12">
              <div>
                <h2 className="text-3xl font-bold text-primary">{t("getInTouch")}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("getInTouchText")}</p>
              </div>
              {info.map(({ icon: Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 120} className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"><Icon className="size-6" /></span>
                  <div><h3 className="font-bold text-primary">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{body}</p></div>
                </Reveal>
              ))}
              <div className="border-t pt-6">
                <h3 className="mb-4 font-bold text-primary">{t("followUs")}</h3>
                <SocialIcons tone="brand" />
              </div>
            </div>
            <form onSubmit={onSubmit} className="slide-item from-end space-y-5 bg-card p-8 md:p-12">
              <h2 className="text-3xl font-bold text-primary">{t("sendMessage")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("fullName")}><Input name="name" required maxLength={100} className="rounded-full bg-muted" /></Field>
                <Field label={t("email")}><Input name="email" type="email" required maxLength={255} dir="ltr" className="rounded-full bg-muted" /></Field>
                <Field label={t("phone")}><Input name="phone" type="tel" maxLength={30} dir="ltr" className="rounded-full bg-muted" /></Field>
                <Field label={t("subject")}>
                  <select name="subject" required defaultValue="" className="h-9 w-full rounded-full border bg-muted px-3 text-sm">
                    <option value="" disabled>{t("chooseSubject")}</option>
                    {subjects.map((s) => <option key={s} value={t(s)}>{t(s)}</option>)}
                  </select>
                </Field>
              </div>
              <Field label={t("message")}><Textarea name="message" required maxLength={5000} rows={5} className="rounded-2xl bg-muted" /></Field>
              <Button type="submit" disabled={status === "sending"} className="h-11 w-full rounded-full text-base font-bold"><Send />{status === "sending" ? t("sending") : t("send")}</Button>
              {status === "sent" && <p role="status" className="rounded-md bg-secondary p-3 text-sm font-semibold text-primary">{t("sent")}</p>}
              {status === "error" && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{t("sendFailed")}</p>}
            </form>
          </div>
        </Reveal>

        <Reveal as="section" className="mt-20">
          <iframe title={t("location")} className="h-[420px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Administrative+Capital+for+Urban+Development+ACUD+New+Administrative+Capital+Egypt&output=embed" />
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm font-semibold text-primary"><span>{label}</span>{children}</label>;
}
