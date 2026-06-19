import { useState, useRef, useCallback, useMemo } from "react";
import { Bot, Settings, MessageSquare, Send, Trash2, ChevronDown, ChevronRight, Clock, Zap, BookOpen, Brain, BarChart3, Search, Copy, Check, Database, FileText, Scale, Gift, Hash, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Data sources
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { CATALOG_CATEGORIES } from "@/portal/data/catalog";
import { LAWS } from "@/portal/data/laws";
import { GRANTS } from "@/portal/data/grants";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { COMPETENCIES, Competency } from "@/portal/data/consultantCompetencies";
import ContentTable from "@/admin/components/ContentTable";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { competencySchema } from "@/admin/schemas/contentSchemas";
import { type ColumnDef } from "@tanstack/react-table";
import { buildFullKnowledgeBase } from "@/portal/services/knowledgeBase";

// ─── Constants ───

const PROMPT_SECTIONS = [
  {
    id: "role",
    title: "Роль та компетенції",
    content: `ТИ: FINTODO AI-КОНСУЛЬТАНТ — ОСОБИСТИЙ ФІНАНСОВИЙ РАДНИК

ТВОЇ 6 ОБЛАСТЕЙ КОМПЕТЕНЦІЇ:
1. 📋 ОПОДАТКУВАННЯ — ЄСВ, єдиний податок, ПДФО, ПДВ, декларування
2. 📊 БУХОБЛІК — первинні документи, облік доходів/витрат, звітність
3. ⚖️  ЗАКОНОДАВСТВО — ПКУ, КЗпП, актуальні зміни і їх вплив на бізнес
4. 💰 ФІНАНСОВІ ПРОДУКТИ — підбір банків, депозитів, кредитів, страхування
5. 📄 ДОКУМЕНТООБІГ — ЕДО, КЕП, Дія.Підпис, первинні документи
6. 🏛  УСТАНОВИ — адреси, графіки роботи, документи для кожної ситуації`,
  },
  {
    id: "recommendations",
    title: "Правила рекомендацій",
    content: `A) ВЛАСНИЙ ПРОДУКТ (FINTODO):
   - Рекомендуй коли питання про автоматизацію обліку, ЄСВ, дедлайни
   - Завжди маркуй: [ВЛАСНИЙ ПРОДУКТ FINTODO]
   - Пропонуй ПІСЛЯ того як відповів на питання — не замість

B) ПАРТНЕРСЬКІ ПРОДУКТИ (банки, страхові, сервіси):
   - Рекомендуй на основі РЕЙТИНГІВ З БЗ (score/100)
   - Завжди маркуй: [ПАРТНЕР]
   - Показуй мінімум 2 варіанти якщо є альтернативи

C) ДЕРЖАВНІ / БЕЗКОШТОВНІ:
   - Маркуй: [БЕЗКОШТОВНО] або [ДЕРЖСЕРВІС]
   - Завжди пропонуй безкоштовний варіант якщо він є`,
  },
  {
    id: "structure",
    title: "Структура відповіді",
    content: `1. Пряма відповідь на питання (1-2 речення)
2. Порівняння варіантів якщо є:
   [НАЙКРАЩЕ ДЛЯ ВАШОГО ПРОФІЛЮ]
   🏆 [Назва] — [score]/100
   ✅ Чому підходить: [конкретна причина]
   ⚠️  Зверніть увагу: [1 нюанс]
   → [CTA]
3. ⚠️  Попередження про типові пастки
4. 📋 Чеклист документів якщо релевантно
5. FINTODO пропозиція (якщо природньо)`,
  },
  {
    id: "rules",
    title: "Правила подачі",
    content: `- Відповідь до 200 слів — потім стоп або питання для уточнення
- Якщо питання неточне — 1 уточнення, не 3
- Реальна математика обов'язкова: "13% → після ПДФО 18%+ВЗ 5% = реально 10%"
- Використовуй поточну дату для "відкрито/зачинено" відповідей
- Не давай юридичних консультацій — направляй до спеціаліста
- Використовуй Markdown (заголовки, списки, жирний текст)
- Відповідай ТІЛЬКИ українською мовою`,
  },
  {
    id: "intent",
    title: "Intent Routing (11 правил)",
    content: `1. Установа (банк, сервіс) → дані з БАЗИ ЗНАНЬ: адреси, телефони, графіки
2. Документи для процедури → чекліст: які потрібні, чи можна онлайн, час
3. Графік роботи → враховуй ПОТОЧНИЙ ДЕНЬ ТИЖНЯ, чи зараз відкрито
4. Посилання → додавай /dovidnyky/* сторінки порталу
5. Попередження → обов'язково згадуй ⚠️ з бази знань
6. Немає в БЗ → загальні знання + "перевірте на офіційному сайті"
7. Закон або нормативний акт → секція ЗАКОНОДАВСТВО, статті, зміни
8. Гранти / фін. допомога → секція АКТИВНІ ГРАНТИ: дедлайни, суми, кроки
9. КВЕД / вид діяльності → секція КВЕД: групи ФОП, ліцензії, обмеження
10. Типи установ → секція ТИПИ УСТАНОВ: що підготувати
11. Навчання / старт ФОП / сертифікація → рекомендуй безкоштовний курс`,
  },
  {
    id: "courses",
    title: "Навчальні курси",
    content: `[КУРС] "Старт ФОП — від нуля за 1 день" (Для ФОП)
→ Реєстрація, вибір групи і КВЕД, відкриття рахунку — все покроково
→ URL: /learn/fop/fop-start

[КУРС] "FINTODO Certified Accountant" (Для бухгалтерів)
→ Офіційна сертифікація для бухгалтерів що ведуть клієнтів у FINTODO
→ URL: /learn/accountants/fintodo-certified

[КУРС] "IT ФОП: повний старт і ведення" (IT-фрілансери)
→ Wise, Payoneer, КВЕД 62.01, валютні доходи — все за 1 день
→ URL: /learn/it/it-fop-full`,
  },
];

const AVAILABLE_MODELS = [
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", current: true, speed: "Швидка", quality: "Добра", cost: "$" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", current: false, speed: "Швидка", quality: "Добра", cost: "$" },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", current: false, speed: "Середня", quality: "Відмінна", cost: "$$$" },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", current: false, speed: "Швидка", quality: "Висока", cost: "$$" },
  { value: "openai/gpt-5", label: "GPT-5", current: false, speed: "Повільна", quality: "Найкраща", cost: "$$$$" },
];

const AUDIENCES = [
  { value: "business", label: "Бізнес", description: "Підприємці, ФОП, ТОВ — ЄСВ, ЄП, ПДВ, звітність" },
  { value: "personal", label: "Фізособи", description: "ПДФО, декларація, нерухомість, спадщина" },
  { value: "accountant", label: "Бухгалтер", description: "П(С)БО, МСФЗ, проводки, фін. звітність" },
];

type Msg = { role: "user" | "assistant"; content: string };

// ─── Helpers ───

function charCount(s: string) { return s.length; }
function estimateTokens(s: string) { return Math.round(s.length / 4); }
function formatSize(chars: number) {
  if (chars < 1000) return `${chars}`;
  return `${(chars / 1000).toFixed(1)}k`;
}

// ─── Tab 1: Knowledge Base ───

function KnowledgeBaseTab() {
  const [search, setSearch] = useState("");
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  const fullKB = useMemo(() => buildFullKnowledgeBase(), []);
  const activeGrants = GRANTS.filter(g => g.isOpen && g.status === "active");
  const catalogTypes = CATALOG_CATEGORIES.reduce((sum, c) => sum + c.types.length, 0);

  const sources = useMemo(() => [
    {
      id: "institutions",
      icon: Database,
      title: "Установи та сервіси",
      count: INSTITUTION_PROFILES.length,
      unit: "профілів",
      color: "text-blue-600",
      getData: () => {
        return INSTITUTION_PROFILES.map(p => `${p.name} (${p.legalName}) — рейтинг ${p.ratings.fintodo.overall}/100`).join("\n");
      },
    },
    {
      id: "catalog",
      icon: FileText,
      title: "Каталог типів установ",
      count: catalogTypes,
      unit: "типів",
      color: "text-green-600",
      getData: () => {
        return CATALOG_CATEGORIES.flatMap(cat =>
          cat.types.map(t => `[${cat.name}] ${t.name} — ${t.whenYouNeedIt[0]}`)
        ).join("\n");
      },
    },
    {
      id: "laws",
      icon: Scale,
      title: "Законодавство",
      count: LAWS.length,
      unit: "законів",
      color: "text-amber-600",
      getData: () => {
        return LAWS.map(l => `[${l.shortName}] ${l.fullName} — ${l.keyPoints[0]}`).join("\n");
      },
    },
    {
      id: "grants",
      icon: Gift,
      title: "Активні гранти",
      count: activeGrants.length,
      unit: "грантів",
      color: "text-purple-600",
      getData: () => {
        if (!activeGrants.length) return "Наразі немає активних грантів.";
        return activeGrants.map(g => `[${g.name}] від ${g.organization} — ${g.amount}, дедлайн: ${g.deadline}`).join("\n");
      },
    },
    {
      id: "kved",
      icon: Hash,
      title: "КВЕД",
      count: KVED_ENTRIES.length,
      unit: "кодів",
      color: "text-rose-600",
      getData: () => {
        return KVED_ENTRIES.map(k => `[${k.code}] ${k.name} — групи ФОП: ${k.fopGroups.join(",")}`).join("\n");
      },
    },
  ], [activeGrants, catalogTypes]);

  const totalChars = charCount(fullKB);
  const totalTokens = estimateTokens(fullKB);

  const filteredKB = search
    ? fullKB.split("\n").filter(line => line.toLowerCase().includes(search.toLowerCase())).join("\n")
    : null;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{formatSize(totalChars)}</div>
            <div className="text-xs text-muted-foreground">символів БЗ</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">~{formatSize(totalTokens)}</div>
            <div className="text-xs text-muted-foreground">токенів (≈chars/4)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs text-muted-foreground">джерел даних</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{INSTITUTION_PROFILES.length + LAWS.length + KVED_ENTRIES.length + activeGrants.length + catalogTypes}</div>
            <div className="text-xs text-muted-foreground">записів загалом</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук по базі знань..."
          className="pl-10"
        />
      </div>

      {search && filteredKB && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Результати пошуку: {filteredKB.split("\n").filter(Boolean).length} рядків</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{filteredKB || "Нічого не знайдено"}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Source cards */}
      {!search && sources.map(source => {
        const Icon = source.icon;
        const isOpen = expandedSource === source.id;
        const data = isOpen ? source.getData() : "";
        const sectionChars = source.getData().length;

        return (
          <Collapsible key={source.id} open={isOpen} onOpenChange={() => setExpandedSource(isOpen ? null : source.id)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <Icon className={`h-4 w-4 ${source.color}`} />
                      <div>
                        <CardTitle className="text-sm">{source.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{source.count} {source.unit}</Badge>
                      <Badge variant="outline" className="text-[10px]">{formatSize(sectionChars)} симв.</Badge>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[250px]">
                    <pre className="text-xs font-mono bg-muted/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed border">{data}</pre>
                  </ScrollArea>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}

// ─── Tab 2: Competencies ───

const competencyColumns: ColumnDef<Competency, any>[] = [
  {
    accessorKey: "title",
    header: "Компетенція",
    cell: ({ row }) => <span>{row.original.emoji} {row.original.title}</span>,
  },
  { accessorKey: "description", header: "Опис" },
  {
    accessorKey: "accessTier",
    header: "Доступ",
    cell: ({ row }) => (
      <Badge variant={row.original.accessTier === "sponsored" ? "default" : "secondary"} className="text-[10px]">
        {row.original.accessTier === "sponsored" ? "Sponsored" : "Premium"}
      </Badge>
    ),
  },
  {
    id: "examples",
    header: "Прикладів",
    cell: ({ row }) => row.original.examples.length,
  },
  {
    accessorKey: "sponsorName",
    header: "Спонсор",
    cell: ({ row }) => row.original.sponsorName || "—",
  },
];

function CompetenciesTab() {
  const [selectedItem, setSelectedItem] = useState<Competency | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {COMPETENCIES.length} компетенцій AI-консультанта
        </p>
        <ContentCreatorDialog schema={competencySchema} title="Нова компетенція" />
      </div>
      <ContentTable columns={competencyColumns} data={COMPETENCIES} onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }} />
      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={competencySchema} title="Компетенція" />
    </div>
  );
}

// ─── Tab 3: System Prompt (enhanced) ───

function SystemPromptTab() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ role: true });
  const [copied, setCopied] = useState(false);

  const fullPrompt = PROMPT_SECTIONS.map(s => `### ${s.title}\n${s.content}`).join("\n\n");
  const promptChars = charCount(fullPrompt);
  const promptTokens = estimateTokens(fullPrompt);

  const fullKB = useMemo(() => buildFullKnowledgeBase(), []);
  const totalChars = promptChars + charCount(fullKB);
  const totalTokens = estimateTokens(fullPrompt + fullKB);

  const toggle = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const copyPrompt = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Промпт</div>
                <div className="text-sm font-medium">{formatSize(promptChars)} симв. / ~{formatSize(promptTokens)} токенів</div>
              </div>
              <div className="text-muted-foreground">+</div>
              <div>
                <div className="text-xs text-muted-foreground">База знань</div>
                <div className="text-sm font-medium">{formatSize(charCount(fullKB))} симв.</div>
              </div>
              <div className="text-muted-foreground">=</div>
              <div>
                <div className="text-xs text-muted-foreground">Загальний контекст</div>
                <div className="text-sm font-bold">{formatSize(totalChars)} симв. / ~{formatSize(totalTokens)} токенів</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={copyPrompt}>
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Скопійовано" : "Копіювати"}
            </Button>
          </div>
          <Progress value={Math.min((totalTokens / 128000) * 100, 100)} className="h-1.5" />
          <div className="text-[10px] text-muted-foreground mt-1">
            {((totalTokens / 128000) * 100).toFixed(1)}% контекстного вікна (128k)
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <Info className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Зміни промпта вносяться у код Edge Function <code className="bg-muted px-1 py-0.5 rounded">portal-chat</code>. Тут — лише перегляд.
        </p>
      </div>

      {PROMPT_SECTIONS.map(section => (
        <Collapsible key={section.id} open={openSections[section.id]} onOpenChange={() => toggle(section.id)}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {openSections[section.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <CardTitle className="text-sm">{section.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{formatSize(charCount(section.content))} симв.</Badge>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Textarea
                  value={section.content}
                  readOnly
                  className="text-xs font-mono leading-relaxed min-h-[120px] resize-y"
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}

// ─── Tab 4: Settings (enhanced) ───

function SettingsTab() {
  const fullKB = useMemo(() => buildFullKnowledgeBase(), []);
  const fullPrompt = PROMPT_SECTIONS.map(s => s.content).join("\n");
  const totalContext = fullPrompt + fullKB;

  return (
    <div className="space-y-6">
      {/* Context size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Розмір контексту</CardTitle>
          <CardDescription>Загальний об'єм даних що надсилається з кожним запитом</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-md border text-center">
              <div className="text-2xl font-bold">{formatSize(charCount(totalContext))}</div>
              <div className="text-xs text-muted-foreground">символів</div>
            </div>
            <div className="p-3 rounded-md border text-center">
              <div className="text-2xl font-bold">~{formatSize(estimateTokens(totalContext))}</div>
              <div className="text-xs text-muted-foreground">токенів</div>
            </div>
            <div className="p-3 rounded-md border text-center">
              <div className="text-2xl font-bold">{((estimateTokens(totalContext) / 128000) * 100).toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">вікна (128k)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Models comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Моделі</CardTitle>
          <CardDescription>Порівняння доступних AI-моделей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AVAILABLE_MODELS.map(m => (
              <div key={m.value} className={`flex items-center justify-between py-2.5 px-3 rounded-md border ${m.current ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{m.value}</code>
                  {m.current && <Badge variant="default" className="text-[10px]">Активна</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">⚡ {m.speed}</Badge>
                  <Badge variant="outline" className="text-[10px]">🎯 {m.quality}</Badge>
                  <Badge variant="outline" className="text-[10px]">💵 {m.cost}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Rate Limiting</CardTitle>
          <CardDescription>Обмеження запитів до AI-агента</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-md border">
              <div className="text-2xl font-bold">20</div>
              <div className="text-xs text-muted-foreground">запитів / годину</div>
            </div>
            <div className="p-3 rounded-md border">
              <div className="text-2xl font-bold">IP + UA</div>
              <div className="text-xs text-muted-foreground">fingerprint метод</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Персистентний ліміт через Deno KV. Зміни — у файлі <code className="bg-muted px-1 py-0.5 rounded">portal-chat/index.ts</code>
          </p>
        </CardContent>
      </Card>

      {/* Audiences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Аудиторії</CardTitle>
          <CardDescription>Контекст, що додається до промпта залежно від типу користувача</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AUDIENCES.map(a => (
              <div key={a.value} className="flex items-start gap-3 p-3 rounded-md border">
                <Badge variant="outline" className="mt-0.5 shrink-0">{a.value}</Badge>
                <div>
                  <div className="text-sm font-medium">{a.label}</div>
                  <div className="text-xs text-muted-foreground">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab 5: Test Chat ───

function TestChatTab() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audience, setAudience] = useState("business");
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);
    setResponseTime(null);
    scrollToBottom();

    const startTime = Date.now();
    let assistantSoFar = "";

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages, audience }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Помилка" }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
              scrollToBottom();
            }
          } catch { /* partial JSON */ }
        }
      }

      setResponseTime(Date.now() - startTime);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `❌ Помилка: ${e instanceof Error ? e.message : "невідома"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center gap-3 pb-3 border-b">
        <Select value={audience} onValueChange={setAudience}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUDIENCES.map(a => (
              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => { setMessages([]); setResponseTime(null); }}>
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Очистити
        </Button>
        {responseTime !== null && (
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {(responseTime / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Надішліть повідомлення для тестування AI-агента</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-4 py-2.5 text-sm animate-pulse">Думаю...</div>
          </div>
        )}
      </div>

      <div className="border-t pt-3 flex gap-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Введіть тестове повідомлення..."
          className="min-h-[44px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Tab 6: Analytics (mock) ───

const MOCK_COMPETENCY_STATS = [
  { name: "Оподаткування", queries: 342 },
  { name: "Бухоблік", queries: 218 },
  { name: "Законодавство", queries: 156 },
  { name: "Фінанси", queries: 287 },
  { name: "Документообіг", queries: 124 },
  { name: "Установи", queries: 198 },
];

function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <Info className="h-4 w-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Мок-дані для демонстрації. Для реальної аналітики потрібна таблиця логів у БД.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">47</div>
            <div className="text-xs text-muted-foreground">запитів сьогодні</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">2.3s</div>
            <div className="text-xs text-muted-foreground">сер. час відповіді</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">📋</div>
            <div className="text-xs text-muted-foreground">топ: Оподаткування</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">94%</div>
            <div className="text-xs text-muted-foreground">успішних відповідей</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Розподіл запитів по компетенціях</CardTitle>
          <CardDescription>Останні 30 днів (мок)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_COMPETENCY_STATS} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="queries" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ───

export default function AIAgentAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          AI Агент
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          База знань, налаштування та тестування AI-консультанта порталу
        </p>
      </div>

      <Tabs defaultValue="kb" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="kb" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> База знань
          </TabsTrigger>
          <TabsTrigger value="competencies" className="gap-1.5">
            <Brain className="h-3.5 w-3.5" /> Компетенції
          </TabsTrigger>
          <TabsTrigger value="prompt" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Промпт
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" /> Налаштування
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> Тест
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Аналітика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kb"><KnowledgeBaseTab /></TabsContent>
        <TabsContent value="competencies"><CompetenciesTab /></TabsContent>
        <TabsContent value="prompt"><SystemPromptTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
        <TabsContent value="chat"><TestChatTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
