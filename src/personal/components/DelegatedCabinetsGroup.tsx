import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import {
  useMyDelegatedCabinets,
  CONTRACT_KIND_LABELS,
  type DelegatedCabinetRow,
} from "@/personal/hooks/useMyDelegatedCabinets";

export function DelegatedCabinetsGroup() {
  const { data, isLoading } = useMyDelegatedCabinets();
  const rows = data ?? [];

  const grouped = rows.reduce<Record<string, DelegatedCabinetRow[]>>((acc, row) => {
    (acc[row.contractKind] ||= []).push(row);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5" /> Делеговані кабінети
        </CardTitle>
        <Badge variant="outline">{rows.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Завантаження…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ви не маєте активних делегацій. Власник кабінету може запросити вас як
            бухгалтера, довірену особу або співробітника — і кабінет зʼявиться тут.
          </p>
        ) : (
          Object.entries(grouped).map(([kind, list]) => (
            <div key={kind} className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Users className="h-3 w-3" />
                {CONTRACT_KIND_LABELS[kind as keyof typeof CONTRACT_KIND_LABELS] ?? kind}
                <Badge variant="secondary" className="ml-1">{list.length}</Badge>
              </div>
              {list.map((row) => (
                <Link
                  key={row.contractId}
                  to={`/cabinet/${row.cabinetId}/overview`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition"
                >
                  <div>
                    <div className="font-mono text-sm">{row.cabinetId}</div>
                    <div className="text-xs text-muted-foreground">
                      Діє з {new Date(row.validFrom).toLocaleDateString("uk-UA")}
                      {row.validUntil && ` до ${new Date(row.validUntil).toLocaleDateString("uk-UA")}`}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Відкрити <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              ))}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
