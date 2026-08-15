import { beforeEach, describe, expect, it, vi } from "vitest";

const atlasDb = vi.hoisted(() => ({
  addAtlasChatMessage: vi.fn(),
  createAtlasSession: vi.fn(),
  getAtlasSessionForUser: vi.fn(),
  listAtlasSessions: vi.fn(),
  saveAtlasReport: vi.fn(),
  setAtlasSessionStatus: vi.fn(),
}));
const atlasLlm = vi.hoisted(() => ({ invokeLLM: vi.fn() }));

vi.mock("./db", () => atlasDb);
vi.mock("./_core/llm", () => atlasLlm);

import { atlasRouter } from "./routers/atlas";

const report = {
  title: "checkout.ts change map",
  systemSummary: "A focused pricing calculation.",
  confidence: "medium",
  evidence: [],
  assumptions: [],
  systemMap: { nodes: [], links: [] },
  changeImpact: [],
  review: [],
  documentation: { docstrings: "", readme: "" },
  unitTests: { framework: "Vitest", content: "", notes: "" },
  followUpQuestions: [],
};

function caller(userId = 7) {
  return atlasRouter.createCaller({ user: { id: userId }, req: {}, res: {} } as never);
}

function storedSession() {
  return {
    session: { id: 11, language: "TypeScript", changeIntent: "Guard invalid discounts" },
    artifacts: [{ filename: "checkout.ts", language: "TypeScript", content: "export function total(value: number) { return value; }" }],
    messages: [],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  atlasDb.createAtlasSession.mockResolvedValue(11);
  atlasDb.setAtlasSessionStatus.mockResolvedValue(undefined);
  atlasDb.saveAtlasReport.mockResolvedValue(undefined);
  atlasDb.addAtlasChatMessage.mockResolvedValueOnce(31).mockResolvedValueOnce(32);
});

describe("Atlas protected procedures", () => {
  it("creates a session under the authenticated user only", async () => {
    const result = await caller(42).createSession({
      language: "TypeScript",
      filename: "checkout.ts",
      code: "export function total(value: number) { return value; }",
      changeIntent: "Guard invalid discounts",
    });

    expect(result).toEqual({ sessionId: 11 });
    expect(atlasDb.createAtlasSession).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, filename: "checkout.ts" }));
  });

  it("rejects a session that is absent or belongs to another user", async () => {
    atlasDb.getAtlasSessionForUser.mockResolvedValue(undefined);
    await expect(caller(7).getSession({ sessionId: 99 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(atlasDb.getAtlasSessionForUser).toHaveBeenCalledWith(99, 7);
  });

  it("stores a structured analysis and marks the session ready", async () => {
    atlasDb.getAtlasSessionForUser.mockResolvedValue(storedSession());
    atlasLlm.invokeLLM.mockResolvedValue({ choices: [{ message: { content: JSON.stringify(report) } }] });

    await expect(caller().analyze({ sessionId: 11 })).resolves.toMatchObject({ title: report.title });
    expect(atlasDb.setAtlasSessionStatus).toHaveBeenNthCalledWith(1, 11, 7, "analyzing", expect.any(String));
    expect(atlasDb.saveAtlasReport).toHaveBeenCalledWith(11, JSON.stringify(report));
    expect(atlasDb.setAtlasSessionStatus).toHaveBeenLastCalledWith(11, 7, "ready", expect.any(String));
  });

  it("marks the session failed when the analysis model fails", async () => {
    atlasDb.getAtlasSessionForUser.mockResolvedValue(storedSession());
    atlasLlm.invokeLLM.mockRejectedValue(new Error("provider unavailable"));

    await expect(caller().analyze({ sessionId: 11 })).rejects.toThrow("provider unavailable");
    expect(atlasDb.setAtlasSessionStatus).toHaveBeenLastCalledWith(11, 7, "failed", expect.any(String));
  });

  it("persists the question and response for an owned session chat", async () => {
    atlasDb.getAtlasSessionForUser.mockResolvedValue(storedSession());
    atlasLlm.invokeLLM.mockResolvedValue({ choices: [{ message: { content: "Validate zero and negative discounts." } }] });

    const result = await caller().chat({ sessionId: 11, message: "What should I test?" });
    expect(result).toEqual({ id: 32, role: "assistant", content: "Validate zero and negative discounts." });
    expect(atlasDb.addAtlasChatMessage).toHaveBeenNthCalledWith(1, { sessionId: 11, role: "user", content: "What should I test?" });
    expect(atlasDb.addAtlasChatMessage).toHaveBeenNthCalledWith(2, { sessionId: 11, role: "assistant", content: "Validate zero and negative discounts." });
  });
});
