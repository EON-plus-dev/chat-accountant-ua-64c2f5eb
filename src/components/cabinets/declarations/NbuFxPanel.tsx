import { useState } from "react";
import { Banknote, Database, Clock, RefreshCw, ExternalLink, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  getYearKeyRates,
  getDemoRateUsage,
  type NbuRateUsage,
} from "@/config/demoCabinets/nbuRateCache";

const MODULE_LABELS: Record<NbuRateUsage["module"], string> = {
  investments: "Інвестиції",
  fin_monitoring: "Фін.моніторинг",
  kik: "КІК",
  income_book: "Книга доходів",
};

const MODULE_TONE: Record<NbuRateUsage["module"], string> = {
  investments: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
  fin_monitoring: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  kik: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  income_book: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
};

interface NbuFxPanelProps {
  reportingYear: number;
}

export function NbuFxPanel({ reportingYear }: NbuFxPanelProps) {
  const keyRates = getYearKeyRates(reportingYear);
  const usage = getDemoRateUsage(reportingYear);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Кеш курсів оновлено",
        description: `Демо: підтягнуто свіжі дані з bank.gov.ua для ${reportingYear} р.`,
      });
    }, 800);
  };

  const lastFetchedIso = keyRates[0]?.fetchedAt;

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 md:p-5 border-b space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Banknote className="size-4 text-primary" /> Курси НБУ — снапшот для звітного року
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Кешовані офіційні курси Національного банку України. Кожна операція переоцінюється на свою дату.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-1">
                <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
                Оновити кеш
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <Badge variant="outline" className="gap-1">
                <Database className="size-3" /> Джерело: bank.gov.ua
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="size-3" /> Останнє оновлення: {new Date(lastFetchedIso).toLocaleString("uk-UA")}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Info className="size-3" /> Кеш TTL: 24 год
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="key" className="p-4 md:p-5">
            <TabsList>
              <TabsTrigger value="key">Ключові курси ({keyRates.length})</TabsTrigger>
              <TabsTrigger value="usage">Використання у транзакціях ({usage.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="key" className="mt-3 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {keyRates.map((r) => (
                  <div key={r.currency} className="rounded-md border bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold">{r.currency}</span>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {r.source === "nbu_cache" ? "Кеш" : "API"}
                      </Badge>
                    </div>
                    <div className="text-xl font-bold tabular-nums mt-1">{r.rate.toFixed(4)} ₴</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      На {new Date(r.date).toLocaleDateString("uk-UA")}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                ⓘ Курси на 31.12 використовуються лише для оцінки залишків валютних активів. Доходи переоцінюються на дату операції.
              </p>
            </TabsContent>

            <TabsContent value="usage" className="mt-3">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Дата</TableHead>
                      <TableHead>Опис</TableHead>
                      <TableHead className="w-[110px]">Модуль</TableHead>
                      <TableHead className="text-right">Сума (валюта)</TableHead>
                      <TableHead className="text-right w-[100px]">Курс НБУ</TableHead>
                      <TableHead className="text-right">Сума (UAH)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usage.map((u) => (
                      <TableRow key={u.txId}>
                        <TableCell className="text-xs tabular-nums">
                          {new Date(u.txDate).toLocaleDateString("uk-UA")}
                        </TableCell>
                        <TableCell className="text-sm">{u.txDescription}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px] h-5", MODULE_TONE[u.module])}>
                            {MODULE_LABELS[u.module]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {u.amountForeign.toLocaleString("uk-UA")} {u.currency}
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                              <span className="font-mono text-xs">{u.rate.toFixed(4)}</span>
                              <ExternalLink className="size-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Курс НБУ {u.currency}/UAH на {new Date(u.txDate).toLocaleDateString("uk-UA")}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-medium">
                          {u.amountUah.toLocaleString("uk-UA")} ₴
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                ⓘ Кожен курс зберігається разом з операцією — переоцінка не відбувається при перерахунку декларації.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default NbuFxPanel;
