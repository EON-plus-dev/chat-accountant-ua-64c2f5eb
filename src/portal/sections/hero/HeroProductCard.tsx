import { Link } from "react-router-dom";
import { TOOLS } from "@/portal/data/tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Check } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const ADVANTAGES = [
  "Розрахунок ЄСВ і ЄП в 1 клік",
  "Нагадування за 3, 7, 14 днів до дедлайну",
  "Звіти і виписки автоматично",
];

export const HeroProductCard = () => (
  <Card className="border-primary/20 shadow-md bg-card sticky top-24">
    <CardContent className="p-5 space-y-4">
      <Badge variant="info" className="text-[10px] gap-1">
        <Zap className="h-3 w-3" />
        AI-автоматизація обліку
      </Badge>

      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">
          Втомились рахувати ЄСВ вручну?
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          FINTODO розраховує автоматично, нагадує про дедлайни і формує звіти — без участі бухгалтера.
        </p>
      </div>

      <ul className="space-y-2">
        {ADVANTAGES.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="space-y-2 pt-1">
        <Button asChild className="w-full">
          <Link to={CTA_CHECKOUT_URL}>
            Спробувати безкоштовно — 14 днів
          </Link>
        </Button>
        <Button variant="ghost" asChild className="w-full text-sm">
          <Link to={CTA_CHECKOUT_URL} className="flex items-center gap-1">
            Дізнатись більше про FINTODO <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {TOOLS.length}+ інструментів · Безкоштовний старт
      </p>
    </CardContent>
  </Card>
);
