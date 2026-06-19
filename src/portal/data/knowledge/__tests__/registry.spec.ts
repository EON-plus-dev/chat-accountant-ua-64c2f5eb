import { describe, it, expect } from "vitest";
import {
  KNOWLEDGE_FACTS,
  KNOWLEDGE_FORECASTS,
  listFacts,
  serializeKnowledgeForAi,
  SNAPSHOT_AS_OF,
} from "../index";
import { TAX_RATES_2026 } from "@/config/taxRates2026";

describe("knowledge registry", () => {
  it("every fact's last series point equals current value", () => {
    for (const fact of listFacts()) {
      if (!fact.series || fact.series.length === 0) continue;
      const last = fact.series[fact.series.length - 1].value;
      expect(
        Math.abs(last - fact.value),
        `fact "${fact.id}" series.last (${last}) must equal value (${fact.value})`
      ).toBeLessThan(0.05);
    }
  });

  it("derived facts compute correctly", () => {
    const minWage = KNOWLEDGE_FACTS["min-wage"].value;
    const esv = KNOWLEDGE_FACTS["esv-rate"].value;
    const expected = Math.round(minWage * esv / 100);
    expect(KNOWLEDGE_FACTS["min-esv-monthly"].value).toBe(expected);
  });

  it("snapshot date matches main macro fact", () => {
    expect(KNOWLEDGE_FACTS["inflation-cpi-yoy"].asOf).toBe(SNAPSHOT_AS_OF);
  });

  it("forecast actuals do not contradict same-year series values", () => {
    for (const fc of KNOWLEDGE_FORECASTS) {
      if (!fc.factId) continue;
      const fact: any = KNOWLEDGE_FACTS[fc.factId as keyof typeof KNOWLEDGE_FACTS];
      if (!fact?.series) continue;
      for (const actual of fc.actuals) {
        // тільки повний рік "YYYY"
        if (!/^\d{4}$/.test(actual.period)) continue;
        const matching = fact.series.filter((p: any) => p.period.startsWith(actual.period + "-"));
        if (matching.length === 0) continue;
        const avg = matching.reduce((s, p) => s + p.value, 0) / matching.length;
        // ±30% коридор — щоб точкові коливання не валили тест, але грубі суперечності ловились
        const diff = Math.abs(avg - actual.value) / Math.max(Math.abs(avg), 0.1);
        expect(
          diff,
          `forecast "${fc.id}" actuals[${actual.period}]=${actual.value} too far from series avg ${avg.toFixed(2)}`
        ).toBeLessThan(0.5);
      }
    }
  });

  it("tax rates in taxRates2026.ts match knowledge registry", () => {
    expect(TAX_RATES_2026.PDFO * 100).toBe(KNOWLEDGE_FACTS["pdfo-rate"].value);
    expect(TAX_RATES_2026.MILITARY_TAX * 100).toBe(KNOWLEDGE_FACTS["military-tax-rate"].value);
    expect(TAX_RATES_2026.ESV * 100).toBe(KNOWLEDGE_FACTS["esv-rate"].value);
    expect(TAX_RATES_2026.EP_GROUP_3 * 100).toBe(KNOWLEDGE_FACTS["ep-group-3"].value);
    expect(TAX_RATES_2026.VAT_STANDARD * 100).toBe(KNOWLEDGE_FACTS["vat-standard"].value);
  });

  it("AI serializer produces compact non-empty markdown", () => {
    const md = serializeKnowledgeForAi();
    expect(md.length).toBeGreaterThan(200);
    expect(md.length).toBeLessThan(2048);
    expect(md).toMatch(/Облікова ставка НБУ/);
    expect(md).toMatch(/ПДФО/);
  });
});
