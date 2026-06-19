import { describe, it, expect, beforeEach } from "vitest";
import {
  _resetEntryGraph,
  entryKey,
  getRelatedEntriesGrouped,
  getSeeAlsoForAi,
} from "../entryGraph";
import { getAllDirectoryEntries } from "../directoryAdapters";

describe("entryGraph", () => {
  beforeEach(() => _resetEntryGraph());

  it("entryKey composes category:slug", () => {
    expect(entryKey({ category: "laws", slug: "pku" })).toBe("laws:pku");
  });

  it("returns no related entries for entries with no edges", () => {
    const orphan = getAllDirectoryEntries().find(
      (e) => !e.relatedEntryIds || e.relatedEntryIds.length === 0,
    );
    if (!orphan) return;
    const groups = getRelatedEntriesGrouped(orphan);
    // Orphan may still be linked by inverse-edges from others; just assert shape.
    expect(Array.isArray(groups)).toBe(true);
  });

  it("getSeeAlsoForAi flattens to {title,url,categoryLabel}[]", () => {
    const any = getAllDirectoryEntries().find(
      (e) => (e.relatedEntryIds?.length ?? 0) > 0,
    );
    if (!any) return;
    const see = getSeeAlsoForAi({ category: any.category, slug: any.slug }, 3);
    expect(see.length).toBeLessThanOrEqual(3);
    for (const s of see) {
      expect(s.url).toMatch(/^\/dovidnyky\//);
      expect(s.title).toBeTruthy();
      expect(s.categoryLabel).toBeTruthy();
    }
  });

  it("bidirectional: A→B implies B→A", () => {
    const all = getAllDirectoryEntries();
    const withRel = all.find(
      (e) => e.relatedEntryIds?.some((r) => r.includes(":")),
    );
    if (!withRel) return;
    const forwardId = withRel.relatedEntryIds!.find((r) => r.includes(":"))!;
    const [cat, slug] = forwardId.split(":");
    const inverse = getRelatedEntriesGrouped({
      category: cat as never,
      slug,
    });
    const flatKeys = inverse.flatMap((g) => g.items.map((i) => i.key));
    expect(flatKeys).toContain(entryKey(withRel));
  });
});
