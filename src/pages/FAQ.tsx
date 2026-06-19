import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  Building2,
  FileText,
  Receipt,
  CreditCard,
  Gift,
  Rocket,
  Wallet,
  LineChart,
  Sparkles,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import { cn } from "@/lib/utils";

interface FAQProps {
  onBack?: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: FAQItem[];
}

interface QuickStartStep {
  num: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}

const quickStartSteps: QuickStartStep[] = [
  {
    num: 1,
    icon: Wallet,
    title: "Додайте перший платіж",
    description: "Розділ «Платежі» → кнопка «+ Платіж». Вкажіть тип, суму, контрагента і рахунок.",
    href: "/dashboard?tab=operations&section=payments",
  },
  {
    num: 2,
    icon: Receipt,
    title: "Заповніть рахунки",
    description: "Налаштування → Рахунки. Додайте IBAN і банк — без них прогноз не працюватиме.",
    href: "/dashboard?tab=settings&section=accounts",
  },
  {
    num: 3,
    icon: LineChart,
    title: "Прочитайте прогноз",
    description: "Аналітика → Сьогодні. 30-денний графік потоку з попередженням про касовий розрив.",
    href: "/dashboard?tab=analytics",
  },
];

const faqData: FAQCategory[] = [
  {
    id: "getting-started",
    label: "Перші кроки",
    icon: Rocket,
    questions: [
      {
        question: "Як додати платіж за 30 секунд?",
        answer: "Відкрийте розділ «Платежі» в нижній навігації → натисніть кнопку «+ Платіж» у верхньому правому куті. У формі: 1) оберіть тип (надходження або витрата); 2) введіть суму; 3) виберіть контрагента зі списку (або створіть нового на льоту); 4) виберіть банківський рахунок; 5) за потреби додайте призначення платежу. Натисніть «Зберегти» — платіж одразу з'явиться в таблиці. Для повторюваних платежів використовуйте шаблони (іконка зірочки у формі)."
      },
      {
        question: "Як заповнити банківський рахунок?",
        answer: "Перейдіть у Налаштування → Рахунки → «Додати рахунок». Введіть IBAN у форматі UA + 27 цифр (система перевірить контрольну суму автоматично). Виберіть банк зі списку — назва, МФО і SWIFT підтягнуться автоматично. Вкажіть валюту (UAH, USD, EUR тощо). Поставте прапорець «Основний», якщо це головний робочий рахунок — він буде обиратися за замовчуванням у формах платежів. Для Monobank і ПриватБанку доступна автосинхронізація — натисніть «Підключити банк» замість ручного введення."
      },
      {
        question: "Як читати прогноз касового потоку?",
        answer: "Прогноз живе в Аналітика → вкладка «Сьогодні» (між KPI-стрічкою і блоком «Прогноз дій»). Це area-chart на 30 днів вперед, побудований на основі запланованих платежів і регулярних надходжень. Червоний бейдж зверху графіка = ймовірний касовий розрив; під ним показана дата і сума розриву. Якщо бейдж зелений — на найближчий місяць все спокійно. Натисніть на точку графіка — побачите перелік платежів, які впливають на цей день."
      },
      {
        question: "Як швидко знайти потрібну функцію?",
        answer: "Три способи: 1) Глобальний пошук (Cmd/Ctrl+K у будь-якому місці системи) — шукає по розділах, контрагентах, документах, FAQ. 2) AI-чат — напишіть «Як зробити X» і консультант підкаже, де це знаходиться, або зробить замість вас. 3) Нижня навігація (мобільний) або ліва панель (десктоп) — основні розділи завжди під рукою."
      },
      {
        question: "Як перейти між кабінетами?",
        answer: "Якщо у вас декілька бізнесів (наприклад, ФОП + ТОВ), використовуйте перемикач кабінетів у шапці dashboard — натисніть на назву поточного кабінету і виберіть інший зі списку. Альтернативно — відкрийте сторінку «Кабінети» (профіль → Кабінети), натисніть «Увійти в кабінет» біля потрібного бізнесу."
      },
      {
        question: "Як запросити співробітника?",
        answer: "Налаштування → Команда → «Запросити учасника». Введіть email, виберіть роль: Власник (повний доступ), Головний бухгалтер (всі фінансові операції, без керування командою) або HR/Кадри (тільки розділ співробітників). Запрошувати може лише Власник — це захищає від несанкціонованих витрат токенів. Запрошений отримає лист з посиланням на реєстрацію і автоматично приєднається до кабінету."
      },
      {
        question: "Як налаштувати сповіщення?",
        answer: "Профіль → Сповіщення. Доступні три канали: in-app (значок дзвіночка), email і push (браузер/мобільний). Для кожного типу події (дедлайн звіту, касовий розрив, нова операція, повідомлення команди) можна окремо ввімкнути/вимкнути канали. Режим «Право на спокій» дозволяє вимкнути всі несрочні сповіщення в задані години — критичні (термінові дедлайни, фінансові ризики) все одно дійдуть."
      },
      {
        question: "Як використовувати AI-консультанта?",
        answer: "Відкрийте чат (іконка консультанта в шапці або кнопка «Чат» у нижній навігації мобільного). Запитайте все, що стосується податків, обліку чи роботи в системі — консультант знає ПКУ, актуальні ставки, дедлайни і контекст вашого кабінету (систему оподаткування, групу ФОП, обороти). Може не лише відповідати, а й виконувати дії: «додай витрату 500 грн на бензин», «покажи звіт за квартал». Ліміт запитів залежить від тарифу — повна історія консультацій доступна в розділі «Консультації»."
      },
    ],
  },
  {
    id: "general",
    label: "Загальні",
    icon: HelpCircle,
    questions: [
      {
        question: "Що таке AI-Бухгалтер?",
        answer: "AI-Бухгалтер — це інтелектуальний помічник для ведення бухгалтерського обліку ФОП та ТОВ. Він допомагає з аналітикою доходів і витрат, нагадує про дедлайни звітності, допомагає формувати документи та відповідає на питання щодо оподаткування."
      },
      {
        question: "Як почати роботу з системою?",
        answer: "Після входу в систему вам потрібно створити перший кабінет — це може бути ваш ФОП або ТОВ. Кабінет містить всю інформацію про бізнес: реквізити, банківські рахунки, систему оподаткування. Після створення кабінету ви зможете користуватися всіма функціями системи."
      },
      {
        question: "Чи безпечно зберігати дані в системі?",
        answer: "Так, ми використовуємо сучасні методи шифрування для захисту ваших даних. Всі з'єднання захищені SSL-сертифікатом, а доступ до облікового запису можливий лише після авторизації. Ваші фінансові дані не передаються третім особам."
      },
      {
        question: "Що робити, якщо не бачу свої дані?",
        answer: "Найчастіші причини: 1) Активний фільтр періоду — перевірте тулбар над таблицею (бейдж «X з Y» сигналізує, що частина даних відфільтрована; натисніть «Скинути всі»). 2) Ви в іншому кабінеті — перевірте назву поточного кабінету в шапці і за потреби перемкніться. 3) Банківська синхронізація неактивна — Налаштування → Рахунки → перевірте статус підключення до банку (має бути зелений «Активно»). 4) Дані ще обробляються — після імпорту виписки індексація може зайняти до 1-2 хвилин."
      },
    ],
  },
  {
    id: "cabinets",
    label: "Кабінети",
    icon: Building2,
    questions: [
      {
        question: "Що таке кабінет?",
        answer: "Кабінет — це окремий робочий простір для одного бізнесу (ФОП або ТОВ). Кожен кабінет має власні реквізити, банківські рахунки, систему оподаткування та аналітику. Ви можете мати декілька кабінетів і легко перемикатися між ними."
      },
      {
        question: "Як створити новий кабінет?",
        answer: "Перейдіть на сторінку 'Кабінети' та натисніть кнопку 'Додати кабінет'. Заповніть основну інформацію: назву, тип (ФОП або ТОВ), систему оподаткування. Після створення ви зможете доповнити профіль кабінету детальнішою інформацією."
      },
      {
        question: "Як перемикатися між кабінетами?",
        answer: "На сторінці 'Кабінети' відображаються всі ваші кабінети. Натисніть 'Увійти в кабінет' для потрібного бізнесу. Також ви можете використати випадаючий список у заголовку для швидкого перемикання, коли вже знаходитесь всередині кабінету."
      },
    ],
  },
  {
    id: "reports",
    label: "Звітність",
    icon: FileText,
    questions: [
      {
        question: "Які звіти потрібно подавати ФОП на спрощеній системі?",
        answer: "ФОП на спрощеній системі (група 1-3) подають декларацію платника єдиного податку раз на рік до 9 лютого. Якщо ви платник ПДВ, додатково подаєте декларацію з ПДВ щомісяця або щокварталу. Також потрібно сплачувати ЄСВ щомісяця або щокварталу."
      },
      {
        question: "Коли дедлайн сплати ЄСВ?",
        answer: "ЄСВ сплачується до 19 числа місяця, наступного за кварталом. Наприклад, за I квартал — до 19 квітня, за II квартал — до 19 липня, за III квартал — до 19 жовтня, за IV квартал — до 19 січня наступного року."
      },
      {
        question: "Система нагадує про дедлайни?",
        answer: "Так, система автоматично нагадує про наближення дедлайнів звітності та сплати податків. Ви отримаєте сповіщення за 7 днів, за 3 дні та в день дедлайну. Налаштувати сповіщення можна в налаштуваннях кабінету."
      },
      {
        question: "Як аналітика рахує Health Score?",
        answer: "Health Score — це 0-100 показник «здоров'я» бізнесу, агрегований з 5 драйверів: ліквідність (наявні кошти ÷ середньомісячні витрати), своєчасність платежів, диверсифікація доходів (% від найбільшого клієнта), маржинальність і дисципліна обліку (повнота категоризації). Найслабший драйвер відображається як «Primary driver» з конкретним чек-листом дій («погасіть прострочення X», «розкатегоризуйте N операцій»). Score оновлюється раз на добу і показує дельту до попереднього тижня."
      },
    ],
  },
  {
    id: "documents",
    label: "Документи",
    icon: Receipt,
    questions: [
      {
        question: "Які документи можна створювати в системі?",
        answer: "Ви можете створювати рахунки-фактури, акти виконаних робіт, видаткові накладні та інші первинні документи. Всі документи зберігаються в електронному вигляді та можуть бути експортовані у PDF для друку або надсилання клієнтам."
      },
      {
        question: "Як додати витрату?",
        answer: "Перейдіть у розділ 'Сервіси' вашого кабінету та оберіть 'Додати витрату'. Вкажіть суму, категорію витрати, дату та за потреби додайте коментар. Також ви можете сказати AI-помічнику 'Додай витрату' у чаті."
      },
      {
        question: "Чи можна імпортувати банківську виписку?",
        answer: "Так, ви можете підключити банківську інтеграцію (Monobank, ПриватБанк) або завантажити виписку у форматі CSV/Excel. Система автоматично категоризує операції та додасть їх до обліку."
      },
      {
        question: "Як працює універсальна стрічка показників на Платежах?",
        answer: "Стрічка над таблицею Платежів має два режими. 1) «Сьогодні» (за замовчуванням, коли немає фільтрів) — показує метрики дня: залишки на рахунках, надходження/витрати за сьогодні, чистий потік. Заголовок: «За сьогодні · {дата}». 2) «Фільтрована вибірка» (коли активний хоч один фільтр) — ті самі метрики, але перераховані для відфільтрованої вибірки платежів. Заголовок: «Період: {назва}» або «Фільтрована вибірка». Лічильник «X з Y» і список фільтрів живуть у тулбарі вище — у стрічці їх немає, щоб не дублювати."
      },
    ],
  },
  {
    id: "billing",
    label: "Тарифи",
    icon: CreditCard,
    questions: [
      {
        question: "Які тарифні плани доступні?",
        answer: "Ми пропонуємо три тарифи: «Старт» (4 990 кредитів/міс., для ФОП та малих компаній), «Смарт» (16 990 кредитів/міс., найчастіше обирають) та «Преміум» (28 990 кредитів/міс., для активних компаній та агенцій). Детальніше на сторінці «Тариф і кредити»."
      },
      {
        question: "Що таке кредити?",
        answer: "Кредити — це внутрішня валюта для всіх операцій: створення документів, платежів, звітів, AI-сесій. Наприклад: пакет документів ≈200 кредитів, податковий звіт ≈300 кредитів, AI-сесія ≈100-150 кредитів. Кредити не згорають і переходять на наступний період."
      },
      {
        question: "Як змінити тарифний план?",
        answer: "Перейдіть у профіль користувача → 'Тариф і кредити'. Там ви зможете переглянути поточний план, залишок кредитів та перейти на інший тариф. Зміна тарифу набуває чинності з наступного білінгового періоду."
      },
    ],
  },
  {
    id: "referral",
    label: "Реферальна програма",
    icon: Gift,
    questions: [
      {
        question: "Як працює реферальна програма?",
        answer: "Запрошуйте нових користувачів (контрагентів або учасників команди) і отримуйте кредити за кожну реєстрацію. Кредити накопичуються на вашому профілі і можуть бути конвертовані в будь-який кабінет, де ви є власником. Чим більше рефералів — тим вищий ваш рівень і більша винагорода за кожного наступного."
      },
      {
        question: "Скільки кредитів я отримаю за запрошення?",
        answer: "Базова винагорода становить +5K кредитів за кожного нового контрагента або учасника команди. Додатково ви отримуєте +5K кредитів, коли ваш реферал здійснить першу оплату. З підвищенням рівня винагорода зростає: Промоутер — +10K, Амбасадор — +15K, Партнер — +20K за кожного реферала."
      },
      {
        question: "Які є рівні в реферальній програмі?",
        answer: "Система має 4 рівні: Старт (0+ рефералів, +5K), Промоутер (5+ рефералів, +10K + безкоштовний місяць Смарт), Амбасадор (15+ рефералів, +15K + 20% знижка назавжди), Партнер (50+ рефералів, +20K + 10% від платежів рефералів). Рівень визначається загальною кількістю запрошених користувачів."
      },
      {
        question: "Чи нараховуються кредити за існуючих користувачів?",
        answer: "Ні, кредити нараховуються виключно за НОВИХ користувачів системи. Якщо ви запрошуєте людину, яка вже зареєстрована в системі (наприклад, додаєте існуючого користувача до команди), бонус не нараховується. Система автоматично перевіряє унікальність кожного реферала."
      },
      {
        question: "Хто може запрошувати учасників команди?",
        answer: "Запрошувати нових учасників до команди кабінету може виключно Власник кабінету. Це обмеження пов'язане з тим, що кожен новий учасник створює фінансові зобов'язання (використання токенів) для власника. Головний бухгалтер та HR/Кадри можуть переглядати команду, але не мають права на запрошення."
      },
      {
        question: "Як конвертувати зароблені кредити?",
        answer: "Зароблені кредити накопичуються на вашому особистому балансі профілю. Для використання їх потрібно конвертувати в кабінет, де ви є Власником. Перейдіть до Профіль → Заробіток, оберіть кабінет та вкажіть суму конвертації (мінімум 1000 кредитів). Конвертовані кредити використовуються для оплати послуг в обраному кабінеті."
      },
      {
        question: "Чому я не можу конвертувати кредити?",
        answer: "Конвертація можлива тільки в кабінети, де ви маєте роль Власника. Якщо ви є лише учасником команди (Головний бухгалтер, HR/Кадри) в кабінетах, конвертація недоступна. Створіть власний кабінет (ФОП або ТОВ) або отримайте права власника в існуючому кабінеті."
      },
      {
        question: "Який курс конвертації кредитів?",
        answer: "Орієнтовний курс: 1000 кредитів ≈ 1 грн (на основі тарифу Смарт). Наприклад, 5K кредитів ≈ 5 грн, 20K кредитів ≈ 20 грн. Кредити використовуються для оплати запитів до AI-помічника та інших платних послуг системи."
      },
      {
        question: "Що таке Revenue Share для рівня Партнер?",
        answer: "Досягнувши рівня Партнер (50+ рефералів), ви отримуєте 10% від усіх платежів ваших рефералів назавжди. Це пасивний дохід: кожного разу, коли залучений вами клієнт оплачує підписку або поповнює баланс, ви автоматично отримуєте 10% на свій баланс. Це не MLM — ви отримуєте відсоток тільки від прямих рефералів."
      },
      {
        question: "Де подивитися історію нарахувань?",
        answer: "Вся історія реферальних транзакцій доступна в розділі Профіль → Заробіток. Там ви побачите: список усіх рефералів, дати реєстрації, статуси оплат, нараховані кредити та досягнуті бонуси за рівні. Також відображається статистика по кожному кабінету, звідки прийшли ваші реферали."
      }
    ]
  }
];

const QUICKSTART_LS_KEY = "faq_quickstart_collapsed";

const FAQ = ({ onBack }: FAQProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [quickstartOpen, setQuickstartOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(QUICKSTART_LS_KEY) !== "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(QUICKSTART_LS_KEY, quickstartOpen ? "0" : "1");
  }, [quickstartOpen]);

  const filteredData = useMemo(() => {
    return faqData
      .filter(category => !activeCategory || category.id === activeCategory)
      .map(category => ({
        ...category,
        questions: category.questions.filter(
          q =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(category => category.questions.length > 0);
  }, [searchQuery, activeCategory]);

  const totalResults = filteredData.reduce((sum, cat) => sum + cat.questions.length, 0);
  const totalQuestions = faqData.reduce((sum, cat) => sum + cat.questions.length, 0);

  const hasActiveFilters = searchQuery !== "" || activeCategory !== null;

  const activeChips = [
    searchQuery && { key: "search", label: `"${searchQuery}"`, onRemove: () => setSearchQuery("") },
    activeCategory && {
      key: activeCategory,
      label: faqData.find(c => c.id === activeCategory)?.label || "",
      onRemove: () => setActiveCategory(null)
    }
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-6 pt-5 pb-4 space-y-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0 h-9 w-9"
              aria-label="Повернутися назад"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">Питання та відповіді</h1>
          </div>
        </div>

        <UnifiedToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Пошук по питаннях..."
          resultsCount={hasActiveFilters ? { shown: totalResults, total: totalQuestions } : undefined}
          activeChips={activeChips}
          onClearAllFilters={() => { setSearchQuery(""); setActiveCategory(null); }}
          sticky={false}
          className="px-0"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Badge
            variant={activeCategory === null ? "default" : "outline"}
            className="cursor-pointer shrink-0 hover:bg-primary/90 h-7"
            onClick={() => setActiveCategory(null)}
          >
            Усі
          </Badge>
          {faqData.map((category) => (
            <Badge
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="cursor-pointer shrink-0 hover:bg-primary/90 h-7"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-safe">
          {/* Quick Start Reader — visible only when no filters */}
          {!hasActiveFilters && (
            <Collapsible open={quickstartOpen} onOpenChange={setQuickstartOpen}>
              <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-sm">Швидкий старт за 3 кроки</h2>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      quickstartOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {quickStartSteps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <Link
                          key={step.num}
                          to={step.href}
                          className="group relative rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-[var(--shadow-md)] transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                              {step.num}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-medium leading-tight">{step.title}</h3>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                {step.description}
                              </p>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                                Перейти
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Нічого не знайдено</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Спробуйте змінити пошуковий запит або категорію
              </p>
            </div>
          ) : (
            filteredData.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className="h-4 w-4 text-primary" />
                  <h2 className="font-medium text-sm">{category.label}</h2>
                  <span className="text-xs text-muted-foreground">
                    ({category.questions.length})
                  </span>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                      className="border rounded-lg px-4 bg-card"
                    >
                      <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}

          {/* AI consultant CTA — always at bottom */}
          <Link
            to="/consultant"
            className="block rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 hover:border-primary/50 hover:shadow-[var(--shadow-md)] transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-1">Не знайшли відповідь?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  Запитайте AI-консультанта — він знає податкове законодавство і контекст вашого кабінету.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                  Відкрити консультанта
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </ScrollArea>
    </div>
  );
};

export default FAQ;
