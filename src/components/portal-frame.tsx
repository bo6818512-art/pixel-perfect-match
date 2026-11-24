import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useI18n } from '@/lib/i18n';
import sourceCSS from "@/styles/site.css?raw";
import arabicFont from "@/assets/6c9f4bab97d6bc5f.woff2?url";
import latinFont from "@/assets/3270f0cb47fdabc3.woff2?url";
import extendedFont from "@/assets/e8fc56ad5aa556a1.woff2?url";

export const portalCss = sourceCSS.replaceAll("/site-assets/6c9f4bab97d6bc5f.woff2", arabicFont).replaceAll("/site-assets/3270f0cb47fdabc3.woff2", latinFont).replaceAll("/site-assets/e8fc56ad5aa556a1.woff2", extendedFont);

export function portalHead(title: string, description: string) {
  return { meta: [
    { title: `${title} | بوابة التراخيص ACUD` }, { name: "description", content: description },
    { property: "og:title", content: `${title} | بوابة التراخيص ACUD` }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] };
}

export function PortalFrame({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  const { t, lang, dir } = useI18n();
  return <div dir={dir} lang={lang} className="flex min-h-dvh flex-col bg-muted/30 font-sans text-foreground">
    <style>{portalCss}</style>
    <SiteHeader />
    <main className={`mx-auto w-full ${wide ? 'max-w-7xl' : 'max-w-4xl'} flex-1 px-4 py-8 md:py-12`}>
      <Button asChild variant="link" className="mb-5 px-0"><Link to="/"><ArrowRight />{t("backHome")}</Link></Button>
      <h1 className="mb-8 text-2xl font-bold text-primary md:text-3xl">{title}</h1>
      {children}
    </main>
    <SiteFooter />
  </div>;
}