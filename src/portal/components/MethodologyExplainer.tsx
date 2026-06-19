import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ServiceReview } from "@/portal/data/rankings";

interface CriterionFallback {
  criterion: string;
  weight: number;
  whatWeTested: string[];
  howWeScored: string;
}

const FALLBACK: CriterionFallback[] = [
  {
    criterion: "Функціонал",
    weight: 40,
    whatWeTested: [
      "Автоматизація розрахунків (ЄСВ, ЄП, ПДФО, ВЗ)",
      "Точність формул після зміни ставок",
      "Генерація звітів і декларацій",
      "Нагадування дедлайнів та канали доставки",
      "Інтеграції (банки, ЕЦП, ДПС)",
    ],
    howWeScored: "Кожен пункт від 0 до 8 балів. Максимум 40.",
  },
  {
    criterion: "Ціна і цінність",
    weight: 25,
    whatWeTested: [
      "Базовий тариф для одного ФОП/ТОВ",
      "Тестовий період і чи потрібна картка",
      "Приховані платежі та обмеження базового тарифу",
      "Гнучкість оплати (місяць vs рік)",
    ],
    howWeScored: "Співвідношення ціна/функціонал порівняно з конкурентами. Максимум 25.",
  },
  {
    criterion: "Підтримка",
    weight: 20,
    whatWeTested: [
      "Час відповіді (чат, email)",
      "Канали підтримки (24/7, телефон, Telegram)",
      "Якість і компетентність відповідей",
      "База знань і документація",
    ],
    howWeScored: "Реальні запити від тестувальника. Максимум 20.",
  },
  {
    criterion: "UX",
    weight: 15,
    whatWeTested: [
      "Швидкість онбордингу (час до першого результату)",
      "Зрозумілість інтерфейсу без навчання",
      "Мобільна версія",
      "Кількість помилок користувача за сесію",
    ],
    howWeScored: "Сценарії типового ФОП протягом 18 годин. Максимум 15.",
  },
];

interface Props {
  /** Опційно: review топ-1 сервісу категорії — щоб дістати реальні `whatWeTested` і `howWeScored` */
  sampleReview?: ServiceReview;
}

export const MethodologyExplainer = ({ sampleReview }: Props) => {
  const criteria = sampleReview?.methodology.weights?.length
    ? sampleReview.methodology.weights.map((w) => ({
        criterion: w.criterion,
        weight: w.weight,
        whatWeTested: w.whatWeTested,
        howWeScored: w.howWeScored,
      }))
    : FALLBACK;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-foreground">Методологія</span>
        <span className="text-[10px] text-muted-foreground">— натисніть для деталей</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {criteria.map((c) => (
          <Popover key={c.criterion}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`Деталі критерію ${c.criterion}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:bg-muted hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
              >
                <span className="font-medium">{c.criterion}</span>
                <span className="text-muted-foreground">{c.weight}%</span>
                <Info className="w-3 h-3 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-4">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground">{c.criterion}</h4>
                  <span className="text-xs font-mono text-muted-foreground">вага {c.weight}%</span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                    Що ми тестували
                  </p>
                  <ul className="space-y-1">
                    {c.whatWeTested.map((t) => (
                      <li key={t} className="text-xs text-foreground flex gap-1.5">
                        <span className="text-muted-foreground shrink-0">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                    Як рахуємо бали
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.howWeScored}</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </div>
  );
};
