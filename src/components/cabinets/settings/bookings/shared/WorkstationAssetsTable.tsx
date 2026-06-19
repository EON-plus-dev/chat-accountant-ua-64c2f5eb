/**
 * WorkstationAssetsTable — список ОЗ, привʼязаних до робочого місця.
 *
 * Архітектурне правило (з пам'яті проєкту):
 * робоче місце НЕ є ОЗ-обʼєктом. Це організаційний контейнер,
 * до якого через `assetIds` привʼязані конкретні ОЗ (крісло, лампа,
 * стерилізатор тощо). Секція гейтиться `fixed_assets` capability.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Plus, ExternalLink, Wrench } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { hasCapability } from "@/config/cabinetCapabilities";
import type { Cabinet } from "@/types/cabinet";

export interface LinkedAsset {
  id: string;
  name: string;
  inventoryNumber: string;
  initialCost: number;
  residualCost: number;
  status: "in_use" | "maintenance" | "written_off";
}

interface WorkstationAssetsTableProps {
  cabinet: Cabinet;
  workstationName: string;
  assets: LinkedAsset[];
  onLinkExisting?: () => void;
  onCreateNew?: () => void;
  onOpenAsset?: (assetId: string) => void;
}

export function WorkstationAssetsTable({
  cabinet,
  workstationName,
  assets,
  onLinkExisting,
  onCreateNew,
  onOpenAsset,
}: WorkstationAssetsTableProps) {
  const hasFixedAssets = hasCapability(cabinet, "fixed_assets");

  if (!hasFixedAssets) {
    return (
      <div className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-1 text-foreground">
          <Wrench className="w-4 h-4" />
          <span className="font-medium">Облік основних засобів вимкнено</span>
        </div>
        Увімкніть модуль «Основні засоби» у тарифі, щоб привʼязувати обладнання
        (крісло, лампу, стерилізатор тощо) до робочого місця «{workstationName}».
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">
          Обладнання <span className="text-muted-foreground">· {assets.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onLinkExisting}>
            <Link2 className="w-3.5 h-3.5" />
            Привʼязати ОЗ
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onCreateNew}>
            <Plus className="w-3.5 h-3.5" />
            Створити
          </Button>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground text-center">
          Немає привʼязаного обладнання. Привʼяжіть ОЗ, щоб бачити залишкову вартість на цій локації.
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-2.5 py-1.5">Назва</th>
                <th className="text-left font-medium px-2.5 py-1.5 hidden sm:table-cell">Інв.№</th>
                <th className="text-right font-medium px-2.5 py-1.5 hidden md:table-cell">Первісна</th>
                <th className="text-right font-medium px-2.5 py-1.5">Залишкова</th>
                <th className="text-center font-medium px-2.5 py-1.5">Статус</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-2.5 py-1.5 font-medium">{a.name}</td>
                  <td className="px-2.5 py-1.5 text-muted-foreground hidden sm:table-cell">{a.inventoryNumber}</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums hidden md:table-cell">
                    {formatCurrency(a.initialCost)}
                  </td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums">{formatCurrency(a.residualCost)}</td>
                  <td className="px-2.5 py-1.5 text-center">
                    <AssetStatusBadge status={a.status} />
                  </td>
                  <td className="px-1 py-1.5">
                    {onOpenAsset && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => onOpenAsset(a.id)}
                        aria-label="Відкрити картку ОЗ"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t bg-muted/20 text-[11px] text-muted-foreground">
              <tr>
                <td colSpan={6} className="px-2.5 py-1.5">
                  Робоче місце — не ОЗ. До нього прикріплюються конкретні засоби,
                  які обліковуються окремо.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function AssetStatusBadge({ status }: { status: LinkedAsset["status"] }) {
  const map = {
    in_use: { label: "В експлуатації", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    maintenance: { label: "Ремонт", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    written_off: { label: "Списано", cls: "bg-muted text-muted-foreground border-border" },
  }[status];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", map.cls)}>
      {map.label}
    </Badge>
  );
}
