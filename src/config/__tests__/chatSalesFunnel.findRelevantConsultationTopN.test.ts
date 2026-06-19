import { describe, it, expect } from "vitest";
import { findRelevantConsultationTopN, emptyProfile, type UserProfile } from "@/config/chatSalesFunnel";

const bizProfile: UserProfile = { ...emptyProfile, type: "fop", fopGroup: 3 };
const indProfile: UserProfile = { ...emptyProfile, type: "individual", individualType: "investor" };

describe("findRelevantConsultationTopN", () => {
  it("relevant query returns results with scoreNorm <= 1.0", () => {
    const results = findRelevantConsultationTopN("підключити банк", bizProfile);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.scoreNorm).toBeLessThanOrEqual(1.0);
      expect(r.scoreNorm).toBeGreaterThan(0);
    }
  });

  it("scoreNorm = min(1, scoreRaw / 10)", () => {
    const results = findRelevantConsultationTopN("підключити банк", bizProfile);
    for (const r of results) {
      expect(r.scoreNorm).toBeCloseTo(Math.min(1, r.scoreRaw / 10), 5);
    }
  });

  it("empty text → empty array", () => {
    expect(findRelevantConsultationTopN("", bizProfile)).toEqual([]);
  });

  it("parameter n limits results count", () => {
    const results2 = findRelevantConsultationTopN("податок декларація", bizProfile, 2);
    expect(results2.length).toBeLessThanOrEqual(2);

    const results1 = findRelevantConsultationTopN("податок декларація", bizProfile, 1);
    expect(results1.length).toBeLessThanOrEqual(1);
  });

  it("audience filtering: business profile gets business consultations", () => {
    const results = findRelevantConsultationTopN("підключити банк", bizProfile);
    for (const r of results) {
      expect(r.consultation.audience).toBe("business");
    }
  });

  it("audience filtering: individual profile gets individual consultations", () => {
    const results = findRelevantConsultationTopN("інвестиції акції податок", indProfile);
    for (const r of results) {
      expect(r.consultation.audience).toBe("individual");
    }
  });

  it("matchedTokens are non-empty for found results", () => {
    const results = findRelevantConsultationTopN("підключити банк", bizProfile);
    for (const r of results) {
      expect(r.matchedTokens.length).toBeGreaterThan(0);
    }
  });

  it("results are sorted by scoreRaw DESC", () => {
    const results = findRelevantConsultationTopN("податок декларація звіт", bizProfile);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].scoreRaw).toBeGreaterThanOrEqual(results[i].scoreRaw);
    }
  });
});
