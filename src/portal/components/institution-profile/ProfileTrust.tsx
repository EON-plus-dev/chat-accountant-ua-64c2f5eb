import { useState } from "react";
import {
  CheckCircle, MinusCircle, XCircle, AlertTriangle, Shield,
  ExternalLink, Info, ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

/* ── Review helpers ── */
const sentimentIcon = (s: string) => {
  if (s === "positive") return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
  if (s === "mixed") return <MinusCircle className="w-5 h-5 text-amber-500 shrink-0" />;
  return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
};
const sentimentColor = (s: string) => {
  if (s === "positive") return "bg-emerald-500";
  if (s === "mixed") return "bg-amber-500";
  return "bg-red-400";
};
const frequencyLabel = (f: string) => {
  if (f === "very_common") return "Дуже поширене";
  if (f === "common" || f === "widespread") return "Поширене";
  if (f === "occasional") return "Іноді";
  return "Рідко";
};
const frequencyVariant = (f: string): "success" | "warning" | "secondary" => {
  if (f === "very_common" || f === "common") return "success";
  if (f === "occasional") return "warning";
  return "secondary";
};

/* ── Issue helpers ── */
const issueFrequencyVariant = (f: string): "error" | "warning" | "secondary" => {
  if (f === "very_common" || f === "common" || f === "widespread") return "error";
  if (f === "occasional") return "warning";
  return "secondary";
};
const issueStatusLabel = (s: string) => {
  if (s === "resolved") return "Вирішено";
  if (s === "ongoing") return "Триває";
  if (s === "acknowledged") return "Визнано";
  return "Відхилено";
};
const issueStatusVariant = (s: string): "success" | "warning" | "error" | "secondary" => {
  if (s === "resolved") return "success";
  if (s === "ongoing" || s === "acknowledged") return "warning";
  return "error";
};


interface Props {
  profile: FullInstitutionProfile;
}

function getComplianceItems(profile: FullInstitutionProfile) {
  const cs = profile.ratings?.fintodo?.categorySlug || '';
  const certs = profile.legal.certifications.map(c => ({ label: c.name, ok: true, cat: "Стандарт" }));
  const reports = profile.compliance.reportingFormats.map(f => ({ label: f, ok: true, cat: "Звітність" }));

  if (cs.startsWith('banks') || cs.startsWith('credit')) {
    return [
      { label: `Ліцензія НБУ ${profile.legal.licenses[0]?.number || ""}`, ok: profile.compliance.nbu, cat: "Регулятор" },
      { label: "DPS (податкова)", ok: profile.compliance.dps, cat: "Регулятор" },
      { label: "AML-compliant", ok: profile.compliance.aml, cat: "Стандарт" },
      { label: "Перевірка PEP", ok: profile.compliance.pep, cat: "Стандарт" },
      { label: "Санкційний скринінг", ok: profile.compliance.sanctions, cat: "Стандарт" },
      { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
      ...certs,
      { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
      { label: "Open Banking", ok: profile.compliance.openBanking, cat: "Інтеграція" },
      ...reports,
    ];
  }
  if (cs.startsWith('insurance')) {
    return [
      { label: "Ліцензія Нацкомфінпослуг", ok: profile.compliance.nbu || profile.legal.licenses.length > 0, cat: "Регулятор" },
      { label: "AML-compliant", ok: profile.compliance.aml, cat: "Стандарт" },
      { label: "Перевірка PEP", ok: profile.compliance.pep, cat: "Стандарт" },
      { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
      ...certs,
      { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
      ...reports,
    ];
  }
  if (cs.startsWith('legal')) {
    return [
      { label: "Реєстр Мін'юсту", ok: profile.legal.licenses.length > 0, cat: "Регулятор" },
      { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
      { label: "Санкційний скринінг", ok: profile.compliance.sanctions, cat: "Стандарт" },
      ...certs,
      { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
      ...reports,
    ];
  }
  if (cs.startsWith('logistics')) {
    return [
      { label: "Ліцензія перевізника", ok: profile.legal.licenses.length > 0, cat: "Регулятор" },
      { label: "Поштовий оператор", ok: true, cat: "Регулятор" },
      ...certs,
      { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
      { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
      ...reports,
    ];
  }
  if (cs.startsWith('fintech') || cs.startsWith('payments')) {
    return [
      { label: "PCI DSS", ok: profile.compliance.aml, cat: "Стандарт" },
      { label: "AML-compliant", ok: profile.compliance.aml, cat: "Стандарт" },
      { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
      ...certs,
      { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
      ...reports,
    ];
  }
  if (cs.startsWith('grants') || cs.startsWith('gov')) {
    return [
      { label: "Акредитація", ok: profile.legal.licenses.length > 0, cat: "Регулятор" },
      { label: "Прозорість звітності", ok: true, cat: "Стандарт" },
      { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
      ...certs,
      { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
      ...reports,
    ];
  }
  if (cs.startsWith('accounting') || cs.startsWith('digital')) {
    return [
      { label: "Інтеграція з ДПС", ok: profile.compliance.dps, cat: "Регулятор" },
      { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
      ...certs,
      { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
      ...reports,
    ];
  }
  // Generic fallback
  return [
    { label: "GDPR", ok: profile.compliance.gdpr, cat: "Стандарт" },
    ...certs,
    { label: "Інтеграція з Дія", ok: profile.compliance.dia, cat: "Інтеграція" },
    ...reports,
  ];
}

export const ProfileTrust = ({ profile }: Props) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const cs = profile.ratings?.fintodo?.categorySlug || '';
  const isBankOrCredit = cs.startsWith('banks') || cs.startsWith('credit');

  const hasReviews = profile.reviewThemes && profile.reviewThemes.length > 0;
  const hasIssuesData = profile.knownIssues && profile.knownIssues.length > 0;
  const hasCompliance = profile.compliance.nbu || profile.compliance.aml || profile.compliance.gdpr || profile.compliance.dia;
  
  const hasWar = !!profile.warPeriod;
  if (!hasReviews && !hasIssuesData && !hasCompliance && !hasWar) return null;

  const hasIssues = hasIssuesData;

  const allComplianceItems = getComplianceItems(profile);

  return (
    <section id="trust" className="border-t border-border pt-6 mt-8 scroll-mt-28">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" /> Довіра та безпека
      </h2>

      {/* ── Review themes ── */}
      {hasReviews && (
        <>
          <p className="text-sm font-semibold text-foreground mt-4 mb-2">Що кажуть клієнти</p>
          <div className="space-y-1">
            {profile.reviewThemes.map((theme, i) => (
              <div key={i} className="border border-border/60 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/30 transition-colors"
                >
                  {sentimentIcon(theme.sentiment)}
                  <span className="flex-1 text-foreground font-medium truncate text-left">{theme.theme}</span>
                  {theme.percentMentioning && (
                    <div className="w-20 sm:w-28 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                      <div className={`h-full rounded-full ${sentimentColor(theme.sentiment)}`} style={{ width: `${theme.percentMentioning}%` }} />
                    </div>
                  )}
                  {theme.percentMentioning && <span className="font-mono text-xs text-muted-foreground w-8 text-right">{theme.percentMentioning}%</span>}
                  <Badge variant={frequencyVariant(theme.frequency)} size="sm" className="hidden sm:inline-flex">{frequencyLabel(theme.frequency)}</Badge>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded[i] ? "rotate-180" : ""}`} />
                </button>
                {expanded[i] && (
                  <div className="px-3 pb-3 pt-1 border-t border-border/40">
                    <p className="text-sm text-muted-foreground">{theme.summary}</p>
                    {(theme.positiveQuote || theme.negativeQuote) && (
                      <blockquote className="border-l-2 border-border pl-3 mt-2 text-sm italic text-muted-foreground">
                        {theme.positiveQuote || theme.negativeQuote}
                      </blockquote>
                    )}
                    <p className="text-sm mt-2"><span className="font-medium text-foreground">Висновок:</span> <span className="text-muted-foreground">{theme.ourConclusion}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {profile.reviewSourcesNote && (
            <div className="flex items-start gap-2 mt-3 text-sm text-muted-foreground">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{profile.reviewSourcesNote}</p>
            </div>
          )}
        </>
      )}

      {/* ── DIA Deposit Guarantee — only for banks/credit ── */}
      {isBankOrCredit && profile.compliance.dia && (
        <Card className="mt-5 p-4 border-l-4 border-emerald-500 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-semibold text-foreground">Гарантія вкладів ФГВФО</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Вклади фізичних осіб гарантуються <strong className="text-foreground">Фондом гарантування вкладів</strong> у розмірі до <strong className="text-foreground font-mono">600 000 ₴</strong> на одного вкладника в одному банку, включаючи відсотки. Гарантія поширюється на поточні, депозитні та карткові рахунки.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Виплати здійснюються протягом 20 робочих днів з моменту прийняття рішення про ліквідацію банку.
          </p>
        </Card>
      )}

      {/* ── Compliance grid ── */}
      <p className="text-sm font-semibold text-foreground mt-5 mb-2">Комплаєнс та регуляція</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5">
        {allComplianceItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-sm">
            {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            <span className="text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {profile.legal.auditor && (
          <p className="text-sm text-muted-foreground">Аудитор: {profile.legal.auditor} · Остання перевірка: {profile.compliance.lastComplianceCheck || profile.legal.lastAuditYear}</p>
        )}
        {profile.security.breachHistory && (
          <p className="text-sm text-amber-600 dark:text-amber-400">⚠️ Історія інцидентів: {profile.security.breachHistory}</p>
        )}
        {profile.security.regulatoryIncidents && (
          <p className="text-sm text-amber-600 dark:text-amber-400">⚠️ Регуляторні інциденти: {profile.security.regulatoryIncidents}</p>
        )}
        {profile.legal.publicReports && (
          <a href={profile.legal.publicReports} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            Публічна звітність <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>


      {/* ── Known Issues ── */}
      {hasIssues ? (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-foreground">{profile.knownIssues.length} відомих проблем</p>
          </div>
          <div className="space-y-2">
            {profile.knownIssues.map((issue, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Badge variant={issueFrequencyVariant(issue.frequency)} size="sm">{frequencyLabel(issue.frequency)}</Badge>
                  <Badge variant={issueStatusVariant(issue.status)} size="sm">{issueStatusLabel(issue.status)}</Badge>
                </div>
                <p className="font-medium text-foreground text-sm">{issue.issue}</p>
                {issue.institutionResponse && (
                  <p className="text-sm text-muted-foreground mt-1.5"><span className="font-medium">Позиція установи:</span> {issue.institutionResponse}</p>
                )}
                {issue.workaround && (
                  <p className="text-sm text-muted-foreground mt-1"><span className="font-medium">Як обійти:</span> {issue.workaround}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-3 mt-4 text-center text-muted-foreground text-sm">
          Суттєвих відомих проблем не виявлено станом на {profile.dataLastUpdated}
        </Card>
      )}

      {/* ── War Period ── */}
      {hasWar && (
        <Card className="mt-5 p-4 border-l-4 border-blue-500">
          <h3 className="text-base font-semibold text-foreground mb-2">🇺🇦 Воєнний стан</h3>
          <div className="space-y-1.5 text-sm">
            <div><span className="font-medium text-foreground">Операційний статус:</span> <span className="text-muted-foreground">{profile.warPeriod!.operationalStatus}</span></div>
            <div><span className="font-medium text-foreground">Надійність при відключеннях:</span> <span className="text-muted-foreground">{profile.warPeriod!.reliabilityDuringBlackouts}</span></div>
            {profile.warPeriod!.dataBackupNote && (
              <div><span className="font-medium text-foreground">Бекап даних:</span> <span className="text-muted-foreground">{profile.warPeriod!.dataBackupNote}</span></div>
            )}
            {profile.warPeriod!.supportForAffected && (
              <div><span className="font-medium text-foreground">Підтримка постраждалих:</span> <span className="text-muted-foreground">{profile.warPeriod!.supportForAffected}</span></div>
            )}
            {profile.warPeriod!.charityWork && profile.warPeriod!.charityWork.length > 0 && (
              <div>
                <p className="font-medium text-foreground">Благодійна діяльність:</p>
                <ul className="mt-1 space-y-0.5">
                  {profile.warPeriod!.charityWork.map((c, i) => (
                    <li key={i} className="text-muted-foreground">• {c}</li>
                  ))}
                </ul>
              </div>
            )}
            <div><span className="font-medium text-foreground">Безперервність:</span> <span className="text-muted-foreground">{profile.warPeriod!.businessContinuityPlan}</span></div>
            {profile.warPeriod!.warNote && <p className="text-muted-foreground italic">{profile.warPeriod!.warNote}</p>}
          </div>
        </Card>
      )}

    </section>
  );
};
