import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("Atlas runtime wiring", () => {
  it("loads the real application router and exposes all Atlas procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);

    expect(procedures).toEqual(
      expect.arrayContaining([
        "atlas.createSession",
        "atlas.listSessions",
        "atlas.getSession",
        "atlas.analyze",
        "atlas.chat",
      ])
    );
  });
});
