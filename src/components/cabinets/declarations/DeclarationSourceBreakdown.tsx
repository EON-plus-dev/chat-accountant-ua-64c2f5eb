/**
 * DeclarationSourceBreakdown — aggregation table showing income sources
 * for declarations, derived from Financial Monitoring confirmed records
 */

import { useMemo } from "react";
import { ArrowRight, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDemoFinMonitoringForCabinet } from "@/config/demoCabinets/getters";
import {
  type FinMonitoringRecord,
  type FinCategory,
  finCategoryConfig,
  formatUAH,
} from "@/config/finMonitoringConfig";
import { cn } from "@/lib/utils";

interface DeclarationSourceBreakdownProps {
  cabinetId: string;
  onNavigateToFinMonitoring?: (category?: string) => void;
}

interface AggregatedRow {
  category: FinCategory;
  label: string;
  article: string;
  totalAmount: number;
  totalPdfo: number;
  totalVz: number;
  count: number;
}

export const DeclarationSourceBreakdown = ({ cabinetId, onNavigateToFinMonitoring }: DeclarationSourceBreakdownProps) => {
  const records = useMemo(() => getDemoFinMonitoringForCabinet(cabinetId), [cabinetId]);

  const rows = useMemo(() => {
    // Filter: only confirmed income with tax implications
    const incomeRecords = records.filter(
      (r) => r.direction === "income" && r.status === "confirmed" && r.taxImplication
    );

    // Group by category
    const grouped = new Map<FinCategory, AggregatedRow>();
    for (const r of incomeRecords) {
      const existing = grouped.get(r.category);
      const tax = r.taxImplication!;
      if (existing) {
        existing.totalAmount += r.amount;
        existing.totalPdfo += tax.pdfo;
        existing.totalVz += tax.vz;
        existing.count += 1;
        if (tax.article && !existing.article.includes(tax.article)) {
          existing.article = tax.article;
        }
      } else {
        grouped.set(r.category, {
          category: r.category,
          label: finCategoryConfig[r.category].label,
          article: tax.article || "",
          totalAmount: r.amount,
          totalPdfo: tax.pdfo,
          totalVz: tax.vz,
          count: 1,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [records]);

  const totals = useMemo(() => ({
    amount: rows.reduce((s, r) => s + r.totalAmount, 0),
    pdfo: rows.reduce((s, r) => s + r.totalPdfo, 0),
    vz: rows.reduce((s, r) => s + r.totalVz, 0),
  }), [rows]);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            Агрегація доходів для декларації
          </CardTitle>
          {onNavigateToFinMonitoring && (
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={() => onNavigateToFinMonitoring()}>
              Фін. моніторинг <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border border-border/70 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/80">
                <TableHead compact style={{ width: "28%" }}>Джерело доходу</TableHead>
                <TableHead compact numeric style={{ width: "18%" }}>Сума</TableHead>
                <TableHead compact numeric style={{ width: "16%" }}>ПДФО</TableHead>
                <TableHead compact numeric style={{ width: "14%" }}>ВЗ</TableHead>
                <TableHead compact style={{ width: "12%" }} className="text-center">Записів</TableHead>
                <TableHead compact style={{ width: "12%" }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const catCfg = finCategoryConfig[row.category];
                const CatIcon = catCfg.icon;
                return (
                  <TableRow key={row.category} className="cursor-pointer hover:bg-muted/50" onClick={() => onNavigateToFinMonitoring?.(row.category)}>
                    <TableCell compact className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className={cn("shrink-0 rounded-md p-1", catCfg.badgeClass)}>
                          <CatIcon className="h-3 w-3" />
                        </span>
                        <div className="min-w-0">
                          <span className="font-medium">{row.label}</span>
                          {row.article && (
                            <span className="block text-[10px] text-muted-foreground truncate">{row.article}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell compact numeric className="text-sm font-semibold tabular-nums">
                      {formatUAH(row.totalAmount)}
                    </TableCell>
                    <TableCell compact numeric className="text-sm tabular-nums text-muted-foreground">
                      {formatUAH(row.totalPdfo)}
                    </TableCell>
                    <TableCell compact numeric className="text-sm tabular-nums text-muted-foreground">
                      {formatUAH(row.totalVz)}
                    </TableCell>
                    <TableCell compact className="text-sm text-center">
                      <Badge variant="outline" className="text-xs">{row.count}</Badge>
                    </TableCell>
                    <TableCell compact className="text-sm">
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter sticky>
              <TableRow className="hover:bg-transparent">
                <TableCell compact className="text-sm font-semibold">РАЗОМ</TableCell>
                <TableCell compact numeric className="text-sm font-bold tabular-nums">
                  {formatUAH(totals.amount)}
                </TableCell>
                <TableCell compact numeric className="text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400">
                  {formatUAH(totals.pdfo)}
                </TableCell>
                <TableCell compact numeric className="text-sm font-bold tabular-nums text-violet-600 dark:text-violet-400">
                  {formatUAH(totals.vz)}
                </TableCell>
                <TableCell compact colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeclarationSourceBreakdown;
