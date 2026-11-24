import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { translateText } from "@/lib/page-translations";

export type Lang = "ar" | "en";

const dict = {
  home: { ar: "الرئيسية", en: "Home" },
  inquiry: { ar: "الاستعلام عن حالة طلب", en: "Track a Request" },
  myFiles: { ar: "ملفاتي", en: "My Files" },
  reviewRequests: { ar: "مراجعة الطلبات", en: "My Requests" },
  newRequest: { ar: "طلب ترخيص جديد", en: "New License Application" },
  pastLicenses: { ar: "تراخيصي السابقة", en: "My Licenses" },
  help: { ar: "مساعدة", en: "Help" },
  portalHelp: { ar: "مساعدة البوابة", en: "Portal Guide" },
  contact: { ar: "تواصل معنا", en: "Contact Us" },
  faq: { ar: "استفسارات والاسئلة الشائعة", en: "Questions & FAQ" },
  complaints: { ar: "شكاوي", en: "Complaints" },
  menu: { ar: "القائمة", en: "Menu" },
  portalName: { ar: "بوابة التراخيص المحال التجارية العامة", en: "Commercial Shops Licensing Portal" },
  company: { ar: "شركة العاصمة الإدارية للتنمية العمرانية", en: "Administrative Capital for Urban Development" },
  newUser: { ar: "مستخدم جديد", en: "Register" },
  signIn: { ar: "تسجيل دخول", en: "Sign In" },
  signOut: { ar: "تسجيل خروج", en: "Sign Out" },
  myAccount: { ar: "حسابي", en: "My Account" },
  adminPanel: { ar: "لوحة الإدارة", en: "Admin Dashboard" },
  switchLang: { ar: "English", en: "العربية" },
  news: { ar: "أحدث الأخبار", en: "Latest News" },
  news1: { ar: "شركة العاصمة الإدارية للتنمية العمرانية تتيح تقديم طلبات تراخيص البناء إلكترونياً بالكامل", en: "ACUD now accepts licensing applications fully online" },
  news2: { ar: "للاستفسار يرجى التواصل على 01200882137 أو 01288016561", en: "For enquiries, call 01200882137 or 01288016561" },
  heroTitle: { ar: "شركة العاصمة الادارية للتنمية العمرانية", en: "Administrative Capital for Urban Development" },
  heroText: { ar: "بوابة التراخيص المحال التجارية العامة — اختر المنطقة والقطعة، وقدّم طلب الترخيص وتابع حالته.", en: "The commercial shops licensing portal — choose your district and unit, apply for a license and follow its progress." },
  heroCta: { ar: "تقديم طلب ترخيص محال عامة", en: "Apply for a Shop License" },
  cardNew: { ar: "طلب ترخيص المحال التجارية العامة", en: "Commercial Shop License Application" },
  cardRenew: { ar: "تجديد ترخيص المحال العامة", en: "Renew a Shop License" },
  cardAmend: { ar: "تعديل نشاط أو نقل ملكية", en: "Change Activity or Transfer Ownership" },
  envTitle: { ar: "التراخيص البيئية للمشروعات بالعاصمة الإدارية الجديدة", en: "Environmental Permits for New Capital Projects" },
  envCta: { ar: "إصدار التراخيص البيئية للمشروعات بالعاصمة الإدارية ←", en: "Issue an environmental permit →" },
  supportEyebrow: { ar: "الدعم والمساعدة", en: "Help & Support" },
  supportTitle: { ar: "للتواصل والدعم الفني", en: "Get Technical Support" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  sendEmail: { ar: "إرسال بريد إلكتروني", en: "Send an Email" },
  whatsapp: { ar: "الدعم عبر واتساب", en: "WhatsApp Support" },
  whatsappChat: { ar: "محادثة واتساب", en: "Chat on WhatsApp" },
  footerAbout: { ar: "شركة العاصمة الإدارية للتنمية العمرانية تقود رؤية مصر للتنمية العمرانية المستدامة والمبتكرة.", en: "The Administrative Capital for Urban Development (ACUD) is driving Egypt's vision for sustainable urban innovation." },
  quickLinks: { ar: "روابط سريعة", en: "Quick Links" },
  contactDetails: { ar: "بيانات التواصل", en: "Contact Details" },
  workingHours: { ar: "مواعيد العمل:", en: "Working Hours:" },
  hours: { ar: "الأحد - الخميس: 09:00 ص - 03:00 م", en: "Sunday - Thursday: 09:00 - 15:00" },
  rights: { ar: "© 2026 شركة العاصمة الإدارية للتنمية العمرانية. جميع الحقوق محفوظة.", en: "© 2026 Administrative Capital for Urban Development (ACUD). All Rights Reserved." },
  backHome: { ar: "الرئيسية", en: "Home" },
  contactHeroText: { ar: "سواء كنت مواطناً أو مستثمراً أو شريكاً أو زائراً، فريقنا جاهز للرد على استفساراتك ومساندتك في خطوتك القادمة.", en: "Whether you are a resident, investor, partner or visitor, our team is ready to answer your questions and support your next step." },
  getInTouch: { ar: "نحن هنا لمساعدتك", en: "We are here to help" },
  getInTouchText: { ar: "تواصل معنا عبر أي من القنوات التالية، أو أرسل رسالتك وسنعود إليك في أقرب وقت.", en: "Reach us through any of the channels below, or send a message and we'll get back to you shortly." },
  callUs: { ar: "اتصل بنا", en: "Call Us" },
  visitUs: { ar: "زورونا", en: "Visit Us" },
  address: { ar: "العاصمة الإدارية الجديدة، القاهرة، مصر", en: "New Capital, Cairo, Egypt" },
  businessHours: { ar: "مواعيد العمل", en: "Business Hours" },
  followUs: { ar: "تابعونا على مواقع التواصل", en: "Follow us on social media" },
  sendMessage: { ar: "أرسل لنا رسالة", en: "Send us a message" },
  fullName: { ar: "الاسم بالكامل", en: "Full Name" },
  phone: { ar: "رقم الهاتف", en: "Phone Number" },
  subject: { ar: "الموضوع", en: "Subject" },
  chooseSubject: { ar: "اختر الموضوع", en: "Select a subject" },
  subjGeneral: { ar: "استفسار عام", en: "General Inquiry" },
  subjInvest: { ar: "استثمار", en: "Investment" },
  subjPartner: { ar: "شراكة", en: "Partnership" },
  subjSupport: { ar: "الدعم الفني", en: "Support" },
  subjOther: { ar: "أخرى", en: "Other" },
  message: { ar: "رسالتك", en: "Your Message" },
  send: { ar: "إرسال الرسالة", en: "Send Message" },
  sending: { ar: "جارٍ الإرسال…", en: "Sending…" },
  sent: { ar: "شكراً لك! تم استلام رسالتك بنجاح وسيتواصل معك فريقنا قريباً.", en: "Thank you! Your message has been received and our team will contact you soon." },
  sendFailed: { ar: "لم يتم إرسال الرسالة. راجع البيانات وحاول مرة أخرى.", en: "Your message could not be sent. Please check the details and try again." },
  marqueeA: { ar: "بوابة التراخيص المحال التجارية العامة", en: "Commercial Shops Licensing Portal" },
  marqueeB: { ar: "شركة العاصمة الإدارية للتنمية العمرانية", en: "Administrative Capital for Urban Development" },
  location: { ar: "موقع الشركة على الخريطة", en: "Our location on the map" },
} as const;

export type TKey = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string; dir: "rtl" | "ltr" }>({
  lang: "en", setLang: () => {}, t: (k) => dict[k].en, dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const saved = window.localStorage.getItem("portal-lang");
    if (saved === "en" || saved === "ar") setLangState(saved);
    setReady(true);
  }, []);
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  useLayoutEffect(() => {
    if (!ready) return;
    const stop = translatePage(lang);
    document.documentElement.classList.remove("i18n-pending");
    return stop;
  }, [lang, ready]);
  const setLang = (l: Lang) => { setLangState(l); window.localStorage.setItem("portal-lang", l); };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[k][lang], dir: lang === "ar" ? "rtl" : "ltr" }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

const ATTRS = ["placeholder", "title", "aria-label"] as const;
const originals = new WeakMap<Node, string>();
const shownText = new WeakMap<Node, string>();
const attrOriginals = new WeakMap<Element, Record<string, string>>();
const translatedNodes = new Set<Node>();
const translatedEls = new Set<Element>();

function translateTextNode(node: Text) {
  const current = node.nodeValue ?? "";
  if (shownText.get(node) === current) return;
  const next = translateText(current);
  if (next === current) return;
  originals.set(node, current); shownText.set(node, next); translatedNodes.add(node);
  node.nodeValue = next;
}
function translateElementAttrs(el: Element) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a); if (!v) continue;
    const saved = attrOriginals.get(el) ?? {};
    if (saved[`${a}:shown`] === v) continue;
    const next = translateText(v); if (next === v) continue;
    saved[a] = v; saved[`${a}:shown`] = next; attrOriginals.set(el, saved); translatedEls.add(el);
    el.setAttribute(a, next);
  }
}
function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) return translateTextNode(root as Text);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (el.closest("script,style,textarea,[data-no-translate]")) return;
  translateElementAttrs(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n: Node | null = tw.nextNode();
  while (n) {
    if (n.nodeType === Node.TEXT_NODE) translateTextNode(n as Text);
    else if (!(n as Element).matches("script,style,textarea")) translateElementAttrs(n as Element);
    n = tw.nextNode();
  }
}

/** Swaps Arabic page text for meaning-based English while English is selected, and restores it afterwards. */
function translatePage(lang: Lang) {
  if (lang !== "en") {
    translatedNodes.forEach((n) => { const o = originals.get(n); if (o !== undefined && n.nodeValue === shownText.get(n)) n.nodeValue = o; shownText.delete(n); });
    translatedEls.forEach((el) => { const s = attrOriginals.get(el); if (!s) return; for (const a of ATTRS) if (s[a] && el.getAttribute(a) === s[`${a}:shown`]) el.setAttribute(a, s[a]); attrOriginals.delete(el); });
    translatedNodes.clear(); translatedEls.clear();
    return;
  }
  let title = "";
  const doTitle = () => { if (document.title !== title) { title = translateText(document.title); document.title = title; } };
  walk(document.body); doTitle();
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "characterData") translateTextNode(r.target as Text);
      else if (r.type === "attributes") translateElementAttrs(r.target as Element);
      else r.addedNodes.forEach(walk);
    }
    doTitle();
  });
  mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  const titleMo = new MutationObserver(doTitle);
  titleMo.observe(document.head, { subtree: true, childList: true, characterData: true });
  return () => { mo.disconnect(); titleMo.disconnect(); };
}
