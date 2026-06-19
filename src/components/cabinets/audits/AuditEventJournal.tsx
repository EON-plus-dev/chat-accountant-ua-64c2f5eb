/**
 * AuditEventJournal — об'єднана хронологія перевірки.
 *
 * Зливає в один таймлайн події з:
 *  - audit.events (нативні події перевірки, у т.ч. запити та документи)
 *  - actsForAudit (вручення акта, заперечення, розгляд)
 *  - pprsForAudit (видача ППР, узгодження, сплата)
 *  - appealsForAudit (подача / рішення на кожній з 6 інстанцій D6)
 *
 * Сортує за датою (toggle нові/старі). Кольори — за категорією юридичного етапу.
 * Підтримує фільтр-чіпи по категоріях та клік по рядку Запит/Документ
 * для переходу на робочу вкладку.
 */

import { useMemo, useState } from "react";
import {
  Bell,
  FileText,
  MessageSquare,
  Send,
  ClipboardCheck,
  Scale,
  CheckCircle2,
  Gavel,
  AlertCircle,
  Wallet,
  ArrowUpDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type TaxAudit,
  getActForAudit,
  getPPRForAudit,
  getAppealsForAudit,
  APPEAL_INSTANCE_LABEL,
  APPEAL_STATUS_LABEL,
  type AuditEventType,
} from "@/config/taxAuditsConfig";

type Tone = "blue" | "amber" | "purple" | "emerald" | "red" | "muted";

type Category = "Перевірка" | "Запит" | "Документ" | "Акт" | "ППР" | "Скарга";

interface JournalRow {
  id: string;
  date: string;
  title: string;
  description?: string;
  /** Контекстне пояснення під заголовком: «Що це означає». */
  explanation?: string;
  /** Бейдж статусу справа від категорії. */
  status?: { label: string; tone: Tone };
  icon: LucideIcon;
  tone: Tone;
  category: Category;
  /** ID запиту для кліку → робоча вкладка */
  requestId?: string;
  /** Якщо рядок про додавання документів */
  isDocument?: boolean;
}

const TONE_CLASS: Record<Tone, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  amber: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  purple: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  muted: "bg-muted text-muted-foreground border-border",
};

const EVENT_ICON: Record<AuditEventType, LucideIcon> = {
  notification: Bell,
  documents: FileText,
  request: MessageSquare,
  response: Send,
  act: ClipboardCheck,
  appeal: Scale,
  decision: CheckCircle2,
};

const EVENT_TONE: Record<AuditEventType, Tone> = {
  notification: "blue",
  documents: "muted",
  request: "amber",
  response: "emerald",
  act: "purple",
  appeal: "purple",
  decision: "emerald",
};

const CATEGORY_ORDER: Category[] = ["Перевірка", "Запит", "Документ", "Акт", "ППР", "Скарга"];

interface Props {
  audit: TaxAudit;
  onRequestClick?: (requestId: string) => void;
  onDocumentsClick?: () => void;
}

export function AuditEventJournal({ audit, onRequestClick, onDocumentsClick }: Props) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const allRows = useMemo<JournalRow[]>(() => {
    const out: JournalRow[] = [];

    // 1. Нативні події перевірки (з підкатегоріями для запитів/документів)
    for (const e of audit.events) {
      let category: Category = "Перевірка";
      if (e.type === "request") category = "Запит";
      else if (e.type === "documents") category = "Документ";

      let explanation: string | undefined;
      let status: JournalRow["status"] | undefined;

      if (e.type === "notification") {
        explanation = "Початок процедури. Відлік процесуальних строків розпочався.";
        status = { label: "Отримано", tone: "blue" };
      } else if (e.type === "documents") {
        const n = e.documentCount;
        explanation = n
          ? `Передано ${n} ${n === 1 ? "документ" : n < 5 ? "документи" : "документів"} інспектору.`
          : "Передано пакет документів інспектору.";
        status = { label: "Виконано", tone: "emerald" };
      } else if (e.type === "request") {
        const req = e.requestId ? audit.requests.find((r) => r.id === e.requestId) : undefined;
        if (req?.status === "answered") {
          explanation = req.responseDate
            ? `Запит закрито відповіддю від ${format(parseISO(req.responseDate), "dd.MM.yyyy", { locale: uk })}${req.respondedBy ? ` (${req.respondedBy})` : ""}.`
            : "Запит закрито відповіддю.";
          status = { label: "Відповідь надано", tone: "emerald" };
        } else if (req?.status === "overdue") {
          explanation = "Дедлайн пропущено. Можливі санкції за п. 73.3 ПКУ.";
          status = { label: "Прострочено", tone: "red" };
        } else if (req) {
          explanation = `Інспектор просить пояснення/документи. Дедлайн: ${format(parseISO(req.deadline), "dd.MM.yyyy", { locale: uk })}.`;
          status = { label: "Очікує відповіді", tone: "amber" };
        } else {
          explanation = "Запит від інспектора.";
          status = { label: "Інформ.", tone: "muted" };
        }
      } else if (e.type === "response") {
        explanation = "Відповідь надіслана до ДПС.";
        status = { label: "Надіслано", tone: "emerald" };
      } else if (e.type === "act") {
        explanation = "Акт зафіксував результат перевірки. Відлік 10 р.д. на заперечення (п. 86.7 ПКУ).";
        status = { label: "Складено", tone: "purple" };
      } else if (e.type === "appeal") {
        explanation = "Стартує оскарження за процедурою ст. 56 ПКУ.";
        status = { label: "Подано", tone: "amber" };
      } else if (e.type === "decision") {
        explanation = "Прийнято процесуальне рішення.";
        status = { label: "Рішення", tone: "blue" };
      }

      out.push({
        id: `evt-${e.id}`,
        date: e.date,
        title: e.title,
        description: e.description,
        explanation,
        status,
        icon: EVENT_ICON[e.type],
        tone: EVENT_TONE[e.type],
        category,
        requestId: e.requestId,
        isDocument: e.type === "documents",
      });
    }

    // 2. Акт (вручення + заперечення + результат)
    const act = getActForAudit(audit.id);
    if (act) {
      out.push({
        id: `act-served-${act.id}`,
        date: act.servedDate,
        title: `Вручено акт ${act.number}`,
        description: act.additionalTax
          ? `Донараховано ₴${act.additionalTax.toLocaleString("uk-UA")}. Дедлайн заперечень: ${format(parseISO(act.objectionDeadline), "dd.MM.yyyy", { locale: uk })}`
          : `Дедлайн заперечень: ${format(parseISO(act.objectionDeadline), "dd.MM.yyyy", { locale: uk })}`,
        explanation: "Початок 10 робочих днів на подання заперечень (п. 86.7 ПКУ).",
        status:
          act.status === "ppr-issued"
            ? { label: "Видано ППР", tone: "red" }
            : act.status === "reviewed"
            ? { label: "Розглянуто", tone: "emerald" }
            : act.status === "objection-filed"
            ? { label: "Заперечено", tone: "amber" }
            : { label: "Вручено", tone: "purple" },
        icon: ClipboardCheck,
        tone: "purple",
        category: "Акт",
      });
      if (act.objectionDate) {
        out.push({
          id: `act-obj-${act.id}`,
          date: act.objectionDate,
          title: `Подано заперечення до акта ${act.number}`,
          description: act.objectionText?.slice(0, 140),
          explanation: "Заперечення подано в межах 10 р.д. з дня вручення акта.",
          status: { label: "Подано", tone: "amber" },
          icon: Send,
          tone: "amber",
          category: "Акт",
        });
      }
    }

    // 3. ППР
    const ppr = getPPRForAudit(audit.id);
    if (ppr) {
      out.push({
        id: `ppr-served-${ppr.id}`,
        date: ppr.servedDate,
        title: `Вручено ППР ${ppr.number} (форма ${ppr.form})`,
        description: `До сплати ₴${ppr.totalAmount.toLocaleString("uk-UA")}. Узгодити/оскаржити до ${format(parseISO(ppr.agreementDeadline), "dd.MM.yyyy", { locale: uk })}`,
        explanation: "30 календарних днів на узгодження або адміністративне/судове оскарження.",
        status:
          ppr.status === "paid"
            ? { label: "Сплачено", tone: "emerald" }
            : ppr.status === "appeal-admin" || ppr.status === "appeal-court"
            ? { label: "Оскаржено", tone: "amber" }
            : ppr.status === "enforced"
            ? { label: "На стягненні", tone: "red" }
            : { label: "Очікує дій", tone: "red" },
        icon: AlertCircle,
        tone: "red",
        category: "ППР",
      });
      if (ppr.status === "paid") {
        out.push({
          id: `ppr-paid-${ppr.id}`,
          date: ppr.agreementDeadline,
          title: `ППР ${ppr.number} сплачено`,
          explanation: "Зобов'язання погашено. Справу закрито.",
          status: { label: "Сплачено", tone: "emerald" },
          icon: Wallet,
          tone: "emerald",
          category: "ППР",
        });
      }
    }

    // 4. Скарги
    const appeals = getAppealsForAudit(audit.id);
    for (const a of appeals) {
      if (a.filedDate) {
        out.push({
          id: `appeal-filed-${a.id}`,
          date: a.filedDate,
          title: `Подано скаргу: ${APPEAL_INSTANCE_LABEL[a.instance]}`,
          description: a.number ? `№ ${a.number} · ₴${a.disputedAmount.toLocaleString("uk-UA")}` : undefined,
          explanation: `Інстанція: ${APPEAL_INSTANCE_LABEL[a.instance]}.`,
          status: a.decisionDate
            ? { label: "Розглянуто", tone: "muted" }
            : { label: "На розгляді", tone: "amber" },
          icon: Gavel,
          tone: "purple",
          category: "Скарга",
        });
      }
      if (a.decisionDate) {
        const tone: Tone = a.status === "satisfied" ? "emerald" : a.status === "partial" ? "amber" : "red";
        out.push({
          id: `appeal-decision-${a.id}`,
          date: a.decisionDate,
          title: `Рішення (${APPEAL_INSTANCE_LABEL[a.instance]}): ${APPEAL_STATUS_LABEL[a.status]}`,
          description: a.decision,
          explanation: "Процесуальне рішення по скарзі прийнято.",
          status: { label: APPEAL_STATUS_LABEL[a.status], tone },
          icon: CheckCircle2,
          tone,
          category: "Скарга",
        });
      }
    }

    return out;
  }, [audit]);

  const counts = useMemo(() => {
    const c: Record<Category, number> = {
      "Перевірка": 0, "Запит": 0, "Документ": 0, "Акт": 0, "ППР": 0, "Скарга": 0,
    };
    for (const r of allRows) c[r.category]++;
    return c;
  }, [allRows]);

  const rows = useMemo(() => {
    const filtered = activeCategory === "all"
      ? allRows
      : allRows.filter((r) => r.category === activeCategory);
    return [...filtered].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [allRows, activeCategory, sortOrder]);

  if (allRows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Подій ще немає
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar: filters + sort */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full border transition-colors",
              activeCategory === "all"
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground",
            )}
          >
            Усі <span className="opacity-70">{allRows.length}</span>
          </button>
          {CATEGORY_ORDER.filter((c) => counts[c] > 0).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-colors",
                activeCategory === c
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {c} <span className="opacity-70">{counts[c]}</span>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7"
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortOrder === "newest" ? "Спочатку нові" : "Спочатку старі"}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          За вибраним фільтром нічого немає
        </p>
      ) : (
        <ol className="relative border-l border-border/70 ml-3 space-y-4 pl-5">
          {rows.map((row) => {
            const Icon = row.icon;
            const clickable =
              (row.requestId && onRequestClick) || (row.isDocument && onDocumentsClick);
            const handleClick = () => {
              if (row.requestId && onRequestClick) onRequestClick(row.requestId);
              else if (row.isDocument && onDocumentsClick) onDocumentsClick();
            };

            return (
              <li key={row.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border",
                    TONE_CLASS[row.tone],
                  )}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <div
                  className={cn(
                    "flex items-start justify-between gap-2 flex-wrap rounded-md -mx-2 px-2 py-1",
                    clickable && "cursor-pointer hover:bg-muted/60 transition-colors",
                  )}
                  onClick={clickable ? handleClick : undefined}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleClick();
                          }
                        }
                      : undefined
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug flex items-center gap-1.5">
                      {row.title}
                      {clickable && (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                    </p>
                    {row.explanation && (
                      <p className="text-xs text-muted-foreground mt-0.5">{row.explanation}</p>
                    )}
                    {row.description && (
                      <p className="text-xs text-muted-foreground/80 mt-0.5">{row.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {row.status && (
                      <Badge variant="outline" className={cn("text-[10px]", TONE_CLASS[row.status.tone])}>
                        {row.status.label}
                      </Badge>
                    )}
                    <Badge variant="outline" className={cn("text-[10px]", TONE_CLASS[row.tone])}>
                      {row.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {format(parseISO(row.date), "dd.MM.yyyy", { locale: uk })}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/** Допоміжний хук для лічильника на табі */
export function useAuditJournalCount(audit: TaxAudit): number {
  return useMemo(() => {
    let n = audit.events.length;
    const act = getActForAudit(audit.id);
    if (act) {
      n += 1;
      if (act.objectionDate) n += 1;
    }
    const ppr = getPPRForAudit(audit.id);
    if (ppr) {
      n += 1;
      if (ppr.status === "paid") n += 1;
    }
    for (const a of getAppealsForAudit(audit.id)) {
      if (a.filedDate) n += 1;
      if (a.decisionDate) n += 1;
    }
    return n;
  }, [audit]);
}
