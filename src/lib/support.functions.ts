import { createServerFn } from "@tanstack/react-start";
import { supportSchema } from "./support-schema";

export const submitSupport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => supportSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const id = crypto.randomUUID();
    const { error } = await supabaseAdmin.from("support_submissions").insert({
      id, kind: data.kind, name: data.name, email: data.email,
      phone: data.phone, complaint_type: data.complaintType, message: data.message,
    });
    if (error) throw new Error("لم يتم حفظ الرسالة. يرجى المحاولة مرة أخرى.");
    return { reference: id };
  });