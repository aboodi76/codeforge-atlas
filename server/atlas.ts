import { z } from "zod";

export const ATLAS_DEEP_MODEL = "gpt-5";
export const ATLAS_CHAT_MODEL = "gpt-5-mini";
export const MAX_ATLAS_CODE_CHARS = 50_000;

export const atlasReportSchema = z.object({
  title: z.string(),
  systemSummary: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(
    z.object({
      file: z.string(),
      fragment: z.string(),
      explanation: z.string(),
    })
  ),
  assumptions: z.array(
    z.object({
      claim: z.string(),
      whyItMatters: z.string(),
      validation: z.string(),
    })
  ),
  systemMap: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      label: z.string(),
      kind: z.enum(["source", "module", "rule", "test", "external"]),
      confidence: z.enum(["low", "medium", "high"]),
    })),
    links: z.array(z.object({ from: z.string(), to: z.string(), relationship: z.string() })),
  }),
  changeImpact: z.array(
    z.object({
      area: z.string(),
      risk: z.enum(["low", "medium", "high"]),
      reason: z.string(),
      verification: z.string(),
    })
  ),
  review: z.array(
    z.object({
      severity: z.enum(["info", "low", "medium", "high"]),
      title: z.string(),
      explanation: z.string(),
      fix: z.string(),
    })
  ),
  documentation: z.object({
    docstrings: z.string(),
    readme: z.string(),
  }),
  unitTests: z.object({
    framework: z.string(),
    content: z.string(),
    notes: z.string(),
  }),
  followUpQuestions: z.array(z.string()),
});

export type AtlasReport = z.infer<typeof atlasReportSchema>;

const potentialSecretPatterns = [
  /((?:api[_-]?key|secret|password|token)\s*[:=]\s*)[^\s,;"']+/gi,
  /(bearer\s+)[a-z0-9\-._~+/]+=*/gi,
];

export function redactPotentialSecrets(value: string) {
  return potentialSecretPatterns.reduce(
    (redacted, pattern) => redacted.replace(pattern, "$1[REDACTED]"),
    value
  );
}

export function clipAtlasInput(value: string, maxLength = MAX_ATLAS_CODE_CHARS) {
  const redacted = redactPotentialSecrets(value);
  return redacted.length > maxLength
    ? `${redacted.slice(0, maxLength)}\n\n[TRUNCATED BY CODEFORGE ATLAS]`
    : redacted;
}

export function buildAtlasAnalysisPrompt(input: {
  language: string;
  changeIntent: string;
  artifacts: Array<{ filename: string; language: string; content: string }>;
}) {
  const files = input.artifacts
    .map(
      artifact =>
        `FILE: ${artifact.filename}\nLANGUAGE: ${artifact.language}\n---\n${clipAtlasInput(artifact.content)}\n---`
    )
    .join("\n\n");

  return `Analyze the supplied code as CodeForge Atlas. The developer's intended change is: ${clipAtlasInput(input.changeIntent, 2_000)}.

Return only factual findings that can be supported by the supplied artifacts. Place directly supported claims in evidence. Put every inference that is not directly supported in assumptions, including why it matters and how to validate it. Create a compact systemMap containing only entities visible in the supplied artifacts; do not invent unseen modules. Clearly use low confidence and follow-up questions when the material is insufficient. Do not claim to have executed code, inspected external repositories, or verified runtime behavior. Prioritize change impact, code quality, potential defects, documentation, and practical unit tests.

${files}`;
}

export function parseAtlasReport(value: unknown): AtlasReport {
  if (typeof value !== "string") throw new Error("The analysis response was empty");

  const normalized = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return atlasReportSchema.parse(JSON.parse(normalized));
}

export const atlasResponseFormat = {
  type: "json_schema" as const,
  json_schema: {
    name: "codeforge_atlas_report",
    strict: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        systemSummary: { type: "string" },
        confidence: { type: "string", enum: ["low", "medium", "high"] },
        evidence: {
          type: "array",
          items: {
            type: "object",
            properties: {
              file: { type: "string" },
              fragment: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["file", "fragment", "explanation"],
            additionalProperties: false,
          },
        },
        assumptions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              claim: { type: "string" },
              whyItMatters: { type: "string" },
              validation: { type: "string" },
            },
            required: ["claim", "whyItMatters", "validation"],
            additionalProperties: false,
          },
        },
        systemMap: {
          type: "object",
          properties: {
            nodes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  kind: { type: "string", enum: ["source", "module", "rule", "test", "external"] },
                  confidence: { type: "string", enum: ["low", "medium", "high"] },
                },
                required: ["id", "label", "kind", "confidence"],
                additionalProperties: false,
              },
            },
            links: {
              type: "array",
              items: {
                type: "object",
                properties: { from: { type: "string" }, to: { type: "string" }, relationship: { type: "string" } },
                required: ["from", "to", "relationship"],
                additionalProperties: false,
              },
            },
          },
          required: ["nodes", "links"],
          additionalProperties: false,
        },
        changeImpact: {
          type: "array",
          items: {
            type: "object",
            properties: {
              area: { type: "string" },
              risk: { type: "string", enum: ["low", "medium", "high"] },
              reason: { type: "string" },
              verification: { type: "string" },
            },
            required: ["area", "risk", "reason", "verification"],
            additionalProperties: false,
          },
        },
        review: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["info", "low", "medium", "high"] },
              title: { type: "string" },
              explanation: { type: "string" },
              fix: { type: "string" },
            },
            required: ["severity", "title", "explanation", "fix"],
            additionalProperties: false,
          },
        },
        documentation: {
          type: "object",
          properties: {
            docstrings: { type: "string" },
            readme: { type: "string" },
          },
          required: ["docstrings", "readme"],
          additionalProperties: false,
        },
        unitTests: {
          type: "object",
          properties: {
            framework: { type: "string" },
            content: { type: "string" },
            notes: { type: "string" },
          },
          required: ["framework", "content", "notes"],
          additionalProperties: false,
        },
        followUpQuestions: { type: "array", items: { type: "string" } },
      },
      required: [
        "title",
        "systemSummary",
        "confidence",
        "evidence",
        "assumptions",
        "systemMap",
        "changeImpact",
        "review",
        "documentation",
        "unitTests",
        "followUpQuestions",
      ],
      additionalProperties: false,
    },
  },
};
