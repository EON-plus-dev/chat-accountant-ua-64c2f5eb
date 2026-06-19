import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemPageShell } from "./SystemPageShell";

interface EdgeFn {
  name: string;
  category: "ai" | "auth" | "billing" | "comms" | "integration" | "admin";
  verifyJwt: boolean;
  description: string;
}

const FUNCTIONS: EdgeFn[] = [
  { name: "ai-charge", category: "billing", verifyJwt: true, description: "Списання AI-кредитів через resolve_billing_wallet" },
  { name: "cabinet-chat", category: "ai", verifyJwt: true, description: "AI-консультант у кабінеті, Lovable AI Gateway" },
  { name: "portal-chat", category: "ai", verifyJwt: false, description: "AI-чат на порталі для гостей" },
  { name: "cms-agent", category: "ai", verifyJwt: true, description: "AI CMS — генерація та редагування контенту" },
  { name: "generate-article", category: "ai", verifyJwt: true, description: "Генерація статті за брифом" },
  { name: "verify-article", category: "ai", verifyJwt: true, description: "Перевірка фактів у статті" },
  { name: "generate-seo", category: "ai", verifyJwt: true, description: "Авто-SEO (title/description/keywords)" },
  { name: "generate-content-ideas", category: "ai", verifyJwt: true, description: "Генерація ідей контенту для редакції" },
  { name: "generate-institution-profile", category: "ai", verifyJwt: true, description: "Профіль установи з відкритих джерел" },
  { name: "recognize-expense", category: "ai", verifyJwt: true, description: "Розпізнавання чеку / витрати з фото" },
  { name: "analytics-ai-comment", category: "ai", verifyJwt: true, description: "AI-коментар до аналітики кабінету" },
  { name: "analytics-stats", category: "ai", verifyJwt: true, description: "Conversational BI tool registry" },
  { name: "roi-advice", category: "ai", verifyJwt: true, description: "AI-порада щодо ROI інвестицій" },
  { name: "timeline-ai-summary", category: "ai", verifyJwt: true, description: "Підсумок таймлайну операцій" },
  { name: "sanctions-check", category: "ai", verifyJwt: true, description: "Перевірка контрагента за санкційними реєстрами" },
  { name: "kep-sign", category: "auth", verifyJwt: true, description: "КЕП / Дія.Підпис — init/callback/auto/cancel" },
  { name: "generate-backup-codes", category: "auth", verifyJwt: true, description: "Backup-коди для 2FA" },
  { name: "send-email-verification", category: "auth", verifyJwt: false, description: "Лист верифікації email" },
  { name: "verify-email-change", category: "auth", verifyJwt: true, description: "Підтвердження зміни email" },
  { name: "delete-account", category: "auth", verifyJwt: true, description: "Видалення акаунту користувача" },
  { name: "send-welcome-email", category: "comms", verifyJwt: false, description: "Welcome-лист після реєстрації" },
  { name: "send-reminders", category: "comms", verifyJwt: false, description: "Cron: нагадування про дедлайни" },
  { name: "send-team-invite", category: "comms", verifyJwt: true, description: "Запрошення до команди кабінету" },
  { name: "send-team-notification", category: "comms", verifyJwt: true, description: "Push-сповіщення команді" },
  { name: "admin-lookup-user", category: "admin", verifyJwt: true, description: "Адмін-пошук користувача (роль admin)" },
  { name: "admin-subscriptions-data", category: "admin", verifyJwt: true, description: "Адмін-перегляд підписок" },
];

const CATEGORY_COLOR: Record<EdgeFn["category"], string> = {
  ai: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  auth: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  billing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  comms: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  integration: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  admin: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function SystemEdgeFunctionsPage() {
  return (
    <SystemPageShell
      title="Edge-функції"
      description="Серверні функції на Deno (Lovable Cloud). JWT-перевірка вмикається у supabase/config.toml або всередині коду функції."
      actions={
        <Button size="sm" variant="outline" asChild>
          <a href="https://supabase.com/dashboard/project/zfpinzzufujjrxvuaqdc/functions" target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Логи у Cloud
          </a>
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Всього функцій</div>
          <div className="text-xl font-semibold mt-1">{FUNCTIONS.length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Захищені JWT</div>
          <div className="text-xl font-semibold mt-1">{FUNCTIONS.filter((f) => f.verifyJwt).length}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-muted-foreground">Публічні (без JWT)</div>
          <div className="text-xl font-semibold mt-1">{FUNCTIONS.filter((f) => !f.verifyJwt).length}</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Функція</TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead>JWT</TableHead>
                <TableHead>Опис</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FUNCTIONS.map((f) => (
                <TableRow key={f.name}>
                  <TableCell className="font-mono text-xs">{f.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] ${CATEGORY_COLOR[f.category]}`}>{f.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {f.verifyJwt ? (
                      <Badge variant="outline" className="text-[10px] gap-1 text-emerald-700 border-emerald-300">
                        <Shield className="h-3 w-3" /> JWT
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1 text-amber-700 border-amber-300">
                        <ShieldOff className="h-3 w-3" /> Public
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
