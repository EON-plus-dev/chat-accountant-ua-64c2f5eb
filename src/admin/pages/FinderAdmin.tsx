import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { CURRENCY_RATES, FINANCIAL_INDICES, DEPOSIT_OFFERS, CARD_OFFERS, INSURANCE_OFFERS, FEE_COMPARISONS } from "@/portal/data/finder";
import ContentTable from "@/admin/components/ContentTable";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Landmark, CreditCard, Shield, ArrowLeftRight } from "lucide-react";

const datasets = [
  { id: "currencies", label: "Валюти", icon: DollarSign, count: CURRENCY_RATES.rates.length, lastUpdated: CURRENCY_RATES.meta.lastUpdated },
  { id: "indices", label: "Індекси", icon: TrendingUp, count: FINANCIAL_INDICES.indices.length, lastUpdated: FINANCIAL_INDICES.meta.lastUpdated },
  { id: "deposits", label: "Депозити", icon: Landmark, count: DEPOSIT_OFFERS.offers.length, lastUpdated: DEPOSIT_OFFERS.meta.lastUpdated },
  { id: "cards", label: "Картки", icon: CreditCard, count: CARD_OFFERS.offers.length, lastUpdated: CARD_OFFERS.meta.lastUpdated },
  { id: "insurance", label: "Страхування", icon: Shield, count: INSURANCE_OFFERS.offers.length, lastUpdated: INSURANCE_OFFERS.meta.lastUpdated },
  { id: "fees", label: "Тарифи", icon: ArrowLeftRight, count: FEE_COMPARISONS.comparisons.length, lastUpdated: FEE_COMPARISONS.meta.lastUpdated },
];

const currencyColumns: ColumnDef<any, any>[] = [
  { id: "currency", header: "Валюта", cell: ({ row }) => <span>{row.original.flag} {row.original.currency}</span> },
  { accessorKey: "currencyName", header: "Назва" },
  { accessorKey: "nbuRate", header: "Курс НБУ", cell: ({ row }) => <span className="font-mono">{row.original.nbuRate}</span> },
  { accessorKey: "nbuChange", header: "Зміна", cell: ({ row }) => <span className={row.original.nbuChange > 0 ? "text-green-600" : row.original.nbuChange < 0 ? "text-red-600" : ""}>{row.original.nbuChange > 0 ? "+" : ""}{row.original.nbuChange}</span> },
  { id: "banks", header: "Банків", cell: ({ row }) => <Badge variant="secondary">{row.original.banks.length}</Badge> },
];

const indexColumns: ColumnDef<any, any>[] = [
  { accessorKey: "shortName", header: "Індекс" },
  { accessorKey: "value", header: "Значення", cell: ({ row }) => <span className="font-mono font-medium">{row.original.value}</span> },
  { accessorKey: "trend", header: "Тренд", cell: ({ row }) => <Badge variant={row.original.trend === "up" ? "default" : row.original.trend === "down" ? "destructive" : "secondary"}>{row.original.trend === "up" ? "↑" : row.original.trend === "down" ? "↓" : "→"}</Badge> },
  { accessorKey: "source", header: "Джерело" },
  { accessorKey: "updateFrequency", header: "Частота оновлень" },
];

const depositColumns: ColumnDef<any, any>[] = [
  { accessorKey: "bankName", header: "Банк" },
  { accessorKey: "productName", header: "Продукт" },
  { accessorKey: "rateDisplay", header: "Ставка", cell: ({ row }) => <span className="font-mono text-sm">{row.original.rateDisplay}</span> },
  { accessorKey: "currency", header: "Валюта" },
  { accessorKey: "minAmountDisplay", header: "Мін. сума" },
  { accessorKey: "badge", header: "Badge", cell: ({ row }) => row.original.badge ? <Badge>{row.original.badge}</Badge> : null },
];

const cardColumns: ColumnDef<any, any>[] = [
  { accessorKey: "bankName", header: "Банк" },
  { accessorKey: "cardName", header: "Картка" },
  { accessorKey: "cardType", header: "Тип", cell: ({ row }) => <Badge variant="outline">{row.original.cardType}</Badge> },
  { accessorKey: "annualFeeDisplay", header: "Плата" },
  { accessorKey: "cashback", header: "Кешбек" },
  { accessorKey: "badge", header: "Badge", cell: ({ row }) => row.original.badge ? <Badge>{row.original.badge}</Badge> : null },
];

const insuranceColumns: ColumnDef<any, any>[] = [
  { accessorKey: "insurerName", header: "Страховик" },
  { accessorKey: "productName", header: "Продукт" },
  { accessorKey: "type", header: "Тип", cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge> },
  { accessorKey: "priceDisplay", header: "Ціна" },
  { accessorKey: "badge", header: "Badge", cell: ({ row }) => row.original.badge ? <Badge>{row.original.badge}</Badge> : null },
];

const feeColumns: ColumnDef<any, any>[] = [
  { accessorKey: "category", header: "Категорія", cell: ({ row }) => <span className="font-medium">{row.original.category}</span> },
  { accessorKey: "subCategory", header: "Підкатегорія" },
  { id: "banks", header: "Банків", cell: ({ row }) => <Badge variant="secondary">{row.original.banks.length}</Badge> },
  { accessorKey: "fintodoTip", header: "Tip", cell: ({ row }) => row.original.fintodoTip ? <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{row.original.fintodoTip}</span> : null },
];

export default function FinderAdmin() {
  const [tab, setTab] = useState("currencies");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalRecords = datasets.reduce((s, d) => s + d.count, 0);

  const handleRowClick = (row: any) => {
    setSelectedItem(row);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Фінансові дані</h1>
        <p className="text-muted-foreground text-sm mt-1">{totalRecords} записів у {datasets.length} категоріях</p>
      </div>




      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {datasets.map((d) => <TabsTrigger key={d.id} value={d.id}>{d.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="currencies">
          <ContentTable columns={currencyColumns} data={CURRENCY_RATES.rates} onRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="indices">
          <ContentTable columns={indexColumns} data={FINANCIAL_INDICES.indices} onRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="deposits">
          <ContentTable columns={depositColumns} data={DEPOSIT_OFFERS.offers} onRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="cards">
          <ContentTable columns={cardColumns} data={CARD_OFFERS.offers} onRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="insurance">
          <ContentTable columns={insuranceColumns} data={INSURANCE_OFFERS.offers} onRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="fees">
          <ContentTable columns={feeColumns} data={FEE_COMPARISONS.comparisons} onRowClick={handleRowClick} />
        </TabsContent>
      </Tabs>

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={[]} title="Деталі запису" />
    </div>
  );
}
