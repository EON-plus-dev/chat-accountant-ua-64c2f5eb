import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { RBAC_MODULES, RBAC_ROLES, MOCK_ROLES_MATRIX } from "@/admin/system/data/mocks";
import { Check, Eye, Minus } from "lucide-react";

const ICON = [<Minus className="h-3.5 w-3.5 text-muted-foreground" />, <Eye className="h-3.5 w-3.5 text-sky-600" />, <Check className="h-3.5 w-3.5 text-emerald-600" />];
const LABEL = ["—", "read", "full"];

export default function SystemRbacPage() {
  return (
    <SystemPageShell title="Ролі та доступи (RBAC)" description="Матриця 9 ролей × 8 модулів. Демо — read-only.">
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-2 font-medium sticky left-0 bg-muted/40">Роль</th>
                {RBAC_MODULES.map((m) => <th key={m} className="p-2 text-xs font-medium">{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {RBAC_ROLES.map((role) => (
                <tr key={role} className="border-b last:border-0">
                  <td className="p-2 font-medium sticky left-0 bg-background">{role}</td>
                  {MOCK_ROLES_MATRIX[role].map((lvl, i) => (
                    <td key={i} className="p-2 text-center">
                      <div className="inline-flex items-center gap-1" title={LABEL[lvl]}>{ICON[lvl]}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
