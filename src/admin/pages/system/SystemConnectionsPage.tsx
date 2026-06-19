import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Landmark, Building2, ShieldCheck, Banknote, Mail, Cpu } from "lucide-react";
import { SystemPageShell } from "./SystemPageShell";

interface ExtConnection {
  id: string;
  name: string;
  category: "bank" | "gov" | "kep" | "ai" | "comms";
  status: "active" | "pilot" | "planned";
  protocol: string;
  note: string;
}

const CONNECTIONS: ExtConnection[] = [
  // Banks
  { id: "monobank", name: "Monobank Open API", category: "bank", status: "active", protocol: "HTTPS / token", note: "Виписки та статуси платежів" },
  { id: "privatbank", name: "ПриватБанк API", category: "bank", status: "active", protocol: "HTTPS / Merchant ID", note: "Корпоративні рахунки" },
  { id: "raiffeisen", name: "Raiffeisen Business Online", category: "bank", status: "pilot", protocol: "OpenAPI", note: "Пілот для ТОВ" },
  { id: "ukrsib", name: "UKRSIB Business", category: "bank", status: "planned", protocol: "OpenAPI", note: "На черзі" },
  // Gov
  { id: "dps", name: "ДПС — Електронний кабінет", category: "gov", status: "active", protocol: "SOAP / Custom", note: "Подача звітів, листи від ДПС" },
  { id: "edr", name: "ЄДР (Мінʼюст)", category: "gov", status: "active", protocol: "OpenData", note: "Синхронізація реквізитів" },
  { id: "pension", name: "Пенсійний фонд", category: "gov", status: "pilot", protocol: "Custom", note: "Перевірка ЄСВ" },
  // KEP
  { id: "diia", name: "Дія.Підпис", category: "kep", status: "active", protocol: "OAuth / NCALib", note: "Підпис документів фізособами та ФОП" },
  { id: "cloud-kep", name: "Cloud КЕП (мульти-провайдер)", category: "kep", status: "active", protocol: "edge: kep-sign", note: "Універсальна точка входу" },
  { id: "mock-kep", name: "ДЕМО-провайдер КЕП", category: "kep", status: "active", protocol: "internal mock", note: "Тільки для тестування, без юр. сили" },
  // AI
  { id: "lovable-ai", name: "Lovable AI Gateway", category: "ai", status: "active", protocol: "REST / LOVABLE_API_KEY", note: "Усі AI-операції платформи" },
  // Comms
  { id: "resend", name: "Email-провайдер", category: "comms", status: "active", protocol: "REST", note: "Транзакційні листи" },
  { id: "telegram", name: "Telegram Bot", category: "comms", status: "pilot", protocol: "Bot API", note: "Сповіщення команді кабінету" },
];

const CATEGORY_ICON = {
  bank: Banknote,
  gov: Landmark,
  kep: ShieldCheck,
  ai: Cpu,
  comms: Mail,
} as const;

const STATUS_COLOR = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  pilot: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  planned: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
} as const;

const STATUS_LABEL = {
  active: "Активне",
  pilot: "Пілот",
  planned: "Планується",
} as const;

export default function SystemConnectionsPage() {
  const grouped = CONNECTIONS.reduce<Record<string, ExtConnection[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  const GROUPS: { key: ExtConnection["category"]; title: string }[] = [
    { key: "bank", title: "Банки" },
    { key: "gov", title: "Державні органи" },
    { key: "kep", title: "КЕП / Електронний підпис" },
    { key: "ai", title: "AI-провайдер" },
    { key: "comms", title: "Комунікації" },
  ];

  return (
    <SystemPageShell
      title="Підключення"
      description="Реєстр зовнішніх інтеграцій платформи. Управління секретами — у Lovable Cloud → Secrets."
    >
      {GROUPS.map(({ key, title }) => {
        const list = grouped[key] || [];
        const Icon = CATEGORY_ICON[key];
        return (
          <div key={key}>
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4" /> {title}
              <Badge variant="outline" className="text-[10px]">{list.length}</Badge>
            </h2>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Назва</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Протокол</TableHead>
                      <TableHead>Призначення</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] ${STATUS_COLOR[c.status]}`}>
                            {STATUS_LABEL[c.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{c.protocol}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </SystemPageShell>
  );
}
