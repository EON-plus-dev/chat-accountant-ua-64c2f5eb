import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Printer, FileText } from "lucide-react";

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

let nextItemId = 100;

export const InvoiceGenerator = () => {
  const [provider, setProvider] = useState({
    name: "", taxId: "", address: "", phone: "", email: "", bankAccount: "",
  });
  const [client, setClient] = useState({ name: "", taxId: "", address: "" });
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: "", quantity: 1, price: 0 },
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState("1");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toLocaleDateString("uk-UA"),
  );
  const [withPdv, setWithPdv] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * i.price, 0),
    [items],
  );
  const pdv = withPdv ? subtotal * 0.2 : 0;
  const total = subtotal + pdv;

  const addItem = () =>
    setItems((prev) => [...prev, { id: ++nextItemId, description: "", quantity: 1, price: 0 }]);

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: number, field: keyof LineItem, value: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, [field]: field === "description" ? value : Number(value) || 0 }
          : i,
      ),
    );

  const updateProvider = (field: string, value: string) =>
    setProvider((prev) => ({ ...prev, [field]: value }));

  const updateClient = (field: string, value: string) =>
    setClient((prev) => ({ ...prev, [field]: value }));

  const fmt = (n: number) => n.toLocaleString("uk-UA", { minimumFractionDigits: 2 });

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Постачальник</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: "name", label: "Назва / ПІБ ФОП" },
                { key: "taxId", label: "ЄДРПОУ / ІПН" },
                { key: "address", label: "Адреса" },
                { key: "bankAccount", label: "IBAN / р/р" },
                { key: "phone", label: "Телефон" },
                { key: "email", label: "Email" },
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    value={(provider as any)[f.key]}
                    onChange={(e) => updateProvider(f.key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Покупець</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: "name", label: "Назва / ПІБ" },
                { key: "taxId", label: "ЄДРПОУ / ІПН" },
                { key: "address", label: "Адреса" },
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input
                    value={(client as any)[f.key]}
                    onChange={(e) => updateClient(f.key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Позиції</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    {idx === 0 && <Label className="text-[10px]">Опис</Label>}
                    <Input
                      className="h-8 text-sm"
                      placeholder="Послуга / товар"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="w-16 space-y-1">
                    {idx === 0 && <Label className="text-[10px]">К-ть</Label>}
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    {idx === 0 && <Label className="text-[10px]">Ціна, ₴</Label>}
                    <Input
                      className="h-8 text-sm"
                      type="number"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3 w-3 mr-1" /> Додати позицію
              </Button>

              <div className="flex items-center gap-2 pt-2">
                <Switch checked={withPdv} onCheckedChange={setWithPdv} />
                <Label className="text-xs">Включити ПДВ 20%</Label>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Рахунок №</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Дата</Label>
              <Input value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card className="print:shadow-none" id="invoice-preview">
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="text-center border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Рахунок-фактура №{invoiceNumber}
                </h2>
                <p className="text-xs text-muted-foreground">від {invoiceDate}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Постачальник</p>
                  <p className="font-semibold text-foreground">{provider.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{provider.taxId && `ЄДРПОУ: ${provider.taxId}`}</p>
                  <p className="text-xs text-muted-foreground">{provider.address}</p>
                  <p className="text-xs text-muted-foreground">{provider.bankAccount && `IBAN: ${provider.bankAccount}`}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Покупець</p>
                  <p className="font-semibold text-foreground">{client.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{client.taxId && `ЄДРПОУ: ${client.taxId}`}</p>
                  <p className="text-xs text-muted-foreground">{client.address}</p>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1 text-muted-foreground">№</th>
                    <th className="text-left py-1 text-muted-foreground">Опис</th>
                    <th className="text-right py-1 text-muted-foreground">К-ть</th>
                    <th className="text-right py-1 text-muted-foreground">Ціна</th>
                    <th className="text-right py-1 text-muted-foreground">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-1 text-foreground">{idx + 1}</td>
                      <td className="py-1 text-foreground">{item.description || "—"}</td>
                      <td className="py-1 text-right text-foreground">{item.quantity}</td>
                      <td className="py-1 text-right font-mono text-foreground">{fmt(item.price)}</td>
                      <td className="py-1 text-right font-mono text-foreground">{fmt(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right">
                <div className="flex justify-end gap-4">
                  <span className="text-muted-foreground">Без ПДВ:</span>
                  <span className="font-mono text-foreground">{fmt(subtotal)} ₴</span>
                </div>
                {withPdv && (
                  <div className="flex justify-end gap-4">
                    <span className="text-muted-foreground">ПДВ 20%:</span>
                    <span className="font-mono text-foreground">{fmt(pdv)} ₴</span>
                  </div>
                )}
                <div className="flex justify-end gap-4 text-base font-bold">
                  <span className="text-foreground">Всього:</span>
                  <span className="font-mono text-foreground">{fmt(total)} ₴</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center pt-4 border-t border-border">
                Згенеровано безкоштовно через FINTODO · fintodo.com.ua
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button size="sm" onClick={handlePrint} className="h-9">
              <Printer className="h-4 w-4 mr-2" /> Завантажити PDF
            </Button>
            <Button size="sm" variant="outline" className="h-9">
              <FileText className="h-4 w-4 mr-2" /> Зберегти в FINTODO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
