import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Home, Menu } from "lucide-react";
import { AccountControls } from "@/components/portal-auth";
import { useI18n } from "@/lib/i18n";

const item = "flex items-center gap-2 whitespace-nowrap px-4 py-4 font-bold";
const sub = "block px-5 py-2.5 font-bold";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const on = () => setScrolled((s) => (s ? window.scrollY > 8 : window.scrollY > 160));
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const toggle = (k: string) => setSubmenu(submenu === k ? null : k);
  const LangButton = ({ className = "" }: { className?: string }) => (
    <div role="group" aria-label={lang === "ar" ? "اللغة" : "Language"} className={`inline-flex items-center gap-1 rounded-full border border-current/30 px-2 py-1 text-sm font-bold ${className}`} dir="ltr">
      <Globe className="size-4" aria-hidden="true" />
      <button type="button" onClick={() => setLang("en")} aria-pressed={lang === "en"} className={`rounded-full px-2 py-0.5 transition ${lang === "en" ? "bg-gold text-gold-foreground" : "opacity-80 hover:opacity-100"}`}>EN</button>
      <span aria-hidden="true" className="opacity-50">|</span>
      <button type="button" onClick={() => setLang("ar")} aria-pressed={lang === "ar"} lang="ar" className={`rounded-full px-2 py-0.5 transition ${lang === "ar" ? "bg-gold text-gold-foreground" : "opacity-80 hover:opacity-100"}`}>عربي</button>
    </div>
  );
  return (
    <header className={`nav-in sticky top-0 z-50 ${scrolled ? "is-scrolled" : ""}`} onKeyDown={(e) => { if (e.key === "Escape") { setSubmenu(null); setMenuOpen(false); menuTrigger.current?.focus(); } }}>
      <div className={`glass-bar overflow-hidden transition-[max-height,opacity] duration-300 ${scrolled ? "max-h-0 opacity-0" : "max-h-40 opacity-100"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link className="flex items-center gap-3" to="/">
            <img className="h-auto w-44 max-w-full md:w-64" src="/site-assets/5b96e1ee2be36897.webp" alt={t("company")} />
          </Link>
          <div className="hidden text-end md:block">
            <p className="text-lg font-bold text-primary">{t("portalName")}</p>
            <p className="text-sm text-muted-foreground">{t("company")}</p>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <LangButton className="text-primary" />
            <button className="inline-flex size-9 items-center justify-center rounded-md text-primary" aria-label={t("menu")} aria-expanded={menuOpen} aria-controls="site-navigation" ref={menuTrigger} onClick={() => { setMenuOpen(!menuOpen); setSubmenu(null); }}>
              <Menu className="size-7" />
            </button>
          </div>
        </div>
      </div>
      <nav id="site-navigation" className={`glass-nav text-primary-foreground ${menuOpen ? "block" : "hidden"} md:block`}>
        <div className="mx-auto flex max-w-7xl flex-col items-stretch px-2 md:flex-row md:items-center">
          <Link className={item} to="/"><Home className="size-5" />{t("home")}</Link>
          <Link className={item} to="/inquiry">{t("inquiry")}</Link>
          <div className="group relative">
            <button className={item} aria-expanded={submenu === "files"} aria-controls="files-submenu" onClick={() => toggle("files")}>{t("myFiles")}<ChevronDown className="size-4" /></button>
            <div id="files-submenu" className={`glass-nav absolute start-0 top-full z-50 min-w-56 rounded-b-md py-2 shadow-xl transition group-hover:visible group-hover:opacity-100 ${submenu === "files" ? "visible opacity-100" : "invisible opacity-0"}`}>
              <Link className={sub} to="/my/requests">{t("reviewRequests")}</Link>
              <Link className={sub} to="/my/new-request">{t("newRequest")}</Link>
              <Link className={sub} to="/my/licenses">{t("pastLicenses")}</Link>
              <Link className={sub} to="/my/data">{lang === 'ar' ? 'بياناتي' : 'My Data'}</Link>
            </div>
          </div>
          <div className="group relative">
            <button className={item} aria-expanded={submenu === "help"} aria-controls="help-submenu" onClick={() => toggle("help")}>{t("help")}<ChevronDown className="size-4" /></button>
            <div id="help-submenu" className={`glass-nav absolute start-0 top-full z-50 min-w-56 rounded-b-md py-2 shadow-xl transition group-hover:visible group-hover:opacity-100 ${submenu === "help" ? "visible opacity-100" : "invisible opacity-0"}`}>
              <Link className={sub} to="/help">{t("portalHelp")}</Link>
              <Link className={sub} to="/faq">{t("faq")}</Link>
              <Link className={sub} to="/complaints">{t("complaints")}</Link>
            </div>
          </div>
          <Link className={item} to="/contact">{t("contact")}</Link>
          <div className="flex flex-col md:ms-auto md:flex-row md:items-center">
            <AccountControls />
            <LangButton className="mx-3 my-2 hidden md:inline-flex" />
          </div>
        </div>
      </nav>
    </header>
  );
}

export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={`reveal ${shown ? "is-visible" : ""} ${className}`} style={{ ["--reveal-delay" as string]: `${delay}ms` }}>{children}</Tag>;
}
