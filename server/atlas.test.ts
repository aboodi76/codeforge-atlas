import { describe, expect, it } from "vitest";
import {
  buildAtlasAnalysisPrompt,
  clipAtlasInput,
  parseAtlasReport,
  redactPotentialSecrets,
} from "./atlas";

describe("CodeForge Atlas input safeguards", () => {
  it("redacts common inline credentials before prompting a model", () => {
    expect(redactPotentialSecrets("API_KEY=abc123\nAuthorization: Bearer token-value")).toContain("[REDACTED]");
    expect(redactPotentialSecrets("API_KEY=abc123")).not.toContain("abc123");
  });

  it("clips overlong context with a visible truncation marker", () => {
    const clipped = clipAtlasInput("a".repeat(20), 10);
    expect(clipped).toContain("[TRUNCATED BY CODEFORGE ATLAS]");
  });

  it("creates an evidence-first analysis prompt", () => {
    const prompt = buildAtlasAnalysisPrompt({
      language: "typescript",
      changeIntent: "Make checkout calculation safer",
      artifacts: [{ filename: "checkout.ts", language: "typescript", content: "export const total = 1;" }],
    });
    expect(prompt).toContain("FILE: checkout.ts");
    expect(prompt).toContain("Make checkout calculation safer");
  });

  it("validates structured Atlas reports", () => {
    const parsed = parseAtlasReport(
      JSON.stringify({
        title: "Checkout impact",
        systemSummary: "A small payment module.",
        confidence: "medium",
        evidence: [],
        assumptions: [],
        systemMap: { nodes: [], links: [] },
        changeImpact: [],
        review: [],
        documentation: { docstrings: "", readme: "" },
        unitTests: { framework: "vitest", content: "", notes: "" },
        followUpQuestions: [],
      })
    );
    expect(parsed.title).toBe("Checkout impact");
  });

  it("rejects malformed analysis payloads instead of passing unreliable reports to users", () => {
    expect(() => parseAtlasReport(JSON.stringify({ title: "Incomplete" }))).toThrow();
  });

  it("accepts a fenced JSON response from a compliant model", () => {
    const report = {
      title: "Checkout impact",
      systemSummary: "A small payment module.",
      confidence: "low",
      evidence: [],
      assumptions: [],
      systemMap: { nodes: [], links: [] },
      changeImpact: [],
      review: [],
      documentation: { docstrings: "", readme: "" },
      unitTests: { framework: "vitest", content: "", notes: "" },
      followUpQuestions: ["Which caller owns the discount value?"],
    };
    expect(parseAtlasReport(`\`\`\`json\n${JSON.stringify(report)}\n\`\`\``).confidence).toBe("low");
  });
});
