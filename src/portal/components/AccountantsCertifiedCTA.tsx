import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, X, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CertifiedTryDialog } from "@/portal/components/CertifiedTryDialog";

type CtaState = "guest" | "no_profile" | "uncertified_partner" | "certified_partner" | "loading";

interface PartnerCtaInfo {
  state: CtaState;
  targetUrl: string;
  title: string;
  body: string;
  ctaLabel: string;
  accountantSlug?: string | null;
}

const PARTNERS_LANDING = "/partners?utm=catalog_certified";
const CABINET_PARTNER_PROGRAM = "/me/overview?openPartnerProgram=1";
const DISMISS_KEY = "catalog.certified_cta_dismissed_until";

function useCertifiedCtaState(): PartnerCtaInfo {
  const [info, setInfo] = useState<PartnerCtaInfo>({
    state: "loading",
    targetUrl: PARTNERS_LANDING,
    title: "",
    body: "",
    ctaLabel: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        if (!cancelled)
          setInfo({
            state: "guest",
            targetUrl: PARTNERS_LANDING,
            title: "Ви бухгалтер?",
            body: "Зареєструйтесь та отримайте FINTODO Certified — безкоштовно. Отримуйте клієнтів через наш каталог.",
            ctaLabel: "Стати FINTODO Certified",
          });
        return;
      }

      const { data: profile } = await supabase
        .from("partner_profiles")
        .select("is_certified, accountant_slug")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (!profile) {
        setInfo({
          state: "no_profile",
          targetUrl: PARTNERS_LANDING,
          title: "Активуйте партнерський профіль",
          body: "Створіть профіль бухгалтера-партнера і потрапте у наш каталог. Безкоштовно, 0% комісії.",
          ctaLabel: "Долучитись до програми",
        });
        return;
      }

      if (!profile.is_certified) {
        setInfo({
          state: "uncertified_partner",
          targetUrl: CABINET_PARTNER_PROGRAM,
          title: "Підтвердіть Certified-статус",
          body: "Ви вже партнер. Завершіть сертифікацію в налаштуваннях кабінету, щоб отримати бейдж FINTODO Certified у каталозі.",
          ctaLabel: "Перейти до сертифікації",
          accountantSlug: profile.accountant_slug,
        });
        return;
      }

      setInfo({
        state: "certified_partner",
        targetUrl: profile.accountant_slug
          ? `/dovidnyky/accountants/${profile.accountant_slug}`
          : CABINET_PARTNER_PROGRAM,
        title: "Ваш профіль у каталозі",
        body: "",
        ctaLabel: "Відкрити мій профіль",
        accountantSlug: profile.accountant_slug,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return info;
}

function isDismissed(): boolean {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return false;
    return parseInt(v, 10) > Date.now();
  } catch {
    return false;
  }
}

interface Props {
  variant: "strip" | "card";
}

const COURSE_URL = "/learn/accountants/fintodo-certified";
const FIRST_LESSON_URL = `${COURSE_URL}/m1l1`;

export function AccountantsCertifiedCTA({ variant }: Props) {
  const info = useCertifiedCtaState();
  const [dismissed, setDismissed] = useState<boolean>(() =>
    variant === "strip" ? isDismissed() : false,
  );
  const [tryOpen, setTryOpen] = useState(false);

  if (info.state === "loading") return null;

  // Для всіх станів КРІМ certified_partner — відкриваємо уніфікований Try Dialog
  // (consistent з кнопкою «Спробувати» на сторінці курсу).
  const openOnboarding = () => setTryOpen(true);

  // Strip variant — only for guest / no_profile, hidable
  if (variant === "strip") {
    if (info.state === "certified_partner" || info.state === "uncertified_partner") return null;
    if (dismissed) return null;

    const dismiss = () => {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      } catch {}
      setDismissed(true);
    };

    return (
      <>
        <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="flex-1 min-w-0 text-foreground">
            <span className="font-medium">Ви бухгалтер?</span>{" "}
            <span className="text-muted-foreground">Безкоштовний FINTODO Certified для каталогу.</span>
          </p>
          <Button onClick={openOnboarding} size="sm" variant="default" className="shrink-0 h-7 px-3 text-xs">
            {info.ctaLabel} <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Сховати"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <CertifiedTryDialog
          open={tryOpen}
          onOpenChange={setTryOpen}
          firstLessonHref={FIRST_LESSON_URL}
          courseUrl={COURSE_URL}
        />
      </>
    );
  }

  // Card variant — bottom reinforcement, all states except certified_partner show full card
  if (info.state === "certified_partner") {
    return (
      <section className="rounded-xl border border-success/30 bg-success/5 p-5 mt-8 flex items-center gap-3">
        <Award className="h-5 w-5 text-success shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{info.title}</p>
          <p className="text-xs text-muted-foreground">
            Ви — FINTODO Certified партнер. Ваша сторінка доступна у каталозі.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={info.targetUrl}>
            {info.ctaLabel} <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3 mt-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">{info.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{info.body}</p>
        <Button onClick={openOnboarding} className="mt-1">
          {info.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
      <CertifiedTryDialog
        open={tryOpen}
        onOpenChange={setTryOpen}
        firstLessonHref={FIRST_LESSON_URL}
        courseUrl={COURSE_URL}
      />
    </>
  );
}
