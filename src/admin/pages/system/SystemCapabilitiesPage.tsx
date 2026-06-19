import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Minus } from "lucide-react";
import { CAPABILITY_META, deriveCapabilities } from "@/config/cabinetCapabilities";
import type { Cabinet, CabinetType, CabinetCapability } from "@/types/cabinet";
import { SystemPageShell } from "./SystemPageShell";

const TYPES: { id: CabinetType; label: string }[] = [
  { id: "tov", label: "ТОВ" },
  { id: "fop", label: "ФОП" },
  { id: "fop-group", label: "Група ФОП" },
  { id: "individual", label: "Фізособа" },
];

const INDUSTRIES = [
  "it", "trade", "services", "manufacturing", "consulting", "autorepair", "dealer", "investing",
] as const;

const CAPS = Object.values(CAPABILITY_META);

function simulate(type: CabinetType, industry: (typeof INDUSTRIES)[number] | undefined, hasEmployees: boolean): CabinetCapability[] {
  const cab: Cabinet = {
    id: "sim",
    name: "sim",
    type,
    typeLabel: type,
    role: "owner",
    roleLabel: "owner",
    status: "active",
    industry,
    hasEmployees,
  };
  return deriveCapabilities(cab);
}

export default function SystemCapabilitiesPage() {
  // Матриця: рядки — комбінації (тип × галузь × прац.), колонки — capabilities.
  const rows = TYPES.flatMap((t) =>
    INDUSTRIES.map((ind) => ({
      key: `${t.id}-${ind}`,
      typeLabel: t.label,
      industry: ind,
      capsWithEmployees: simulate(t.id, ind, true),
      capsWithoutEmployees: simulate(t.id, ind, false),
    }))
  );

  return (
    <SystemPageShell
      title="Можливості кабінетів"
      description="Capability — ознака, що вмикає відповідний модуль (підтаб «Операції») у кабінеті. Виводиться автоматично з типу, галузі та профілю кабінету."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CAPS.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">{c.id}</Badge>
                <span className="font-medium text-sm">{c.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{c.description}</p>
              <p className="text-[10px] text-muted-foreground italic">Звідки: {c.derivedFromHint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-base font-semibold mb-2">Матриця виведення</h2>
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">Тип / Галузь</TableHead>
                  <TableHead>Працівники</TableHead>
                  {CAPS.map((c) => (
                    <TableHead key={c.id} className="text-center text-[10px]">{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <>
                    <TableRow key={r.key + "-yes"}>
                      <TableCell className="sticky left-0 bg-background">
                        <span className="font-medium">{r.typeLabel}</span>{" "}
                        <span className="text-xs text-muted-foreground">/ {r.industry}</span>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">з працівн.</Badge></TableCell>
                      {CAPS.map((c) => (
                        <TableCell key={c.id} className="text-center">
                          {r.capsWithEmployees.includes(c.id)
                            ? <Check className="h-3.5 w-3.5 inline text-emerald-600" />
                            : <Minus className="h-3.5 w-3.5 inline text-muted-foreground/40" />}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow key={r.key + "-no"} className="bg-muted/20">
                      <TableCell className="sticky left-0 bg-muted/20" />
                      <TableCell><Badge variant="outline" className="text-[10px]">без</Badge></TableCell>
                      {CAPS.map((c) => (
                        <TableCell key={c.id} className="text-center">
                          {r.capsWithoutEmployees.includes(c.id)
                            ? <Check className="h-3.5 w-3.5 inline text-emerald-600" />
                            : <Minus className="h-3.5 w-3.5 inline text-muted-foreground/40" />}
                        </TableCell>
                      ))}
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SystemPageShell>
  );
}
