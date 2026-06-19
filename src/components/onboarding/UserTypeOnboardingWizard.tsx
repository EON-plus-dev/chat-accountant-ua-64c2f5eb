import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, ShieldCheck, User, Building2, Briefcase } from "lucide-react";
import { getUserTypeById, type UserType } from "@/config/userTypeConfig";

type Audience = "business" | "individual";
type LegalForm = "tov" | "fop";

const AUDIENCE_OPTIONS: Array<{ id: Audience; title: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "business", title: "Юридична особа / ФОП", description: "ТОВ, АТ, ПП або ФОП — для підприємницької діяльності.", icon: Building2 },
  { id: "individual", title: "Фізична особа", description: "Особисті фінанси, дивіденди, нерухомість, авто. Без підприємницької діяльності.", icon: User },
];

const LEGAL_FORMS: Array<{ id: LegalForm; title: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "tov", title: "ТОВ (юридична особа)", description: "ТОВ, АТ, ПП. Реєстрація — за КЕП керівника або уповноваженої особи.", icon: Building2 },
  { id: "fop", title: "ФОП", description: "Фізична особа-підприємець. КЕП ФОП або хмарний підпис Дія.", icon: Briefcase },
];

interface UserTypeWizardProps {
  onComplete?: () => void;
}

/**
 * Audience-first onboarding (3 steps max):
 *   1. Юрособа/ФОП / Фізособа
 *   2. ТОВ / ФОП — only for "business" audience
 *   3. Метод авторизації + «Створити кабінет»
 *
 * Партнерство (бухгалтери, бюро) — НЕ окрема аудиторія. Це опт-ін режим
 * бізнес-кабінету, який активується після реєстрації через картку у профілі
 * або AI-нудж за КВЕДом 69.20 / наявністю активних делегацій.
 */
export function UserTypeOnboardingWizard({ onComplete }: UserTypeWizardProps = {}) {
  const [step, setStep] = useState(1);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [legalForm, setLegalForm] = useState<LegalForm | null>(null);
  const navigate = useNavigate();

  const userType: UserType | null =
    audience === "individual"
      ? "individual"
      : audience && legalForm
        ? legalForm === "tov" ? "business" : "fop"
        : null;

  const cabinetType: string | null =
    audience === "individual" ? "individual" : legalForm ?? null;

  const def = userType ? getUserTypeById(userType) : null;

  const totalSteps = audience === "individual" ? 2 : 3;
  const displayStep = audience === "individual" && step === 3 ? 2 : step;

  const goNextFromAudience = () => {
    if (!audience) return;
    if (audience === "individual") {
      setLegalForm(null);
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const goBackFromAuth = () => setStep(audience === "individual" ? 1 : 2);

  const finish = () => {
    if (userType) localStorage.setItem("user_type", userType);
    if (cabinetType) localStorage.setItem("intended_cabinet_type", cabinetType);
    // Legacy cleanup: партнерського наміру більше немає в онбордингу
    localStorage.removeItem("partner_intent");
    if (onComplete) {
      onComplete();
    } else {
      navigate(`/add-cabinet?userType=${userType}&type=${cabinetType}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        Крок {displayStep} з {totalSteps}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Хто ви?</CardTitle>
            <CardDescription>Оберіть тип суб'єкта — далі підлаштуємо сценарій онбордингу.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {AUDIENCE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = audience === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAudience(opt.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    active ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{opt.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{opt.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="flex justify-end pt-2">
              <Button disabled={!audience} onClick={goNextFromAudience}>
                Далі <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && audience !== "individual" && (
        <Card>
          <CardHeader>
            <CardTitle>Юридична форма</CardTitle>
            <CardDescription>
              Оберіть форму вашого бізнесу — від неї залежить метод підпису.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {LEGAL_FORMS.map((opt) => {
              const Icon = opt.icon;
              const active = legalForm === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setLegalForm(opt.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    active ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{opt.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{opt.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Назад
              </Button>
              <Button disabled={!legalForm} onClick={() => setStep(3)}>
                Далі <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && def && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Метод авторизації
            </CardTitle>
            <CardDescription>{def.authMethodLabel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              {def.legalNote}
            </div>
            <Badge variant="outline">
              {def.authMethod === "kep" ? "КЕП — обов'язково" : "Дія.Підпис — достатньо"}
            </Badge>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={goBackFromAuth}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Назад
              </Button>
              <Button onClick={finish}>Створити кабінет</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
