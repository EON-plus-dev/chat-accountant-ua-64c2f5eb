import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Банер для відвідувачів `/partners`, які вже завершили онбординг
 * (мають створений бізнес-кабінет). Партнерство тепер активується
 * з профілю кабінету, а не як окремий тип реєстрації.
 *
 * Сигнал «вже зареєстрований» беремо з localStorage.onboarding_complete,
 * щоб не тягнути сюди повний auth-context лендингу.
 */
export const LoggedInPartnerBanner = () => {
  const hasCabinet =
    typeof window !== "undefined" &&
    localStorage.getItem("onboarding_complete") === "true";

  if (!hasCabinet) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <Card className="border-primary/30 bg-primary/[0.04] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="rounded-md bg-primary/10 p-2 shrink-0">
            <Handshake className="h-5 w-5 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">Ви вже зареєстровані у Fintodo.</div>
            <div className="text-muted-foreground mt-0.5">
              Партнерство активується з профілю вашого бізнес-кабінету —
              окрема реєстрація не потрібна.
            </div>
          </div>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link to="/dashboard">
            Перейти у кабінет <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    </div>
  );
};
