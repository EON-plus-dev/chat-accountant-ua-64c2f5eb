import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Info, Database, FileText, HardDrive } from "lucide-react";
import { getContentRegistry, getRegistryStatus, type CoverageStatus } from "@/admin/config/contentRegistry";

const STATUS_CONFIG: Record<CoverageStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  ok: { label: "OK", icon: CheckCircle, color: "text-green-500" },
  partial: { label: "Частково", icon: Info, color: "text-amber-500" },
  missing: { label: "Відсутнє", icon: XCircle, color: "text-red-500" },
  desync: { label: "Розсинхрон", icon: AlertTriangle, color: "text-orange-500" },
};

const SOURCE_ICON = { file: FileText, db: Database, localStorage: HardDrive };

const CATEGORY_LABELS: Record<string, string> = {
  content: "Контент",
  directory: "Довідники",
  institution: "Установи",
  education: "Навчання",
  tool: "Інструменти",
  analytics: "Аналітика & Дані",
  communication: "Комунікації",
  config: "Конфігурація",
};

export default function ContentAuditAdmin() {
  const registry = useMemo(() => getContentRegistry(), []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof registry>();
    for (const entry of registry) {
      const arr = map.get(entry.category) || [];
      arr.push(entry);
      map.set(entry.category, arr);
    }
    return map;
  }, [registry]);

  const totalEntries = registry.reduce((s, e) => s + e.count, 0);
  const okCount = registry.filter(e => getRegistryStatus(e) === "ok").length;
  const partialCount = registry.filter(e => getRegistryStatus(e) === "partial").length;
  const missingCount = registry.filter(e => getRegistryStatus(e) === "missing").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Аудит покриття контенту</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Повна матриця покриття всіх типів контенту порталу в адмін-панелі
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{registry.length}</p>
            <p className="text-xs text-muted-foreground">Типів контенту</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalEntries}</p>
            <p className="text-xs text-muted-foreground">Записів (file)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{okCount}</p>
            <p className="text-xs text-muted-foreground">Повне покриття</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{partialCount}</p>
            <p className="text-xs text-muted-foreground">Часткове</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{missingCount}</p>
            <p className="text-xs text-muted-foreground">Відсутнє</p>
          </CardContent>
        </Card>
      </div>

      {/* Matrix by category */}
      {Array.from(grouped.entries()).map(([category, entries]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{CATEGORY_LABELS[category] || category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Тип</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-right">Записів</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Джерело</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Публічна сторінка</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground">Адмін</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-center">Detail</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-center">SEO</th>
                    <th className="py-2 pr-4 font-medium text-muted-foreground text-center">Dashboard</th>
                    <th className="py-2 font-medium text-muted-foreground">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const status = getRegistryStatus(entry);
                    const cfg = STATUS_CONFIG[status];
                    const SrcIcon = SOURCE_ICON[entry.source];
                    return (
                      <tr key={entry.key} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 pr-4 font-medium">{entry.label}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{entry.count}</td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-1.5">
                            <SrcIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{entry.source}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          {entry.portalRoute ? (
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entry.portalRoute}</code>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          {entry.adminRoute ? (
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entry.adminRoute}</code>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-center">
                          {entry.hasDetail ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2 pr-4 text-center">
                          {entry.inSeoAudit ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2 pr-4 text-center">
                          {entry.inDashboard ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2">
                          <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                            <cfg.icon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                          {entry.notes && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{entry.notes}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
