/**
 * CONFLICT RESOLUTION PANEL
 * 
 * Панель вирішення конфліктів синхронізації
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Check,
  X,
  ArrowRight,
  Database,
  Laptop,
} from "lucide-react";
import type { SyncConflict, NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { getConflictFieldLabel, simulateConflictResolution } from "@/services/nomenclature/syncSimulator";
import { toast } from "sonner";

interface ConflictResolutionPanelProps {
  conflicts: SyncConflict[];
  items: NomenclatureItemV2[];
  onResolve: (resolvedItems: NomenclatureItemV2[]) => void;
  onDismiss: () => void;
}

export const ConflictResolutionPanel = ({
  conflicts,
  items,
  onResolve,
  onDismiss,
}: ConflictResolutionPanelProps) => {
  const [resolutions, setResolutions] = useState<Record<string, "local" | "remote">>({});
  const [isResolving, setIsResolving] = useState(false);

  if (conflicts.length === 0) return null;

  const handleResolutionChange = (conflictId: string, value: "local" | "remote") => {
    setResolutions((prev) => ({ ...prev, [conflictId]: value }));
  };

  const handleApply = async () => {
    setIsResolving(true);

    try {
      const resolvedItems = [...items];

      for (const conflict of conflicts) {
        const resolution = resolutions[conflict.itemId] || "local";
        const itemIndex = resolvedItems.findIndex((i) => i.id === conflict.itemId);
        
        if (itemIndex !== -1) {
          const resolved = await simulateConflictResolution(
            conflict,
            resolution,
            resolvedItems[itemIndex]
          );
          resolvedItems[itemIndex] = resolved;
        }
      }

      toast.success("Конфлікти вирішено", {
        description: `${conflicts.length} позицій оновлено`,
      });

      onResolve(resolvedItems);
    } catch (error) {
      toast.error("Помилка при вирішенні конфліктів");
    } finally {
      setIsResolving(false);
    }
  };

  const handleApplyAll = async (resolution: "local" | "remote") => {
    const allResolutions: Record<string, "local" | "remote"> = {};
    conflicts.forEach((c) => {
      allResolutions[c.itemId] = resolution;
    });
    setResolutions(allResolutions);

    // Apply immediately
    setIsResolving(true);
    try {
      const resolvedItems = [...items];

      for (const conflict of conflicts) {
        const itemIndex = resolvedItems.findIndex((i) => i.id === conflict.itemId);
        if (itemIndex !== -1) {
          const resolved = await simulateConflictResolution(
            conflict,
            resolution,
            resolvedItems[itemIndex]
          );
          resolvedItems[itemIndex] = resolved;
        }
      }

      toast.success("Конфлікти вирішено", {
        description: `Застосовано ${resolution === "local" ? "локальні" : "віддалені"} значення`,
      });

      onResolve(resolvedItems);
    } catch (error) {
      toast.error("Помилка при вирішенні конфліктів");
    } finally {
      setIsResolving(false);
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Так" : "Ні";
    if (typeof value === "number") {
      return new Intl.NumberFormat("uk-UA").format(value);
    }
    return String(value);
  };

  return (
    <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base">
              Конфлікти синхронізації ({conflicts.length})
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pb-3 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApplyAll("local")}
            disabled={isResolving}
          >
            <Laptop className="h-4 w-4 mr-1.5" />
            Залишити все локальне
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApplyAll("remote")}
            disabled={isResolving}
          >
            <Database className="h-4 w-4 mr-1.5" />
            Прийняти все віддалене
          </Button>
        </div>

        {/* Conflicts List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {conflicts.map((conflict) => (
            <div
              key={conflict.itemId}
              className="p-3 rounded-lg border bg-background"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-sm">{conflict.itemName}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {getConflictFieldLabel(conflict.field)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm mb-3">
                <div className="flex-1 p-2 rounded bg-muted">
                  <div className="text-xs text-muted-foreground mb-0.5">Локально</div>
                  <div className="font-mono">{formatValue(conflict.localValue)}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 p-2 rounded bg-primary/10">
                  <div className="text-xs text-muted-foreground mb-0.5">Віддалено</div>
                  <div className="font-mono">{formatValue(conflict.remoteValue)}</div>
                </div>
              </div>

              <RadioGroup
                value={resolutions[conflict.itemId] || "local"}
                onValueChange={(v) => handleResolutionChange(conflict.itemId, v as "local" | "remote")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id={`${conflict.itemId}-local`} />
                  <Label htmlFor={`${conflict.itemId}-local`} className="text-sm cursor-pointer">
                    Залишити локальне
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remote" id={`${conflict.itemId}-remote`} />
                  <Label htmlFor={`${conflict.itemId}-remote`} className="text-sm cursor-pointer">
                    Прийняти віддалене
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>

        {/* Apply Button */}
        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleApply} disabled={isResolving}>
            <Check className="h-4 w-4 mr-1.5" />
            Застосувати вибране
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
