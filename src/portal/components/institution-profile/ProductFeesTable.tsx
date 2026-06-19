import type { InstitutionProduct } from "@/portal/data/institutionProfiles";
import { Banknote } from "lucide-react";

const feeRegex = /комісі|fee|%|вартість|плата|оплата|тариф|грн|₴/i;
const limitRegex = /ліміт|макс|min|max|обмеж|день|доба|раз|операц/i;

interface Props {
  products: InstitutionProduct[];
}

export const ProductFeesTable = ({ products }: Props) => {
  const fees = products.flatMap(p =>
    p.features
      .filter(f => (f.note || f.limit) && feeRegex.test(f.name + (f.note || "") + (f.limit || "")))
      .map(f => ({ product: p.name, name: f.name, value: f.note || f.limit || "" }))
  );
  const limits = products.flatMap(p =>
    p.features
      .filter(f => f.limit && limitRegex.test(f.name + (f.limit || "")))
      .map(f => ({ product: p.name, name: f.name, value: f.limit || "" }))
  );

  if (fees.length === 0 && limits.length === 0) return null;

  const renderRows = (items: typeof fees) =>
    items.map((f, i) => (
      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
        <span className="text-foreground">{f.name} <span className="text-muted-foreground">({f.product})</span></span>
        <span className="font-mono font-medium text-foreground shrink-0 ml-2">{f.value}</span>
      </div>
    ));

  return (
    <div className="mt-3 rounded-lg border border-border/70 p-4">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <Banknote className="w-4 h-4 text-primary" /> Комісії та ліміти
      </h4>
      {fees.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-muted-foreground mb-1">Комісії</p>
          {renderRows(fees)}
        </div>
      )}
      {limits.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground mb-1">Ліміти</p>
          {renderRows(limits)}
        </div>
      )}
    </div>
  );
};
