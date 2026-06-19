/**
 * SubmittedDeclarationView — read-only показ уже поданої / прийнятої декларації.
 * Заміняє «Майстер підготовки» у DeclarationCasePage, коли caseItem.status ∈ {submitted, accepted}.
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Banknote,
  ExternalLink,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  buildDeclarationSnapshot,
  type DeclarationLineItem,
} from "@/config/demoCabinets/declarationSnapshot";
import type { DeclarationCase } from "@/config/demoCabinets/declarationCases";
import { GeneratedDocumentsBlock, type GeneratedDoc } from "./shared/GeneratedDocumentsBlock";

const fmt = (n: number) => `${n.toLocaleString("uk-UA")} ₴`;

const fmtDateTime = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" });
};

interface Props {
  caseItem: DeclarationCase;
}

export function SubmittedDeclarationView({ caseItem }: Props) {
  const snapshot = useMemo(() => buildDeclarationSnapshot(caseItem), [caseItem]);

  const docs: GeneratedDoc[] = useMemo(() => {
    const base: GeneratedDoc[] = [
      {
        formCode: "F0100114",
        title: "Декларація про майновий стан і доходи (основна форма)",
        status: "submitted",
      },
    ];
    snapshot.appendices.forEach((a) => {
      const formCode =
        a.code === "F1"
          ? "F0100214"
          : a.code === "F2"
            ? "F0100314"
            : a.code === "F3"
              ? "F0100414"
              : a.code === "FZ"
                ? "F0100514"
                : "F0108601";
      base.push({
        formCode,
        title: `${a.label} — ${a.description}`,
        status: "submitted",
      });
    });
    return base;
  }, [snapshot.appendices]);

  return (
    <div className="space-y-4">
      <Card className="border-emerald-500/40 bg-emerald-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="size-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base">
                {caseItem.status === "accepted" ? "Декларацію прийнято ДПС" : "Декларацію подано до ДПС"}
              </h3>
              <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                {caseItem.status === "accepted" ? "Прийнято" : "На розгляді"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs mt-2">
              <Row label="Подано до ДПС" value={fmtDateTime(caseItem.submittedAt)} />
              {caseItem.acceptedAt && <Row label="Прийнято ДПС" value={fmtDateTime(caseItem.acceptedAt)} />}
              <Row label="Дата підпису" value={fmtDateTime(caseItem.signedAt)} />
              <Row label="IP підписанта" value={caseItem.signerIp ?? "—"} mono />
              <Row label="Hash даних" value={caseItem.dataHash ?? "—"} mono break />
              <Row label="Версія правил" value={caseItem.rulesVersion} mono />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-base">Подана декларація — детальний перегляд</h3>
            <Badge variant="outline" className="font-mono text-[10px]">
              знімок на {fmtDateTime(caseItem.submittedAt)}
            </Badge>
          </div>

          <ReadOnlySection title="Розділ II — Доходи" items={snapshot.incomes} emptyHint="Доходи не вказано" />
          {snapshot.assets.length > 0 && (
            <ReadOnlySection title="Розділ V — Майно" items={snapshot.assets} />
          )}

          <div className="rounded-md border overflow-hidden">
            <div className="px-3 py-2 bg-muted/40 border-b">
              <h4 className="text-sm font-medium">Розрахунок податкових зобовʼязань</h4>
            </div>
            <div className="divide-y text-sm">
              <CalcRow label="Загальний оподатковуваний дохід" value={snapshot.totals.grossIncome} />
              <CalcRow label="ПДФО (18%)" value={snapshot.totals.pit} />
              <CalcRow label="Військовий збір (5%)" value={snapshot.totals.militaryTax} />
              {snapshot.totals.foreignTaxCredit > 0 && (
                <CalcRow label="Залік іноземного податку (ФТК)" value={-snapshot.totals.foreignTaxCredit} />
              )}
              {snapshot.totals.refund > 0 && (
                <CalcRow label="Податкова знижка до повернення" value={-snapshot.totals.refund} />
              )}
              <CalcRow label="До сплати" value={snapshot.totals.netToPay} bold />
            </div>
          </div>

          {snapshot.fxRates.length > 0 && (
            <div className="rounded-md border p-3 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Banknote className="size-4 text-muted-foreground" /> Курси НБУ (застосовані)
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {snapshot.fxRates.map((fx) => (
                  <div key={fx.currency} className="rounded border bg-muted/30 p-2 text-xs">
                    <div className="font-mono font-semibold">{fx.currency}</div>
                    <div className="tabular-nums text-sm">{fx.rate.toFixed(4)} ₴</div>
                    <div className="text-[10px] text-muted-foreground">{fx.date} · {fx.source}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GeneratedDocumentsBlock docs={docs} />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast({
              title: "Завантаження архіву",
              description: "Демо: ZIP з усіма поданими формами та квитанцією ДПС.",
            })
          }
        >
          <Download className="size-3.5" /> Завантажити архів подання
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            toast({
              title: "Квитанція ДПС",
              description: "Демо: відкриття квитанції №2 про прийняття декларації.",
            })
          }
        >
          <FileText className="size-3.5" /> Квитанція ДПС
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  break: doBreak,
}: {
  label: string;
  value: string;
  mono?: boolean;
  break?: boolean;
}) {
  return (
    <>
      <div className="text-muted-foreground">{label}</div>
      <div className={cn("tabular-nums", mono && "font-mono", doBreak && "break-all")}>{value}</div>
    </>
  );
}

function ReadOnlySection({
  title,
  items,
  emptyHint,
}: {
  title: string;
  items: DeclarationLineItem[];
  emptyHint?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border p-4 text-center text-xs text-muted-foreground">
        {emptyHint ?? "Немає даних"}
      </div>
    );
  }
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="px-3 py-2 bg-muted/40 border-b flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs tabular-nums font-medium">{fmt(total)}</span>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.code} className="px-3 py-2.5 flex items-start gap-3 text-sm">
            <Badge variant="outline" className="font-mono text-[10px] shrink-0 mt-0.5">
              {item.code}
            </Badge>
            <div className="flex-1 min-w-0 space-y-0.5">
              <span className="font-medium">{item.label}</span>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ExternalLink className="size-3" />
                Джерело: {item.sourceLabel}
                {item.txCount != null && <span>· {item.txCount} операцій</span>}
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums shrink-0">
              {item.amount < 0 ? `−${fmt(Math.abs(item.amount))}` : fmt(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalcRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={cn("px-3 py-2 flex items-center justify-between", bold && "bg-primary/5 font-semibold")}>
      <span>{label}</span>
      <span className="tabular-nums">
        {value < 0 ? `−${fmt(Math.abs(value))}` : fmt(value)}
      </span>
    </div>
  );
}
