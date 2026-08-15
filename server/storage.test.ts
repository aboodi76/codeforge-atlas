import { describe, expect, it } from "vitest";
import { storageGet } from "./storage";

describe("storageGet", () => {
  it("normalizes keys and returns the public assets route", async () => {
    await expect(storageGet("/atlas/reports/change-map.json")).resolves.toEqual({
      key: "atlas/reports/change-map.json",
      url: "/assets/atlas/reports/change-map.json",
    });
  });
});
