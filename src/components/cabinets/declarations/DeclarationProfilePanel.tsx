// Phase 7.4 — Профіль декларації (авто-визначений з фактів модулів).
// Замінює класичний IntakeWizard з анкетними питаннями. Користувачу показуємо,
// які теги система визначила сама, з пояснювальними доказами і кнопками drill-down.

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  PROFILE_TAG_LABELS,
  RESIDENCY_LABELS,
  type DeclarationCase,
  type ProfileTag,
} from "@/config/demoCabinets/declarationCases";
import {
  deriveProfileTagsFromFacts,
  type FactEvidence,
} from "@/config/demoCabinets/declarationFactDeriver";
import { SourceDrillSheet } from "./SourceDrillSheet";

interface ProfilePanelProps {
  caseItem: DeclarationCase;
}

const TAG_DESCRIPTIONS: Record<ProfileTag, string> = {
  is_investor: "Активує Додаток Ф1 (FIFO-розрахунок інвестиційного прибутку)",
  has_foreign_income: "Активує Додаток ФЗ (іноземні доходи + залік ФТК)",
  has_kik: "Активує окремий Звіт про КІК + рядок 10.13 декларації",
  sold_property: "Активує Додаток Ф2 (дохід від продажу нерухомості)",
  claims_tax_credit: "Активує Розділ IV (податкова знижка — освіта/іпотека/страхування)",
  has_residency_concerns: "Блокує підпис до підтвердження резидентства (183-денний тест)",
  received_inheritance: "Рядок 10.7 декларації (спадщина / подарунки)",
};

export function DeclarationProfilePanel({ caseItem }: ProfilePanelProps) {
  const derived = useMemo(
    () => deriveProfileTagsFromFacts(caseItem.cabinetId, caseItem.reportingYear),
    [caseItem.cabinetId, caseItem.reportingYear],
  );

  const [drillOpen, setDrillOpen] = useState(false);
  const [drillTag, setDrillTag] = useState<ProfileTag | null>(null);

  const openDrill = (tag: ProfileTag) => {
    setDrillTag(tag);
    setDrillOpen(true);
  };

  const drillEvidence: FactEvidence[] = drillTag ? derived.evidence[drillTag] ?? [] : [];

  const allTags: ProfileTag[] = derived.tags;

  return (
    <div className="space-y-3">
      {/* Banner: автогенерація */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="rounded-full bg-primary/15 p-2 shrink-0">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm">Профіль декларації визначено автоматично</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Система проаналізувала {derived.tags.length === 0 ? "ваші дані" : `${Object.values(derived.metrics).reduce((s, m) => s + (m?.count ?? 0), 0)} операцій`} у підключених модулях за {caseItem.reportingYear} рік
              і визначила, які додатки декларації потрібні. Жодних анкет — все базується на реальних транзакціях.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 shrink-0"
            onClick={() =>
              toast({
                title: "Перерахунок профілю",
                description: "Демо: профіль повторно деривовано з фактів модулів",
              })
            }
          >
            <RefreshCw className="size-3.5" /> Оновити
          </Button>
        </CardContent>
      </Card>

      {/* Якщо тегів немає */}
      {allTags.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <Info className="size-8 mx-auto text-muted-foreground" />
            <h4 className="font-medium text-sm">Жодних ознак для декларації не знайдено</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              За {caseItem.reportingYear} рік немає інвестицій, іноземних доходів, КІК чи продажу майна.
              Декларація може бути добровільною — наприклад, якщо ви хочете застосувати податкову знижку.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Картки тегів */}
      {allTags.map((tag) => {
        const evidence = derived.evidence[tag] ?? [];
        const metric = derived.metrics[tag];
        return (
          <Card key={tag}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-sm">{PROFILE_TAG_LABELS[tag]}</h4>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      Авто-виявлено
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{TAG_DESCRIPTIONS[tag]}</p>
                </div>
              </div>

              {/* Підстава */}
              <div className="ml-8 rounded-md bg-muted/50 px-3 py-2 text-xs space-y-1">
                <div className="font-medium text-foreground">Підстава:</div>
                <div className="text-muted-foreground">
                  {evidence[0]?.moduleLabel} — знайдено{" "}
                  <span className="font-medium text-foreground">{metric?.count ?? evidence.length}</span>{" "}
                  {metric?.count === 1 ? "запис" : "записи"}
                  {metric?.totalUah ? (
                    <>
                      {" "}на суму{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {metric.totalUah.toLocaleString("uk-UA")} ₴
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Дії */}
              <div className="ml-8 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1 h-7" onClick={() => openDrill(tag)}>
                  <ExternalLink className="size-3" />
                  Дивитись джерело
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 h-7 text-muted-foreground"
                  onClick={() =>
                    toast({
                      title: "Уточнення тегу",
                      description: "Демо: відкриється форма для оскарження або ручного коригування",
                    })
                  }
                >
                  Це не я / уточнити
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Резидентство — окремо, бо потребує підтвердження */}
      {derived.residencyHint === "pending_review" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm">Потрібне ваше підтвердження резидентства</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {derived.residencyReason}
                </p>
              </div>
            </div>
            <div className="ml-8 flex gap-2">
              <Button size="sm" variant="default" className="gap-1 h-7">
                Я резидент України
              </Button>
              <Button size="sm" variant="outline" className="gap-1 h-7">
                Я нерезидент
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Поточний застосований у кейсі статус */}
      <Card>
        <CardContent className="p-4 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Поточний резидентський статус кейсу:</span>
            <Badge variant="outline">{RESIDENCY_LABELS[caseItem.residencyStatus]}</Badge>
          </div>
          <Separator className="my-2" />
          <div className="text-muted-foreground">
            Якщо у вас зʼявляться нові операції в Книзі доходів, Фін.моніторингу, Інвестиціях чи КІК —
            теги перерахуються автоматично.
          </div>
        </CardContent>
      </Card>

      <SourceDrillSheet
        open={drillOpen}
        onOpenChange={setDrillOpen}
        title={drillTag ? PROFILE_TAG_LABELS[drillTag] : ""}
        evidence={drillEvidence}
      />
    </div>
  );
}
