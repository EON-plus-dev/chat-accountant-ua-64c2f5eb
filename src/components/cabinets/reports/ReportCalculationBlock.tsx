import { Calculator, Info, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { Report, EPCalculation, ESVCalculation, VZCalculation, OnedfCalculation } from "@/config/reportsConfig";

interface ReportCalculationBlockProps {
  report: Report;
}

const EPCalculationTable = ({ data }: { data: EPCalculation }) => (
  <Table>
    <TableBody>
      <TableRow>
        <TableCell className="text-muted-foreground">Загальний дохід за період</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(data.totalIncome)}</TableCell>
        <TableCell className="text-muted-foreground text-sm w-[140px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                <Info className="h-3 w-3" />
                з Книги доходів
              </TooltipTrigger>
              <TooltipContent>
                <p>Сума доходу з Книги обліку доходів ФОП</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="text-muted-foreground">Ставка єдиного податку</TableCell>
        <TableCell className="text-right font-medium">
          {data.taxRate > 0 ? `${data.taxRate}%` : "Фіксована"}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {data.taxRate === 5 ? "3 група без ПДВ" : data.taxRate === 0 ? "2 група" : `${data.taxRate}%`}
        </TableCell>
      </TableRow>
      {data.paidAdvances !== undefined && data.paidAdvances > 0 && (
        <TableRow>
          <TableCell className="text-muted-foreground">Сплачені авансові платежі</TableCell>
          <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
            -{formatCurrency(data.paidAdvances)}
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">за рік</TableCell>
        </TableRow>
      )}
      <TableRow className="border-t-2 bg-muted/30">
        <TableCell className="font-semibold">Розрахований ЄП</TableCell>
        <TableCell className="text-right font-bold text-lg">{formatCurrency(data.calculatedTax)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
      <TableRow className="bg-primary/5">
        <TableCell className="font-semibold text-primary">До сплати</TableCell>
        <TableCell className="text-right font-bold text-lg text-primary">{formatCurrency(data.toPay)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const ESVCalculationTable = ({ data }: { data: ESVCalculation }) => (
  <Table>
    <TableBody>
      <TableRow>
        <TableCell className="text-muted-foreground">Мінімальний внесок</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(data.minContribution)}</TableCell>
        <TableCell className="text-muted-foreground text-sm w-[140px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                <Info className="h-3 w-3" />
                за 2025 рік
              </TooltipTrigger>
              <TooltipContent>
                <p>22% від мінімальної зарплати</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="text-muted-foreground">Кількість місяців</TableCell>
        <TableCell className="text-right font-medium">{data.monthsCount}</TableCell>
        <TableCell className="text-muted-foreground text-sm">повні місяці</TableCell>
      </TableRow>
      {data.paidAmount !== undefined && data.paidAmount > 0 && (
        <TableRow>
          <TableCell className="text-muted-foreground">Вже сплачено</TableCell>
          <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
            -{formatCurrency(data.paidAmount)}
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">за період</TableCell>
        </TableRow>
      )}
      <TableRow className="border-t-2 bg-muted/30">
        <TableCell className="font-semibold">Сума ЄСВ</TableCell>
        <TableCell className="text-right font-bold text-lg">{formatCurrency(data.totalESV)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
      <TableRow className="bg-primary/5">
        <TableCell className="font-semibold text-primary">До сплати</TableCell>
        <TableCell className="text-right font-bold text-lg text-primary">{formatCurrency(data.toPay)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const VZCalculationTable = ({ data }: { data: VZCalculation }) => (
  <Table>
    <TableBody>
      <TableRow>
        <TableCell className="text-muted-foreground">База оподаткування</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(data.baseAmount)}</TableCell>
        <TableCell className="text-muted-foreground text-sm w-[140px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                <Info className="h-3 w-3" />
                {data.isLinkedToEP ? "з декларації ЄП" : "чистий дохід"}
              </TooltipTrigger>
              <TooltipContent>
                <p>Чистий дохід за період звітності</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="text-muted-foreground">Ставка ВЗ</TableCell>
        <TableCell className="text-right font-medium">
          {data.rate > 0 ? `${data.rate}%` : "Фіксована"}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {data.rate === 1 ? "3 група" : data.rate === 0 ? "1-2 група (фікс.)" : `${data.rate}%`}
        </TableCell>
      </TableRow>
      {data.paidAmount !== undefined && data.paidAmount > 0 && (
        <TableRow>
          <TableCell className="text-muted-foreground">Вже сплачено</TableCell>
          <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
            -{formatCurrency(data.paidAmount)}
          </TableCell>
          <TableCell className="text-muted-foreground text-sm">за період</TableCell>
        </TableRow>
      )}
      <TableRow className="border-t-2 bg-muted/30">
        <TableCell className="font-semibold">Розрахований ВЗ</TableCell>
        <TableCell className="text-right font-bold text-lg">{formatCurrency(data.calculatedVZ)}</TableCell>
        <TableCell></TableCell>
      </TableRow>
      <TableRow className="bg-amber-50 dark:bg-amber-950/20">
        <TableCell className="font-semibold text-amber-700 dark:text-amber-400">До сплати</TableCell>
        <TableCell className="text-right font-bold text-lg text-amber-700 dark:text-amber-400">
          {formatCurrency(data.toPay)}
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

const OnedfCalculationTable = ({ data }: { data: OnedfCalculation }) => (
  <Table>
    <TableBody>
      <TableRow>
        <TableCell className="text-muted-foreground">Кількість працівників</TableCell>
        <TableCell className="text-right font-medium">{data.employeesCount}</TableCell>
        <TableCell className="text-muted-foreground text-sm w-[140px]">осіб</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="text-muted-foreground">Нарахована заробітна плата</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(data.totalSalary)}</TableCell>
        <TableCell className="text-muted-foreground text-sm">за місяць</TableCell>
      </TableRow>
      <TableRow className="border-t">
        <TableCell className="text-muted-foreground">ПДФО (18%)</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(data.pdfo)}</TableCell>
        <TableCell className="text-muted-foreground text-sm">ст. 168 ПКУ</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="text-muted-foreground">Військовий збір (5%)</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(data.vz)}</TableCell>
        <TableCell className="text-muted-foreground text-sm">п. 16-1 ПКУ</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="text-muted-foreground">ЄСВ роботодавця (22%)</TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(data.esv)}</TableCell>
        <TableCell className="text-muted-foreground text-sm">ЗУ «Про ЄСВ»</TableCell>
      </TableRow>
      <TableRow className="border-t-2 bg-indigo-50 dark:bg-indigo-950/20">
        <TableCell className="font-semibold text-indigo-700 dark:text-indigo-400">Разом податків</TableCell>
        <TableCell className="text-right font-bold text-lg text-indigo-700 dark:text-indigo-400">
          {formatCurrency(data.totalTaxes)}
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export function ReportCalculationBlock({ report }: ReportCalculationBlockProps) {
  if (!report.calculation) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Розрахунок
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Розрахунок ще не сформовано
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {report.type === "vz" ? (
            <Shield className="h-4 w-4 text-amber-600" />
          ) : (
            <Calculator className="h-4 w-4 text-muted-foreground" />
          )}
          {report.type === "vz" ? "Розрахунок ВЗ" : "Розрахунок"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {report.calculation.type === "ep" && (
          <EPCalculationTable data={report.calculation.data} />
        )}
        {report.calculation.type === "esv" && (
          <ESVCalculationTable data={report.calculation.data} />
        )}
        {report.calculation.type === "vz" && (
          <VZCalculationTable data={report.calculation.data} />
        )}
        {report.calculation.type === "1df" && (
          <OnedfCalculationTable data={report.calculation.data} />
        )}
      </CardContent>
    </Card>
  );
}
