/**
 * analyticsContextBuilder — серіалізує TodaySnapshotResult у compact текст
 * для system prompt AI edge function (~500 токенів)
 */

import type { TodaySnapshotResult } from "@/hooks/useTodaySnapshot";
import type { Cabinet } from "@/types/cabinet";

const GRADE_UA: Record<string, string> = {
  excellent: "Відмінно",
  good: "Добре",
  attention: "Потребує уваги",
  critical: "Критично",
};

const SEVERITY_ICON: Record<string, string> = {
  critical: "🔴",
  warning: "⚠️",
  info: "ℹ️",
};

export function buildAnalyticsContext(
  snapshot: TodaySnapshotResult,
  cabinet: Cabinet
): string {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  const lines: string[] = [];

  lines.push(`АНАЛІТИКА КАБІНЕТУ «${cabinet.name}» (станом на ${timeStr}):`);

  // 1. Health Score
  const hs = snapshot.healthScore;
  const worstPillar = [...hs.pillars].sort((a, b) => a.score - b.score)[0];
  lines.push(
    `Health Score: ${hs.total}/100 (${GRADE_UA[hs.grade] || hs.grade}). ` +
    `Тренд: ${hs.trend === "up" ? "↑" : hs.trend === "down" ? "↓" : "→"}. ` +
    `Найслабше: ${worstPillar.label} (${worstPillar.score})` +
    (worstPillar.issues.length > 0 ? ` — ${worstPillar.issues[0]}` : "") +
    "."
  );

  // 2. Top KPIs
  const kpis = snapshot.config.kpis.slice(0, 4);
  if (kpis.length > 0) {
    const kpiParts = kpis.map((k) => {
      const val = typeof k.value === "number"
        ? new Intl.NumberFormat("uk-UA").format(k.value) + " ₴"
        : k.value;
      const trend = k.trend
        ? ` (${k.trend.direction === "down" ? "-" : "+"}${k.trend.value}%)`
        : "";
      return `${k.title}: ${val}${trend}`;
    });
    lines.push(`KPIs: ${kpiParts.join(", ")}.`);
  }

  // 3. Top risks
  const topRisks = snapshot.risks.items
    .filter((r) => r.severity !== "info")
    .slice(0, 3);
  if (topRisks.length > 0) {
    const riskParts = topRisks.map(
      (r) => `${SEVERITY_ICON[r.severity] || ""} ${r.text?.slice(0, 80) || r.title || "Ризик"}`
    );
    lines.push(`Ризики: ${riskParts.join(". ")}.`);
  } else {
    lines.push("Ризики: немає активних попереджень.");
  }

  // 4. FOP limit
  if (snapshot.sparkData.fopLimit) {
    const fl = snapshot.sparkData.fopLimit;
    lines.push(
      `Ліміт ФОП: ${new Intl.NumberFormat("uk-UA").format(fl.currentTotal)} / ${new Intl.NumberFormat("uk-UA").format(fl.yearlyLimit)} ₴ (${fl.percent}%).`
    );
  }

  // 5. Data sources status
  const ds = snapshot.config.dataSources;
  const connected = ds.filter((d) => d.status === "connected").length;
  const errorDs = ds.filter((d) => d.status === "error").length;
  lines.push(
    `Джерела: ${connected}/${ds.length} підключені${errorDs > 0 ? `, ${errorDs} з помилками` : ", дані свіжі"}.`
  );

  return lines.join("\n");
}
