import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  features?: string[];
  children?: ReactNode;
}

/** Спільна заглушка для розділів Адмін Operations, які поки в розробці. */
export function SystemStubPage({ title, description, features, children }: Props) {
  return (
    <SystemPageShell title={title} description={description}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Construction className="h-5 w-5" />
            <div className="text-sm">Модуль у розробці. Нижче — заплановані можливості (Демо).</div>
          </div>
          {features && features.length > 0 && (
            <ul className="text-sm space-y-1.5 ml-1">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 rounded-full bg-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
          {children}
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
