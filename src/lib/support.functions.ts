import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { supportSchema } from "./support-schema";

export const submitSupport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => supportSchema.parse(input))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!url || !key) throw new Error("تعذر الاتصال بالخدمة. يرجى المحاولة لاحقاً.");
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const id = crypto.randomUUID();
    const { error } = await client.from("support_submissions").insert({
      id, kind: data.kind, name: data.name, email: data.email,
      phone: data.phone, complaint_type: data.complaintType, message: data.message,
    });
    if (error) throw new Error("لم يتم حفظ الرسالة. يرجى المحاولة مرة أخرى.");
    return { reference: id };
  });