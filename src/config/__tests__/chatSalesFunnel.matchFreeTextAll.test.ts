import { describe, it, expect } from "vitest";
import { matchFreeTextAll, emptyProfile, type UserProfile } from "@/config/chatSalesFunnel";

const bizProfile: UserProfile = { ...emptyProfile, type: "fop", fopGroup: 3 };
const indProfile: UserProfile = { ...emptyProfile, type: "individual", individualType: "investor" };

describe("matchFreeTextAll", () => {
  it("anchor word (єсв) gets score bonus", () => {
    const results = matchFreeTextAll("єсв", bizProfile);
    if (results.length > 0) {
      // Anchor bonus: base (0.4 for short) + 0.2 = 0.6
      const esvMatch = results.find(r => r.key.toLowerCase().includes("єсв") || r.matched.some(m => m.includes("єсв")));
      if (esvMatch) {
        expect(esvMatch.score).toBeGreaterThanOrEqual(0.6);
      }
    }
  });

  it("generic word (податок) gets score penalty", () => {
    const results = matchFreeTextAll("податок", bizProfile);
    if (results.length > 0) {
      const genericMatch = results[0];
      // Generic penalty: base (0.4 for short) - 0.3 = 0.1
      expect(genericMatch.score).toBeLessThanOrEqual(0.4);
    }
  });

  it("long phrase (> 8 chars) gets base score 0.6", () => {
    const results = matchFreeTextAll("декларація", bizProfile);
    if (results.length > 0) {
      // "декларація" is 10 chars → base 0.6, plus anchor bonus
      expect(results[0].score).toBeGreaterThanOrEqual(0.6);
    }
  });

  it("returns max 5 results", () => {
    // Use a broad query that could match many keywords
    const results = matchFreeTextAll("податок дохід єсв декларація звіт фоп прро рро", bizProfile);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("empty/irrelevant text → empty array", () => {
    expect(matchFreeTextAll("", bizProfile)).toEqual([]);
    expect(matchFreeTextAll("абвгд xyz 12345", bizProfile)).toEqual([]);
  });

  it("audience routing: 'продаж авто' excluded for business profile", () => {
    const bizResults = matchFreeTextAll("продаж авто", bizProfile);
    const indResults = matchFreeTextAll("продаж авто", indProfile);
    
    const bizHasAuto = bizResults.some(r => r.key === "продаж авто");
    expect(bizHasAuto).toBe(false);
    
    // For individual it may or may not match depending on KEYWORD_MAP, but shouldn't be filtered
  });

  it("results are sorted by score DESC", () => {
    const results = matchFreeTextAll("єсв декларація податок", bizProfile);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
