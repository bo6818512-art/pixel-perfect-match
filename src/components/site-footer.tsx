import { Link } from "@tanstack/react-router";
import { Clock, Mail, Phone } from "lucide-react";
import { useI18n, type TKey } from "@/lib/i18n";
import { Reveal } from "@/components/site-header";

export const socials = [
  { name: "Facebook", href: "https://www.facebook.com/share/15UhLNtPjm/?mibextid=wwXIfr", path: "M14 9V7c0-.8.5-1 1-1h2V3h-3c-2.8 0-3.5 2-3.5 3.5V9H8v3h2.5v9H14v-9h2.6l.4-3z" },
  { name: "Instagram", href: "https://www.instagram.com/acud.eg?igsh=bWh1M2M2cGkwMG0=", path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/administrative-capital-for-urban-development/", path: "M4 9h3.5v11H4zM5.7 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h3.3v1.6c.5-.9 1.7-1.9 3.5-1.9 3.6 0 4.2 2.3 4.2 5.4V20h-3.5v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20H10z" },
  { name: "YouTube", href: "https://youtube.com/@administrativecapital?si=he-FDIx7JlusoLiC", path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" },
  { name: "TikTok", href: "https://www.tiktok.com/@acud.egypt?_t=8sVmyZROQT3&_r=1", path: "M16.5 3c.3 2 1.6 3.4 3.5 3.6v3.1a7 7 0 0 1-3.5-1v6.2A5.9 5.9 0 1 1 10.6 9v3.2a2.8 2.8 0 1 0 2.8 2.8V3z" },
];

export function SocialIcons({ tone = "light" }: { tone?: "light" | "brand" }) {
  return <div className="flex flex-wrap gap-2">{socials.map((s) => (
    <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name} className={`grid size-10 place-items-center rounded-full transition hover:-translate-y-1 ${tone === "brand" ? "bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground" : "bg-primary-foreground/10 text-primary-foreground hover:bg-gold hover:text-gold-foreground"}`}>
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
    </a>))}</div>;
}

const links: { to: "/" | "/inquiry" | "/my/requests" | "/my/new-request" | "/my/licenses" | "/help" | "/faq" | "/complaints" | "/contact"; k: TKey }[] = [
  { to: "/", k: "home" }, { to: "/inquiry", k: "inquiry" }, { to: "/my/requests", k: "reviewRequests" },
  { to: "/my/new-request", k: "newRequest" }, { to: "/my/licenses", k: "pastLicenses" }, { to: "/help", k: "portalHelp" },
  { to: "/faq", k: "faq" }, { to: "/complaints", k: "complaints" }, { to: "/contact", k: "contact" },
];

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto shrink-0 overflow-hidden bg-primary text-primary-foreground">
      <Reveal className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="footer-slide-start space-y-5">
          <img className="h-auto w-60 max-w-full" src="/site-assets/a96b6a4ba5fd95e8.webp" alt="ACUD" loading="lazy" />
          <p className="max-w-sm text-sm leading-7 opacity-85">{t("footerAbout")}</p>
          <SocialIcons />
        </div>
        <div className="footer-slide-up">
          <h3 className="mb-5 text-lg font-bold text-gold">{t("quickLinks")}</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-1">
            {links.map((l) => <li key={l.to}><Link to={l.to} className="opacity-85 transition hover:text-gold hover:opacity-100">{t(l.k)}</Link></li>)}
          </ul>
        </div>
        <div className="footer-slide-end">
          <h3 className="mb-5 text-lg font-bold text-gold">{t("contactDetails")}</h3>
          <ul className="space-y-4 text-sm">
            <li><a className="flex items-center gap-3 hover:text-gold" href="tel:01200882137"><Phone className="size-4 text-gold" /><span dir="ltr">01200882137</span></a></li>
            <li><a className="flex items-center gap-3 hover:text-gold" href="mailto:Hamada.Mahmoud@acud.eg"><Mail className="size-4 text-gold" /><span dir="ltr">Hamada.Mahmoud@acud.eg</span></a></li>
            <li className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-gold" /><span><b className="block">{t("workingHours")}</b>{t("hours")}</span></li>
          </ul>
        </div>
      </Reveal>
      <p className="border-t border-primary-foreground/15 px-4 py-5 text-center text-xs opacity-75">{t("rights")}</p>
    </footer>
  );
}
