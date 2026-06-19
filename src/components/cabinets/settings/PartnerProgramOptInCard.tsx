import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Cabinet } from "@/types/cabinet";

interface PartnerProgramOptInCardProps {
  cabinet: Cabinet;
}

/**
 * Опт-ін у партнерську програму з профілю бізнес-кабінету.
 *
 * Партнерство — НЕ окремий тип сутності і не вибирається на старті реєстрації.
 * Це режим уже створеного бізнес-кабінету (ТОВ або ФОП): після підписання
 * партнерського договору власник кабінету отримує доступ до Reseller-знижок
 * (−25/30/35%) на тарифи клієнтів та marketplace без комісії з гонорару.
 *
 * Показуємо лише для `tov` і `fop` (фізособа партнером бути не може —
 * для цього потрібна юридична суб'єктність).
 */
export const PartnerProgramOptInCard = ({ cabinet }: PartnerProgramOptInCardProps) => {
  const navigate = useNavigate();

  if (cabinet.type !== "tov" && cabinet.type !== "fop") return null;

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <Handshake className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
              Стати партнером Fintodo
              <Badge variant="outline" className="text-xs">опційно</Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Для бухгалтерів, бюро та консультантів, які ведуть кабінети клієнтів.
              Reseller-знижки −25/30/35% залежно від кількості клієнтів, 0% комісії з гонорару.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="text-sm text-muted-foreground space-y-1.5 pl-1">
          <li>• KYC-документи + КЕП-підпис партнерського договору</li>
          <li>• Вибір тіра: 1–10 / 11–50 / 51+ клієнтів</li>
          <li>• Marketplace-профіль для залучення клієнтів</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button onClick={() => navigate("/partners?onboarding=certified")} className="gap-2">
            Активувати партнерство <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => navigate("/partners")}>
            Дізнатися більше
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
