import { differenceInDays } from "date-fns";
import { formatDate } from "@/lib/formatters";

export type RelevanceBadgeInfo = {
  label: string;
  variant: "success" | "warning" | "outline";
  /** Назва джерела для відображення у тултіпі/підпису (опц.) */
  source?: string;
  /** Канонічне URL джерела (НБУ, Держстат, zakon.rada.gov.ua тощо) — робить бейдж клікабельним */
  sourceUrl?: string;
};

export type RelevanceBadgeOptions = {
  source?: string;
  sourceUrl?: string;
};

/**
 * Повертає інформацію для UI-бейджа актуальності.
 *
 * @param date            ISO-дата факту (asOf)
 * @param updatedDate     ISO-дата останнього оновлення (опц.) — має пріоритет над `date`
 * @param options.source     Назва джерела ("НБУ", "Держстат", "zakon.rada.gov.ua")
 * @param options.sourceUrl  Канонічне посилання — рендериться як клікабельний бейдж
 */
export function getRelevanceBadge(
  date: string,
  updatedDate?: string,
  options?: RelevanceBadgeOptions,
): RelevanceBadgeInfo {
  const refDate = updatedDate || date;
  const daysDiff = differenceInDays(new Date(), new Date(refDate));

  const base: Pick<RelevanceBadgeInfo, "source" | "sourceUrl"> = {
    source: options?.source,
    sourceUrl: options?.sourceUrl,
  };

  if (daysDiff <= 90) {
    return {
      ...base,
      label: updatedDate && updatedDate !== date
        ? `Оновлено ${formatDate(updatedDate)}`
        : "Актуально",
      variant: "success",
    };
  }
  if (daysDiff <= 180) {
    return {
      ...base,
      label: `Перевірено ${formatDate(refDate)}`,
      variant: "warning",
    };
  }
  return {
    ...base,
    label: `Від ${formatDate(refDate)}`,
    variant: "outline",
  };
}
