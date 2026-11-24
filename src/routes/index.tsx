import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader, Reveal } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";
import { Mail, MessageCircle, ArrowLeft, Zap, ShieldCheck, ClipboardCheck, Eye } from 'lucide-react';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";
import sourceCSS from "../styles/site.css?raw";
import arabicFont from "../assets/6c9f4bab97d6bc5f.woff2?url";
import latinFont from "../assets/3270f0cb47fdabc3.woff2?url";
import extendedFont from "../assets/e8fc56ad5aa556a1.woff2?url";

const capturedCSS = sourceCSS
  .replaceAll("/site-assets/6c9f4bab97d6bc5f.woff2", arabicFont)
  .replaceAll("/site-assets/3270f0cb47fdabc3.woff2", latinFont)
  .replaceAll("/site-assets/e8fc56ad5aa556a1.woff2", extendedFont);

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "بوابة التراخيص | العاصمة الإدارية ACUD" },
    { name: "description", content: "بوابة تراخيص شركة العاصمة الإدارية للتنمية العمرانية لتقديم طلبات التراخيص والاستعلام عن حالتها." },
    { property: "og:title", content: "بوابة التراخيص | العاصمة الإدارية ACUD" },
    { property: "og:description", content: "تقديم طلبات التراخيص والاستعلام عن حالتها في العاصمة الإدارية الجديدة." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  staticData: { importedDocument: { html: { "dir": "rtl", "lang": "ar" }, body: {  } } },
  component: Index,
});

function Index() {
  const { t, dir, lang } = useI18n();
  const [developer, setDeveloper] = useState(false);
  useEffect(() => {
    let live = true;
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (live) setDeveloper(false); return; }
      const { data } = await supabase.from('profiles').select('requested_account_type').eq('id', user.id).maybeSingle();
      if (live) setDeveloper(data?.requested_account_type === 'developer');
    }
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { void check(); });
    return () => { live = false; sub.subscription.unsubscribe(); };
  }, []);
  return (
    <>
      <style>{capturedCSS}</style>
      <div dir={dir} lang={lang} className={"flex min-h-dvh flex-col \x62g-muted/\x330 font-sans"}>
        <SiteHeader />
        <main className="flex-1">
          <div>
            <div className="flex items-stretch overflow-hidden bg-background">
              <span className={"shrink-0 \x62g-ticker px-6 py-2 font-bold italic text-primary-foreground"}>{t("news")}</span>
              <div className="relative flex-1 overflow-hidden py-2">
                <p className={"\x61nimate-[\x6darquee_30s_linear_infinite] whitespace-nowrap font-semibold text-primary"}>
                  <span className="mx-8">● {t("news1")}</span>
                  <span className="mx-8">● {t("news2")}</span>
                </p>
              </div>
            </div>
            <section className="relative overflow-hidden">
              <img className="hero-zoom h-[480px] w-full object-cover" src="/site-assets/df8cc02b69ccaa16.jpg" alt="العاصمة الإدارية الجديدة" width="1920" height="800" />
              <div className={"absolute inset-0 flex flex-col items-center justify-center \x62g-gradient-to-b \x66rom-primary/\x340 \x74o-transparent px-4 text-center text-primary-foreground"}>
                <h1 className={"hero-in text-3xl font-extrabold \x64rop-shadow md:text-5xl"}>{t("heroTitle")}</h1>
                <p className={"hero-in hero-in-2 mt-4 max-w-3xl text-lg font-semibold \x64rop-shadow"}>{t("heroText")}</p>
                <Link className={"hero-in hero-in-3 mt-6 \x72ounded \x62g-gold px-8 py-3 font-bold text-gold-foreground \x73hadow-lg hover:opacity-90"} to="/my/new-request">{t("heroCta")}</Link>
              </div>
            </section>
            <Reveal className="reveal-stagger">{developer ? <DeveloperSection /> : <ImportedSection />}</Reveal>
            <Reveal as="section" className="bg-background px-4 py-16 text-primary">
              <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-4xl text-center">
                  <p className="mb-5 text-sm font-bold text-gold">{lang === 'ar' ? 'عن البوابة' : 'About the portal'}</p>
                  <h2 className="text-3xl font-extrabold leading-relaxed md:text-4xl">{lang === 'ar' ? 'بوابة التراخيص المحال التجارية العامة' : 'Commercial Shops Licensing Portal'}</h2>
                  <p className="mt-5 text-lg leading-8 text-muted-foreground">{lang === 'ar' ? 'بوابة شركة العاصمة الإدارية للتنمية العمرانية لتقديم طلبات تراخيص المحال التجارية العامة، ورفع المستندات المطلوبة، ومتابعة مراجعة الطلبات، وتجديد التراخيص أو تعديل النشاط ونقل الملكية.' : 'ACUD’s portal for commercial shop license applications, required documents, request tracking, annual renewals, activity changes and ownership transfers.'}</p>
                </div>
                <div className="mt-12 grid min-w-0 grid-cols-1! gap-6 sm:grid-cols-2! lg:grid-cols-4!">
                  {[
                    { Icon: Zap, title: lang === 'ar' ? 'تقديم إلكتروني' : 'Online applications', text: lang === 'ar' ? 'قدّم بيانات طلبك وارفع المستندات المطلوبة، واحفظ مسودة لاستكمالها لاحقًا.' : 'Enter your application details, upload required documents and save a draft to finish later.' },
                    { Icon: ShieldCheck, title: lang === 'ar' ? 'خصوصية البيانات' : 'Private account data', text: lang === 'ar' ? 'بيانات طلباتك ومستنداتك متاحة لك وللمختصين المصرح لهم بالمراجعة.' : 'Your requests and documents are accessible to you and authorized reviewers.' },
                    { Icon: ClipboardCheck, title: lang === 'ar' ? 'مراجعة من المختصين' : 'Specialist review', text: lang === 'ar' ? 'تراجع الشركة الطلب والمستندات وفق المتطلبات المعتمدة قبل إصدار الترخيص.' : 'ACUD reviews your application and documents against approved requirements before issuing a license.' },
                    { Icon: Eye, title: lang === 'ar' ? 'متابعة واضحة' : 'Clear request tracking', text: lang === 'ar' ? 'تابع حالة طلبك من حسابك، واستقبل إشعارات التحديث وتذكيرات تجديد الترخيص.' : 'Track requests in your account and receive status updates and license renewal reminders.' },
                  ].map(({ Icon, title, text }) => <article key={title} className="rounded-md border border-border bg-muted/40 p-7 text-start transition-transform duration-300 motion-safe:hover:-translate-y-1"><span className="mb-6 inline-flex size-14 items-center justify-center rounded-md bg-accent text-primary"><Icon className="size-7" aria-hidden="true" /></span><h3 className="text-xl font-bold">{title}</h3><p className="mt-4 leading-8 text-muted-foreground">{text}</p></article>)}
                </div>
              </div>
            </Reveal>
            <Reveal as="section" className="slide-group navy-band px-4 py-16 text-center">
              <div className="mx-auto max-w-5xl">
                <p className="mb-3 font-bold text-gold">{t("supportEyebrow")}</p>
                <h2 className="mb-8 text-3xl font-bold">{t("supportTitle")}</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <article className="slide-item from-start pop-card flex flex-col items-center gap-5 rounded-xl p-8"><Mail className="pop-icon size-10" /><h3 className="text-2xl font-bold">{t("email")}</h3><a className="max-w-full break-all font-bold text-gold" dir="ltr" href="mailto:Hamada.Mahmoud@acud.eg">Hamada.Mahmoud@acud.eg</a><Button asChild className="mt-auto h-auto w-full whitespace-normal bg-primary-foreground py-3 text-primary hover:bg-gold hover:text-gold-foreground"><a href="mailto:Hamada.Mahmoud@acud.eg">{t("sendEmail")}<ArrowLeft /></a></Button></article>
                  <article className="slide-item from-end pop-card flex flex-col items-center gap-5 rounded-xl p-8"><MessageCircle className="pop-icon size-10" /><h3 className="text-2xl font-bold">{t("whatsapp")}</h3><a className="font-bold text-gold" dir="ltr" href="tel:01200882137">01200882137</a><Button asChild className="auth-primary-action mt-auto h-auto w-full whitespace-normal py-3"><a href="https://wa.me/201200882137" target="_blank" rel="noreferrer">{t("whatsappChat")}<ArrowLeft /></a></Button></article>
                </div>
              </div>
            </Reveal>
          </div>
        </main>
        <SiteFooter />
      </div>
      <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false" />
      <ImportedAsideEditWithLovable />
    </>
  );
}


function DeveloperSection() {
  const { t } = useI18n();
  return (
    <section className="portal-services mx-auto grid max-w-3xl px-4 py-12">
      <Link className={"flex flex-col items-center \x72ounded \x62g-card p-10 text-center \x73hadow-md transition \x68over:\x73hadow-xl"} to="/environmental-license">
        <Leaf className="h-16 w-16 text-primary" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-bold">{t("envTitle")}</h2>
        <span className="mt-4 font-semibold text-primary">{t("envCta")}</span>
      </Link>
    </section>
  );
}

function ImportedSection() {
  const { t } = useI18n();
  return (
    <section className="portal-services mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
      <Link className={"flex flex-col items-center \x72ounded \x62g-card p-8 text-center \x73hadow-md transition \x68over:\x2dtranslate-y-1 \x68over:\x73hadow-xl"} to="/my/new-request">
        <svg className="h-16 w-16 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 12h4" />
          <path d="M10 8h4" />
          <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
          <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
          <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        </svg>
        <h2 className="mt-5 text-xl font-bold">{t("cardNew")}</h2>
      </Link>
      <Link className={"flex flex-col items-center \x72ounded \x62g-card p-8 text-center \x73hadow-md transition \x68over:\x2dtranslate-y-1 \x68over:\x73hadow-xl"} to="/my/renew-license">
        <svg className="h-16 w-16 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="m9 14 2 2 4-4" />
        </svg>
        <h2 className="mt-5 text-xl font-bold">{t("cardRenew")}</h2>
      </Link>
      <Link className={"flex flex-col items-center \x72ounded \x62g-card p-8 text-center \x73hadow-md transition \x68over:\x2dtranslate-y-1 \x68over:\x73hadow-xl"} to="/my/amend-license">
        <svg className="h-16 w-16 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
          <path d="M14 2v5a1 1 0 0 0 1 1h5" />
          <circle cx="11.5" cy="14.5" r="2.5" />
          <path d="M13.3 16.3 15 18" />
        </svg>
        <h2 className="mt-5 text-xl font-bold">{t("cardAmend")}</h2>
      </Link>
      <Link className={"flex flex-col items-center \x72ounded \x62g-card p-8 text-center \x73hadow-md transition \x68over:\x2dtranslate-y-1 \x68over:\x73hadow-xl"} to="/my/requests">
        <svg className="h-16 w-16 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
        </svg>
        <h2 className="mt-5 text-xl font-bold">{t("reviewRequests")}</h2>
      </Link>
      <Button asChild variant="ghost" className="h-auto whitespace-normal p-8 [&_svg]:size-16"><Link className={"flex flex-col items-center \x72ounded \x62g-card p-8 text-center \x73hadow-md transition \x68over:\x2dtranslate-y-1 \x68over:\x73hadow-xl"} to="/faq">
        <svg className="h-16 w-16 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
        </svg>
        <h2 className="mt-5 text-xl font-bold">{t("faq")}</h2>
      </Link></Button>
      <Button asChild variant="ghost" className="h-auto whitespace-normal p-8 [&_svg]:size-16"><Link className={"flex flex-col items-center \x72ounded \x62g-card p-8 text-center \x73hadow-md transition \x68over:\x2dtranslate-y-1 \x68over:\x73hadow-xl"} to="/complaints">
        <svg className="h-16 w-16 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
        </svg>
        <h2 className="mt-5 text-xl font-bold">{t("complaints")}</h2>
      </Link></Button>
    </section>
  );
}

function ImportedAsideEditWithLovable() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <aside className="normal-case! [will-change:transform,opacity]" id="lovable-badge" role="complementary" dir="ltr" lang="en" aria-label="Edit with Lovable"><a aria-label="Edit with Lovable" href="https://lovable.dev/projects/lovp_4z8y3w110d8d1bbhrbh7kfcp2e?utm_source=lovable-badge" id="lovable-badge-cta" rel="noopener nofollow" target="_blank">{"\n\t\t"}<span id="lovable-badge-text">Edit with</span>{"\n\t\t"}<span id="lovable-badge-logo"><svg xmlns="http://www.w3.org/2000/svg" width="52" height="16" fill="none" viewBox="0 0 52 16">{"\n  "}<path fill="#FCFBF8" fillRule="evenodd" d="M20.318 5.25c.643 0 1.206.14 1.69.418a2.81 2.81 0 0 1 1.118 1.191c.266.513.4 1.115.4 1.807s-.134 1.296-.4 1.812a2.81 2.81 0 0 1-1.118 1.193c-.484.278-1.047.418-1.69.418s-1.208-.14-1.695-.418a2.85 2.85 0 0 1-1.125-1.193c-.262-.516-.393-1.12-.393-1.812s.131-1.294.393-1.807a2.848 2.848 0 0 1 1.125-1.191c.487-.279 1.052-.418 1.695-.418Zm0 1.425c-.27 0-.504.076-.7.228-.193.147-.34.37-.443.67-.102.295-.153.66-.153 1.093 0 .435.05.801.153 1.1.102.3.25.524.443.676.196.147.43.22.7.22.27 0 .502-.073.694-.22.193-.152.341-.375.443-.67.103-.299.153-.667.153-1.106 0-.65-.112-1.145-.337-1.481a1.08 1.08 0 0 0-.953-.51ZM32.7 5.25c.61 0 1.127.1 1.549.3.422.197.74.48.953.849.217.368.325.809.325 1.32v2.704c0 .29.02.562.062.812.044.245.108.4.19.466V12h-1.935a5.895 5.895 0 0 1-.105-.684 7.745 7.745 0 0 1-.02-.228 2.293 2.293 0 0 1-.151.203c-.205.242-.47.437-.793.584-.32.143-.685.215-1.094.215-.406 0-.77-.08-1.094-.24a1.845 1.845 0 0 1-.756-.682 1.984 1.984 0 0 1-.27-1.045c0-.606.178-1.069.535-1.388.356-.324.87-.534 1.542-.633l1.125-.16c.225-.032.403-.074.534-.123a.622.622 0 0 0 .288-.196.549.549 0 0 0 .093-.327.65.65 0 0 0-.11-.367.702.702 0 0 0-.32-.27c-.14-.07-.31-.105-.51-.105-.32 0-.576.083-.768.251-.193.164-.298.39-.314.676h-1.923c.016-.434.147-.82.393-1.155.25-.34.596-.604 1.039-.792.442-.189.954-.283 1.535-.283Zm.99 3.498a.98.98 0 0 1-.215.14 2.49 2.49 0 0 1-.584.178l-.473.092c-.315.061-.553.156-.713.283-.155.127-.233.305-.233.534 0 .23.084.412.252.547.168.135.383.203.645.203s.494-.058.694-.173c.201-.118.355-.282.461-.49.11-.21.166-.448.166-.714v-.6Zm4.526-2.375c.065-.125.138-.243.221-.349.197-.25.437-.44.719-.571.282-.135.6-.203.952-.203.528 0 .988.138 1.377.412.389.275.688.67.896 1.186.21.512.314 1.12.314 1.824 0 .7-.107 1.309-.32 1.825-.213.512-.518.906-.915 1.18-.393.275-.854.412-1.383.412-.352 0-.667-.062-.946-.184a1.832 1.832 0 0 1-.7-.554 2.2 2.2 0 0 1-.234-.383V12h-1.843V3h1.862v3.373Zm1.284.296c-.274 0-.51.085-.707.253-.192.163-.338.397-.436.7a3.376 3.376 0 0 0-.148 1.05c0 .406.05.759.148 1.058.098.299.243.53.436.694.197.164.433.246.707.246.279 0 .512-.082.7-.246.193-.164.336-.395.43-.694.099-.3.148-.652.148-1.058 0-.405-.05-.757-.147-1.056-.095-.299-.238-.53-.43-.694a1.015 1.015 0 0 0-.7-.253Zm9.416-1.419c.602 0 1.136.131 1.604.393.466.262.829.643 1.086 1.143.263.5.394 1.097.394 1.794 0 .25-.002.449-.006.596H47.51c.018.288.071.538.164.75a1.3 1.3 0 0 0 .491.596c.214.13.465.196.757.196.319 0 .583-.082.792-.246.209-.167.34-.403.393-.706h1.862a2.48 2.48 0 0 1-.485 1.235 2.54 2.54 0 0 1-1.051.805c-.439.188-.949.283-1.53.283-.655 0-1.225-.125-1.708-.375a2.672 2.672 0 0 1-1.13-1.143c-.267-.508-.4-1.137-.4-1.887 0-.712.14-1.327.418-1.843a2.86 2.86 0 0 1 1.155-1.186c.491-.27 1.051-.405 1.678-.405Zm-.044 1.345c-.274 0-.516.068-.725.203a1.29 1.29 0 0 0-.479.59 2.045 2.045 0 0 0-.132.498h2.562a1.873 1.873 0 0 0-.138-.602 1.061 1.061 0 0 0-.418-.516 1.243 1.243 0 0 0-.67-.173Z" clipRule="evenodd" />{"\n  "}<path fill="#FCFBF8" d="m26.605 9.995 1.342-4.566h1.924L27.628 12h-2.07l-2.33-6.57h1.98l1.397 4.565Zm-13.013.143h2.256c1.632 0 1.421 1.837 1.418 1.861h-5.603V3h1.93v7.138Zm31.516 1.861h-1.862V3h1.862v8.999Z" />{"\n  "}<path fill="url(#a)" fillRule="evenodd" d="M2.7 3c1.492 0 2.7 1.192 2.7 2.663v1.012h.9c1.49 0 2.7 1.192 2.7 2.662S7.791 12 6.3 12H0V5.663C0 4.193 1.209 3 2.7 3Z" clipRule="evenodd" />{"\n  "}<defs><radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="matrix(-1.54236 7.07838 -10.231 -2.15602 4.627 5.022)" gradientUnits="userSpaceOnUse"><stop offset=".106" stopColor="#FE7B02" /><stop offset=".394" stopColor="#FE3F21" /><stop offset=".608" stopColor="#F858BC" /><stop offset=".929" stopColor="#575ECF" /></radialGradient></defs>{"\n"}</svg>{"\n\n"}</span>{"\n\t"}</a><span id="lovable-badge-divider" aria-hidden="true" /><button id="lovable-badge-close" onClick={() => setDismissed(true)} aria-label="Dismiss" title="Dismiss" type="button">{"\n\t\t"}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">{"\n\t\t\t"}<path d="M10.646 4.646a.5.5 0 1 1 .707.708L8.707 8l2.646 2.646a.5.5 0 1 1-.707.707L8 8.707l-2.646 2.646a.5.5 0 1 1-.708-.707L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708L8 7.293l2.646-2.647Z" />{"\n\t\t"}</svg>{"\n\t"}</button></aside>
  );
}
