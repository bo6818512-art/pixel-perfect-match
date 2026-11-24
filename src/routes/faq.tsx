import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PortalFrame, portalHead } from "@/components/portal-frame";
import { supportSchema } from "@/lib/support-schema";
import { submitSupport } from "@/lib/support.functions";

export const Route = createFileRoute("/faq")({
  head: () => portalHead("استفسارات والاسئلة الشائعة", "الاسئلة الشائعة وإرسال سؤال جديد أو ملاحظات لبوابة التراخيص."),
  staticData: { importedDocument: { html: { dir: "rtl", lang: "ar" } } },
  component: SupportPage,
});

function SupportPage() {
  const send = useServerFn(submitSupport);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    const form = event.currentTarget;
    const fields = new FormData(form);
    const result = supportSchema.safeParse({
      kind: fields.get("kind"), name: fields.get("name"), email: fields.get("email"),
      phone: fields.get("phone") ?? "", complaintType: fields.get("complaintType") ?? "", message: fields.get("message"),
    });
    if (!result.success) { setError(result.error.issues[0]?.message ?? "يرجى مراجعة البيانات"); return; }
    setPending(true);
    try {
      const response = await send({ data: result.data });
      setReference(response.reference);
      form.reset();
    } catch { setError("لم يتم حفظ الرسالة. يرجى المحاولة مرة أخرى."); }
    finally { setPending(false); }
  }
  return <PortalFrame title="استفسارات والاسئلة الشائعة">
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-bold">الاسئلة الشائعة</h2>
        {[
          ["كيف أبدأ طلب ترخيص؟", "من الصفحة الرئيسية، اختر خدمة الترخيص المناسبة ثم تقديم طلب ترخيص."],
          ["أين أجد طلباتي السابقة؟", "من قائمة ملفاتي، اختر مراجعة الطلبات أو تراخيصي السابقة."],
          ["كيف أرسل شكوى؟", "افتح صفحة شكاوي وأكمل بيانات التواصل ونوع الشكوى وتفاصيلها."],
        ].map(([question, answer]) => <details key={question} className="border-b border-border py-4"><summary className="cursor-pointer font-bold text-primary">{question}</summary><p className="mt-3 leading-relaxed text-muted-foreground">{answer}</p></details>)}
      </section>
      <section>
        <h2 className="mb-6 text-xl font-bold">سؤال جديد أو ملاحظات</h2>
        {reference ? <div role="status" className="space-y-4 border-s-4 border-primary bg-background p-6">
          <CheckCircle2 className="text-primary" />
          <p className="font-bold">تم حفظ سؤالك أو ملاحظاتك بنجاح</p>
          <p className="text-sm text-muted-foreground">رقم الرسالة: <span dir="ltr" className="break-all">{reference}</span></p>
          <Button variant="outline" onClick={() => setReference("")}>إرسال رسالة أخرى</Button>
        </div> : <form onSubmit={submit} className="space-y-6">
          <fieldset disabled={pending} className="grid min-w-0 gap-6 sm:grid-cols-2">
          <label className="grid gap-2 font-semibold" htmlFor="name">الاسم<Input id="name" name="name" required maxLength={100} autoComplete="name" /></label>
          <label className="grid gap-2 font-semibold" htmlFor="email">البريد الإلكتروني<Input id="email" name="email" type="email" dir="ltr" required maxLength={255} autoComplete="email" /></label>
          <label className="grid gap-2 font-semibold" htmlFor="kind">نوع الرسالة<select id="kind" name="kind" defaultValue="question" className="h-11 w-full rounded-md border border-input bg-background px-3"><option value="question">سؤال جديد</option><option value="feedback">ملاحظات واقتراحات</option></select></label>
          <label className="grid gap-2 font-semibold sm:col-span-2" htmlFor="message">السؤال أو الملاحظات<Textarea id="message" name="message" required maxLength={5000} rows={6} /></label>
          </fieldset>
          {error && <p role="alert" className="text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} size="lg">{pending ? <LoaderCircle className="animate-spin" /> : <Send />}{pending ? "جارٍ الحفظ..." : "إرسال السؤال أو الملاحظات"}</Button>
        </form>}
      </section>
    </PortalFrame>;
}
