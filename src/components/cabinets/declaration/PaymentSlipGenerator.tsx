import { Copy, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface PaymentSlip {
  id: string;
  type: "pdfo" | "vz";
  label: string;
  amount: number;
  budgetCode: string;
  edrpou: string;
  iban: string;
  purpose: string;
  deadline: string;
}

interface PaymentSlipGeneratorProps {
  totalPdfo: number;
  totalVz: number;
  year: number;
}

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PaymentSlipGenerator({ totalPdfo, totalVz, year }: PaymentSlipGeneratorProps) {
  const slips: PaymentSlip[] = [
    {
      id: "slip-pdfo",
      type: "pdfo",
      label: "ПДФО (податок на доходи фізичних осіб)",
      amount: totalPdfo,
      budgetCode: "11010100",
      edrpou: "44116011",
      iban: "UA768999980314080542000026006",
      purpose: `*;101;44116011;ПДФО за ${year} рік, декларація F0100114;;`,
      deadline: `31.07.${year + 1}`,
    },
    {
      id: "slip-vz",
      type: "vz",
      label: "Військовий збір",
      amount: totalVz,
      budgetCode: "11011001",
      edrpou: "44116011",
      iban: "UA768999980314080542000026007",
      purpose: `*;101;44116011;ВЗ за ${year} рік, декларація F0100114;;`,
      deadline: `31.07.${year + 1}`,
    },
  ];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label} скопійовано` });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          Платіжні реквізити
          <Badge variant="warning" size="sm">5.1</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {slips.map((slip) => (
          <div key={slip.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{slip.label}</span>
              <Badge variant={slip.type === "pdfo" ? "info" : "secondary"} size="sm">
                {fmt(slip.amount)} ₴
              </Badge>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Код бюджету:</span>
                <span className="font-mono">{slip.budgetCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ЄДРПОУ ДПС:</span>
                <span className="font-mono">{slip.edrpou}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">IBAN:</span>
                <span className="font-mono text-[10px] break-all text-right max-w-[200px]">{slip.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Дедлайн:</span>
                <span className="font-medium">{slip.deadline}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => handleCopy(slip.purpose, "Призначення платежу")}
            >
              <Copy className="w-3.5 h-3.5" />
              Копіювати призначення
            </Button>
          </div>
        ))}
        <div className="text-xs text-muted-foreground">
          * Реквізити ДПС за місцем реєстрації. Перевірте актуальний IBAN у кабінеті платника.
        </div>
      </CardContent>
    </Card>
  );
}
