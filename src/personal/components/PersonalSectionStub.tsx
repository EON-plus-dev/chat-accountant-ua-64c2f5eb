import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Construction } from "lucide-react";
import type { PersonalSection } from "@/personal/composition";

interface Props {
  section: PersonalSection;
  /** Optional rich block rendered below the description (e.g. preview list). */
  children?: React.ReactNode;
  /** Override стандартного «У розробці» бейджа. */
  badge?: string;
}

export function PersonalSectionStub({ section, children, badge }: Props) {
  const Icon = section.icon;
  return (
    <div className="container max-w-6xl py-6 md:py-10">
      <header className="mb-6 flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{section.label}</h1>
            <Badge variant="secondary">{badge ?? "У розробці"}</Badge>
          </div>
          {section.description && (
            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
          )}
        </div>
      </header>

      {children ?? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Construction className="h-4 w-4" /> Незабаром
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Цей розділ зʼявиться найближчим часом. Хочете дізнатися першим, коли
              він буде готовий?
            </p>
            <Button size="sm" variant="outline">Повідомити, коли буде готово</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
