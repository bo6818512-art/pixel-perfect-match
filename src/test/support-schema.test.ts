import { describe, expect, it } from "vitest";
import { supportSchema } from "@/lib/support-schema";

const complaint = { kind: "complaint", name: "Test", email: "test@example.com", phone: "01234567890", complaintType: "أخرى", message: "Test complaint" };
describe("Support submissions", () => {
  it("requires a complaint name", () => { expect(supportSchema.safeParse({ ...complaint, name: "" }).success).toBe(false); });
  it("requires a valid complaint email", () => { expect(supportSchema.safeParse({ ...complaint, email: "invalid" }).success).toBe(false); });
  it("requires a complaint contact number", () => { expect(supportSchema.safeParse({ ...complaint, phone: "" }).success).toBe(false); });
  it("requires a complaint type", () => { expect(supportSchema.safeParse({ ...complaint, complaintType: "" }).success).toBe(false); });
  it("requires complaint content", () => { expect(supportSchema.safeParse({ ...complaint, message: " " }).success).toBe(false); });
  it("accepts complete complaints", () => { expect(supportSchema.safeParse(complaint).success).toBe(true); });
  it("allows questions without complaint-specific fields", () => { expect(supportSchema.safeParse({ ...complaint, kind: "question", phone: "", complaintType: "" }).success).toBe(true); });
});