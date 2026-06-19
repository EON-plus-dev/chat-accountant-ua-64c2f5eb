import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatIban, type TaxType } from "@/config/paymentsConfig";
import { getBudgetAccount } from "@/config/taxOkpConfig";

interface Props {
  taxType: TaxType;
  asOf?: Date;
  className?: string;
}

export function RequisitesBlock({ taxType, asOf, className }: Props) {
  const { toast } = useToast();
  const acc = getBudgetAccount(taxType, asOf ?? new Date());
  if (!acc) return null;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: `${label}: ${text}` });
  };

  const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div className="flex items-center justify-between gap-2 text-xs py-1 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="flex items-center gap-1 min-w-0">
        <span className={cn("truncate", mono && "font-mono tabular-nums text-[11px]")}>{value}</span>
        <button
          type="button"
          onClick={() => copy(value.replace(/\s/g, ""), label)}
          className="text-muted-foreground hover:text-foreground p-0.5 shrink-0"
          aria-label={`Скопіювати ${label}`}
        >
          <Copy className="h-3 w-3" />
        </button>
      </span>
    </div>
  );

  return (
    <div className={cn("rounded-md border border-border/60 bg-muted/20 p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-muted-foreground">Реквізити для сплати</div>
        <div className="text-[10px] text-muted-foreground">
          Чинні з {format(parseISO(acc.validFrom), "dd MMM yyyy", { locale: uk })}
          {acc.validUntil && ` до ${format(parseISO(acc.validUntil), "dd MMM yyyy", { locale: uk })}`}
        </div>
      </div>
      <Row label="КБК" value={acc.kbk} mono />
      <Row label="IBAN" value={formatIban(acc.iban)} mono />
      <Row label="Отримувач" value={acc.recipient} />
      <Row label="ЄДРПОУ отр." value={acc.recipientEdrpou} mono />
      <Row label="Бюджет" value={acc.budgetLevel === "state" ? "Державний" : "Місцевий"} />
      <Row label="Регіон" value={acc.region} />
    </div>
  );
}
