import { useState, useEffect, useCallback } from "react";
import { ChevronDown, AlertTriangle, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { InlineCalculator } from "@/portal/components/InlineCalculator";
import { FaqAccordion } from "@/portal/components/FaqAccordion";
import { ContextualCta } from "@/portal/components/ContextualCta";
import { Link } from "react-router-dom";
import type { Article } from "@/portal/data/articles";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const TOC_ITEMS = [
  { id: "groups", label: "Групи ФОП: порівняння" },
  { id: "rates", label: "Ставки єдиного податку" },
  { id: "esv", label: "ЄСВ у 2025 році" },
  { id: "reporting", label: "Звітність та дедлайни" },
  { id: "changes", label: "Зміни у 2025 року" },
  { id: "faq", label: "FAQ" },
];

const FAQ_ITEMS = [
  { question: "Чи може ФОП 2 групи надавати послуги юридичним особам?", answer: "Так, може. ФОП 2 групи може надавати послуги як фізичним, так і юридичним особам. Обмеження стосується лише видів діяльності, а не типу клієнтів." },
  { question: "Як перейти з 2 на 3 групу ФОП?", answer: "Подати заяву у ДПС до 15-го числа останнього місяця кварталу. Перехід відбувається з 1-го числа наступного кварталу. Форма заяви — F0102103." },
  { question: "Чи потрібно ФОП сплачувати ЄСВ під час відпустки?", answer: "ФОП 1 групи мають право не сплачувати ЄСВ за один місяць відпустки на рік. ФОП 2 та 3 груп — сплачують ЄСВ незалежно від відпустки." },
  { question: "Що буде при перевищенні ліміту доходу?", answer: "При перевищенні ліміту ФОП зобов'язаний перейти на вищу групу або загальну систему з 1-го числа місяця наступного після перевищення." },
  { question: "Коли подавати звіт ФОП за Q1 2025?", answer: "До 12 травня 2025 (40 днів після кінця кварталу). Сплата єдиного податку — до 19 травня 2025." },
];

const COMPARISON_ROWS = [
  { label: "Ліміт доходу", values: ["1 085 500 ₴", "5 587 800 ₴", "9 336 000 ₴", "с/г"] },
  { label: "Найняті", values: ["Заборонено", "До 10", "Без обмежень", "Без обмежень"] },
  { label: "Ставка ЄП", values: ["302.80 ₴/міс", "1 600 ₴/міс", "5% або 3%", "—"] },
  { label: "Звітність", values: ["Річна", "Річна", "Квартальна", "Річна"] },
  { label: "ПДВ", values: ["Заборонено", "Заборонено", "Можливо", "—"] },
];

export const TOC_ITEMS_DATA = TOC_ITEMS;

const handleTocSelect = (i: number) => {
  const element = document.getElementById(TOC_ITEMS[i].id);
  if (element) {
    const offset = 100;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

export const DesktopTableOfContents = ({ activeIndex, onSelect }: { activeIndex: number; onSelect: (i: number) => void }) => (
  <nav className="sticky top-24" aria-label="Зміст статті">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Зміст</p>
    <div className="border-l-2 border-border space-y-1 pl-4">
      {TOC_ITEMS.map((item, i) => (
        <button
          key={i}
          onClick={() => { onSelect(i); handleTocSelect(i); }}
          aria-current={i === activeIndex ? "true" : undefined}
          className={`block w-full text-left text-sm py-1 transition-colors ${i === activeIndex ? "text-primary font-medium border-l-2 border-primary -ml-[18px] pl-[14px]" : "text-muted-foreground hover:text-foreground"}`}
        >
          {i + 1}. {item.label}
        </button>
      ))}
    </div>
  </nav>
);

const MobileTableOfContents = ({ activeIndex, onSelect }: { activeIndex: number; onSelect: (i: number) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            Зміст
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-1">
          {TOC_ITEMS.map((item, i) => (
            <button
              key={i}
              onClick={() => { onSelect(i); handleTocSelect(i); setOpen(false); }}
              aria-current={i === activeIndex ? "true" : undefined}
              className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${i === activeIndex ? "text-primary font-medium bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}
            >
              {i + 1}. {item.label}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

interface Props {
  article: Article;
}

export const ArticleBody = ({ article }: Props) => {
  const [activeSection, setActiveSection] = useState(0);
  const [rating, setRating] = useState<"up" | "down" | null>(null);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = TOC_ITEMS.findIndex((t) => t.id === entry.target.id);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );
    TOC_ITEMS.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <MobileTableOfContents activeIndex={activeSection} onSelect={setActiveSection} />

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        {/* Section 1 */}
        <section>
          <h2 id="groups" className="text-2xl font-bold text-foreground">Групи ФОП: хто може перебувати</h2>
          <p className="text-muted-foreground leading-relaxed">
            В Україні діють 4 групи єдиного податку для ФОП. Кожна група має свої обмеження по доходу,
            кількості найманих працівників та видам діяльності. Вибір групи впливає на ставку податку,
            обов'язковість ПДВ та частоту подачі звітності.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]" />
                  <TableHead>Гр. 1</TableHead>
                  <TableHead>Гр. 2</TableHead>
                  <TableHead>Гр. 3</TableHead>
                  <TableHead>Гр. 4</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row, i) => (
                  <TableRow key={i} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                    {row.values.map((v, j) => (
                      <TableCell key={j} className="text-muted-foreground">{v}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Section 2 - Calculator */}
        <section>
          <h2 id="rates" className="text-2xl font-bold text-foreground">Ставки єдиного податку</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ставки єдиного податку залежать від групи ФОП та наявності реєстрації платником ПДВ.
            ФОП 3 групи без ПДВ сплачують 5% від доходу, з ПДВ — 3%.
          </p>
          <InlineCalculator type="tax" />
        </section>

        {/* Sections 3-6 + normative base — conditionally blurred for premium */}
        {article.isPremium ? (
          <div className="relative">
            <div className="blur-sm select-none pointer-events-none space-y-8">
              <section>
                <h2 id="esv" className="text-2xl font-bold text-foreground">ЄСВ у 2025 році</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мінімальний розмір ЄСВ прив'язаний до мінімальної заробітної плати...
                </p>
              </section>
              <section>
                <h2 id="reporting" className="text-2xl font-bold text-foreground">Звітність та дедлайни</h2>
                <p className="text-muted-foreground leading-relaxed">Квартальна та річна звітність...</p>
              </section>
              <section>
                <h2 id="changes" className="text-2xl font-bold text-foreground">Зміни у 2025 року</h2>
                <p className="text-muted-foreground leading-relaxed">Актуальні зміни законодавства...</p>
              </section>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card border rounded-xl p-6 text-center shadow-lg max-w-sm">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold mb-1">Матеріал для підписників</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Отримайте повний доступ до преміум-матеріалів з підпискою FINTODO
                </p>
                <Button asChild>
                  <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно →</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Section 3 - ESV */}
            <section>
              <h2 id="esv" className="text-2xl font-bold text-foreground">ЄСВ у 2025 році</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мінімальний розмір ЄСВ прив'язаний до мінімальної заробітної плати. У 2025 році мінімальна
                зарплата складає 8 000 грн, відповідно мінімальний ЄСВ — 1 760 грн на місяць (22%).
              </p>
            </section>

            {/* Section 4 - Reporting */}
            <section>
              <h2 id="reporting" className="text-2xl font-bold text-foreground">Звітність та дедлайни</h2>
              <p className="text-muted-foreground leading-relaxed">
                ФОП 1 та 2 груп подають річну декларацію до 1 березня наступного року. ФОП 3 групи подають
                квартальну декларацію протягом 40 днів після закінчення кварталу.
              </p>
            </section>

            {/* Section 5 - Changes */}
            <section>
              <h2 id="changes" className="text-2xl font-bold text-foreground">Зміни у 2025 року</h2>
              <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">⚠️ Увага: зміни з 1 квітня 2025</p>
                    <ul className="list-disc pl-4 text-amber-700 dark:text-amber-400 space-y-1">
                      <li>Ставка ЄСВ прив'язана до мінімальної зарплати 8 000 грн</li>
                      <li>Нова форма декларації починаючи з Q2 2025</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 - FAQ */}
            <section>
              <h2 id="faq" className="text-2xl font-bold text-foreground sr-only">FAQ</h2>
              <FaqAccordion items={FAQ_ITEMS} />
            </section>

            {/* Normative base */}
            <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="h-4 w-4" />
                Нормативна база:
              </div>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                <li>ПКУ України, ст. 291–300</li>
                <li>Закон № 2464-VI "Про ЄСВ"</li>
                <li>Наказ МФУ № 578 (форма декларації)</li>
              </ul>
            </div>
          </>
        )}

        {/* CTA */}
        <ContextualCta
          title="Рахуєте ЄСВ та єдиний податок вручну щомісяця?"
          body="fintodo автоматично розраховує суми, формує платіжки і нагадує про дедлайни за 3 дні. Жодної ручної роботи."
          ctaLabel="Почати безкоштовно →"
          ctaHref={CTA_CHECKOUT_URL}
        />

        {/* Article footer */}
        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Стаття корисна?</span>
            {rating === null ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setRating("up")}>
                  <ThumbsUp className="h-4 w-4" /> Так
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRating("down")}>
                  <ThumbsDown className="h-4 w-4" /> Ні
                </Button>
              </>
            ) : (
              <span className="text-sm text-primary font-medium">Дякуємо!</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">#{tag}</Badge>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Оновлено: {new Date(article.updatedAt).toLocaleDateString("uk-UA")}
          </p>
          <p className="text-xs text-muted-foreground italic">
            Матеріал має інформаційний характер та не є індивідуальною податковою консультацією. Для прийняття рішень зверніться до сертифікованого бухгалтера.
          </p>
        </div>
      </div>
    </div>
  );
};
