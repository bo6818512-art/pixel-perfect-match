import { describe, expect, it } from "vitest";
import { translateText } from "@/lib/page-translations";

describe("page translations", () => {
  it("translates known phrases by meaning and keeps spacing", () => {
    expect(translateText(" مراجعة الطلبات ")).toBe(" My Requests ");
  });
  it("translates phrases with changing numbers", () => {
    expect(translateText("تم رفع 5 من 12 مستندًا…")).toBe("Uploaded 5 of 12 documents…");
  });
  it("leaves unknown or non-Arabic text unchanged", () => {
    expect(translateText("ACUD")).toBe("ACUD");
  });
});
