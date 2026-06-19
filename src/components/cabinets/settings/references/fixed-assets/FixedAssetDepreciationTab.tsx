import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  type FixedAsset,
  generateDepreciationSchedule,
  formatCurrency,
  calculateWearPercent,
} from "@/config/fixedAssetsConfig";
import { Progress } from "@/components/ui/progress";

interface FixedAssetDepreciationTabProps {
  asset: FixedAsset;
}

export const FixedAssetDepreciationTab = ({ asset }: FixedAssetDepreciationTabProps) => {
  const schedule = useMemo(() => generateDepreciationSchedule(asset), [asset]);
  const wear = calculateWearPercent(asset);
  const totalDepreciation = asset.originalCost - asset.residualValue;

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Нараховано амортизації</p>
              <p className="text-lg font-mono font-semibold">{formatCurrency(totalDepreciation)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Залишкова вартість</p>
              <p className="text-lg font-mono font-semibold">{formatCurrency(asset.residualValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Знос</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Progress value={wear} className="h-2 w-20" />
                <span className="text-sm font-medium">{wear}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Графік амортизації (помісячно)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden mx-4 mb-4">
            <Table containerClassName="max-h-[400px] overflow-auto">
              <TableHeader sticky>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px]">Період</TableHead>
                  <TableHead className="text-right">Поч. вартість</TableHead>
                  <TableHead className="text-right">Амортизація</TableHead>
                  <TableHead className="text-right">Кін. вартість</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{entry.period}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(entry.openingValue)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-destructive">-{formatCurrency(entry.depreciation)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(entry.closingValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
