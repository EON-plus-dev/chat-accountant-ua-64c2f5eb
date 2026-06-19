import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Briefcase, Users, Building2, GraduationCap, UserCheck, ShieldCheck, Sparkles } from "lucide-react";
import {
  useCertifiedAudience,
  setStoredAudienceRole,
  audienceToTrack,
  type AudienceRole,
  type CertifiedAudienceState,
} from "@/portal/hooks/useCertifiedAudience";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ID першого уроку курсу — куди ведемо після завершення онбордингу */
  firstLessonHref: string;
  /** Slug курсу — для побудови URL продовження */
  courseUrl: string;
}

const ROLES: Array<{ id: AudienceRole; label: string; hint: string; icon: typeof Briefcase }> = [
  { id: "solo",     label: "Приватний бухгалтер",      hint: "1–10 клієнтів, працюю самостійно",                icon: Briefcase },
  { id: "agency",   label: "Бухгалтерська агенція",    hint: "11–50 клієнтів, 2–5 співробітників",              icon: Users },
  { id: "firm",     label: "Бюро / компанія",          hint: "50+ клієнтів, відділи, КЕП-флоу, аудит",          icon: Building2 },
  { id: "in_house", label: "In-house бухгалтер",       hint: "Один роботодавець, потрібен бейдж для CV",        icon: UserCheck },
  { id: "student",  label: "Студент / молодший фахівець", hint: "Готуюсь до першої роботи, шукаю практику",    icon: GraduationCap },
];

export function CertifiedTryDialog({ open, onOpenChange, firstLessonHref, courseUrl }: Props) {
  const audience = useCertifiedAudience();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<AudienceRole | null>(null);

  // Якщо вже залогінений і має кабінет — Step 2 (auth) пропускаємо.
  const canSkipAuth = audience.state === "accountant_no_profile"
    || audience.state === "partner_uncertified"
    || audience.state === "partner_certified";

  const handlePickRole = (r: AudienceRole) => {
    setRole(r);
    setStoredAudienceRole(r);
    if (canSkipAuth) setStep(3);
    else setStep(2);
  };

  const goToAuth = () => {
    try {
      sessionStorage.setItem("postLoginRedirect", courseUrl + "?onboarding=certified");
    } catch { /* noop */ }
    navigate("/login");
    onOpenChange(false);
  };

  const goToLesson = () => {
    onOpenChange(false);
    navigate(firstLessonHref);
  };

  const goToCabinetClients = () => {
    onOpenChange(false);
    if (audience.primaryCabinetId) {
      navigate(`/cabinet/${audience.primaryCabinetId}/contractors?openInvite=1`);
    } else {
      navigate("/me/overview?openPartnerProgram=1");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Steps indicator */}
        <div className="flex items-center gap-1 px-6 pt-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-colors ${
                n <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="px-6 pb-6 pt-4">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl">Хто ви?</DialogTitle>
              <DialogDescription>
                Ми підлаштуємо матеріали і трек іспиту під ваш контекст. Це можна змінити пізніше.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handlePickRole(r.id)}
                    className={`w-full text-left rounded-md border px-3 py-3 flex items-start gap-3 transition-colors hover:border-primary/40 hover:bg-primary/5 ${
                      active ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.hint}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 pb-6 pt-4">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl">Один крок до старту</DialogTitle>
              <DialogDescription>
                Створимо ваш робочий простір — щоб після уроків можна було одразу прийняти першого клієнта.
              </DialogDescription>
            </DialogHeader>

            <Card className="mt-4 p-4 bg-muted/30 border-dashed">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Доступ до курсу і бейджа — безкоштовно. Після входу ми створимо ваш робочий простір автоматично.
                </span>
              </div>
            </Card>

            <div className="mt-4 space-y-2">
              <Button className="w-full" size="lg" onClick={goToAuth}>
                Увійти, щоб продовжити <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button className="w-full" variant="ghost" onClick={() => setStep(3)}>
                Подивитись перший урок без входу
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-muted-foreground hover:text-foreground pt-2"
              >
                ← Змінити роль
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="px-6 pb-6 pt-4">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl">Готово — починаємо</DialogTitle>
              </div>
              <DialogDescription>
                {role
                  ? `Трек іспиту: ${audienceToTrack(role).toUpperCase()}. Перший урок безкоштовний, без зобовʼязань.`
                  : "Перший урок безкоштовний, без зобовʼязань."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              <Button className="w-full" size="lg" onClick={goToLesson}>
                Розпочати урок 1.1 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              {(audience.state === "accountant_no_profile" || audience.state === "partner_uncertified" || audience.state === "partner_certified") && (
                <Button className="w-full" variant="outline" onClick={goToCabinetClients}>
                  Запросити клієнта зараз (це урок 2.1 у дії)
                </Button>
              )}
              <p className="text-xs text-muted-foreground text-center pt-2">
                {explainState(audience.state)}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function explainState(s: CertifiedAudienceState): string {
  switch (s) {
    case "accountant_no_profile":
      return "Після уроку 1.3 ви зможете активувати публічну картку партнера в один клік.";
    case "partner_uncertified":
      return "Після іспиту ваша картка отримає бейдж «FINTODO Certified» автоматично.";
    case "partner_certified":
      return "Ви вже сертифіковані — це повторне проходження для оновлення знань.";
    default:
      return "Прогрес зберігається. Можна повернутись у будь-який момент.";
  }
}
