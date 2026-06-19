import { describe, it, expect } from "vitest";
import {
  getAllDirectoryEntries,
  getDirectoryEntries,
} from "../directoryAdapters";
import { serializeDirectoriesForAi, directoryEntryUrl } from "../serializeForAi";
import { DIRECTORY_CATEGORY_LABEL } from "../directoryTypes";

describe("DirectoryEntry adapters", () => {
  const all = getAllDirectoryEntries();

  it("returns a non-empty list across all categories", () => {
    expect(all.length).toBeGreaterThan(50);
  });

  it("each entry has required metadata fields", () => {
    for (const e of all) {
      expect(e.id, `id missing for ${e.category}:${e.slug}`).toBeTruthy();
      expect(e.slug).toBeTruthy();
      expect(e.title).toBeTruthy();
      expect(e.summary).toBeTruthy();
      expect(e.source).toBeTruthy();
      expect(e.sourceUrl).toMatch(/^https?:\/\//);
      expect(e.asOf).toMatch(/^\d{4}-\d{2}/);
      expect(e.lastVerifiedAt).toMatch(/^\d{4}-\d{2}/);
      expect(["official", "snapshot", "estimate"]).toContain(e.confidence);
      expect(DIRECTORY_CATEGORY_LABEL[e.category]).toBeTruthy();
    }
  });

  it("slugs are unique within a category", () => {
    const seen = new Map<string, Set<string>>();
    for (const e of all) {
      const set = seen.get(e.category) ?? new Set();
      expect(set.has(e.slug), `duplicate slug ${e.category}:${e.slug}`).toBe(false);
      set.add(e.slug);
      seen.set(e.category, set);
    }
  });

  it("getDirectoryEntries filters correctly", () => {
    const penalties = getDirectoryEntries("penalties");
    expect(penalties.length).toBeGreaterThan(0);
    expect(penalties.every((e) => e.category === "penalties")).toBe(true);
  });

  it("directoryEntryUrl builds /dovidnyky/* paths", () => {
    const sample = all[0];
    expect(directoryEntryUrl(sample)).toMatch(/^\/dovidnyky\//);
  });

  it("serializeDirectoriesForAi stays within token budget", () => {
    const out = serializeDirectoriesForAi(6);
    expect(out.length).toBeLessThan(35000);
    expect(out).toContain("## Довідники FINTODO");
  });
});
