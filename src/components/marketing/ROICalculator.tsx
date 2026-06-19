import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, Clock, FileText, CreditCard, Users, Sparkles,
  Building2, Briefcase, Factory, Loader2, Store, Monitor, ShieldCheck, UserSearch,
  Home, BarChart3, Bitcoin, Landmark, ScrollText, Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useContext } from "react";
import { AudienceContext } from "@/contexts/AudienceContext";
import type { LucideIcon } from "lucide-react";

interface ROICalculatorProps {
  initialDocuments?: number;
  initialPayments?: number;
  initialTurnover?: number;
  onSelectPlan?: (planId: string) => void;
  className?: string;
  compact?: boolean;
}

// ===== BUSINESS Constants =====
const ACCOUNTANT_HOURLY_RATE = 300;
const TIME_PER_DOCUMENT_MANUAL = 0.5;
const TIME_PER_PAYMENT_MANUAL = 0.25;
const TIME_PER_REPORT_MANUAL = 4;
const REPORTS_PER_QUARTER = 3;
const TIME_PER_PAYROLL_MANUAL = 0.5;
const TIME_PER_VAT_REPORT = 6;
const TIME_PER_CONTRACTOR_CHECK = 0.25;

const TIME_SAVING_DOCUMENTS = 0.8;
const TIME_SAVING_PAYMENTS = 0.9;
const TIME_SAVING_REPORTS = 0.7;
const TIME_SAVING_PAYROLL = 0.8;
const TIME_SAVING_VAT = 0.85;
const TIME_SAVING_CONTRACTOR = 0.95;

const PLAN_PRICES: Record<string, number> = { start: 399, smart: 799, premium: 1199 };
const PLAN_NAMES: Record<string, string> = { start: "Старт", smart: "Смарт", premium: "Преміум" };

// ===== INDIVIDUAL Constants =====
const INDIVIDUAL_HOURLY_RATE = 200;
const TIME_PER_INCOME_SOURCE = 2;
const TIME_PER_RENTAL_OBJECT = 1.5;
const TIME_PER_BROKER_REPORT = 3 / 12; // per month
const TIME_FOREIGN_INCOME = 4;

const SAVING_INCOME = 0.75;
const SAVING_RENTAL = 0.85;
const SAVING_BROKER = 0.90;
const SAVING_FOREIGN = 0.80;

const IND_PLAN_PRICES: Record<string, number> = { basic: 149, standard: 349, professional: 699 };
const IND_PLAN_NAMES: Record<string, string> = { basic: "Базовий", standard: "Стандарт", professional: "Професійний" };

// --- Business Profiles ---
interface BusinessProfile {
  id: string;
  label: string;
  subtitle: string;
  category: "fop" | "tov";
  icon: LucideIcon;
  docs: number;
  payments: number;
  employees: number;
  contractors: number;
  vatPayer: boolean;
  fopGroup?: 1 | 2 | 3;
}

const PROFILES: BusinessProfile[] = [
  { id: "fop-12", label: "ФОП 1-2 групи", subtitle: "Послуги, ринок", category: "fop", icon: Briefcase, docs: 5, payments: 3, employees: 0, contractors: 3, vatPayer: false, fopGroup: 1 },
  { id: "fop-3", label: "ФОП 3 без ПДВ", subtitle: "IT, консалтинг", category: "fop", icon: Monitor, docs: 15, payments: 8, employees: 0, contractors: 8, vatPayer: false, fopGroup: 3 },
  { id: "fop-3-vat", label: "ФОП 3 з ПДВ", subtitle: "Торгівля, послуги", category: "fop", icon: Store, docs: 30, payments: 15, employees: 2, contractors: 20, vatPayer: true, fopGroup: 3 },
  { id: "tov-small", label: "Мале ТОВ", subtitle: "До 10 осіб", category: "tov", icon: Building2, docs: 25, payments: 15, employees: 5, contractors: 15, vatPayer: false },
  { id: "tov-vat", label: "ТОВ з ПДВ", subtitle: "Торгівля, виробництво", category: "tov", icon: Factory, docs: 50, payments: 25, employees: 10, contractors: 30, vatPayer: true },
  { id: "tov-medium", label: "Середнє ТОВ", subtitle: "Агенція, кілька напрямків", category: "tov", icon: ShieldCheck, docs: 80, payments: 40, employees: 20, contractors: 50, vatPayer: true },
];

const CATEGORY_LABELS: Record<string, string> = { fop: "ФОП", tov: "ТОВ" };

// --- Individual Profiles ---
interface IndividualProfile {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  incomeSources: number;
  rentalObjects: number;
  brokerReports: number;
  foreignIncome: boolean;
}

const INDIVIDUAL_PROFILES: IndividualProfile[] = [
  { id: "salary-rent", label: "Зарплата + оренда", subtitle: "Найпоширеніший сценарій", icon: Home, incomeSources: 2, rentalObjects: 1, brokerReports: 0, foreignIncome: false },
  { id: "investor", label: "Інвестор", subtitle: "Акції, облігації, фонди", icon: BarChart3, incomeSources: 3, rentalObjects: 0, brokerReports: 2, foreignIncome: true },
  { id: "landlord", label: "Орендодавець", subtitle: "Кілька об'єктів нерухомості", icon: Building2, incomeSources: 4, rentalObjects: 3, brokerReports: 0, foreignIncome: false },
  { id: "crypto", label: "Криптоінвестор", subtitle: "Криптовалюти, DeFi, стейкінг", icon: Bitcoin, incomeSources: 3, rentalObjects: 0, brokerReports: 3, foreignIncome: true },
  { id: "civil-servant", label: "Держслужбовець / НАЗК", subtitle: "Е-декларування, активи", icon: Landmark, incomeSources: 5, rentalObjects: 2, brokerReports: 1, foreignIncome: true },
  { id: "complex", label: "Складне декларування", subtitle: "Багато джерел та звітів", icon: ScrollText, incomeSources: 6, rentalObjects: 3, brokerReports: 3, foreignIncome: true },
];

export const ROICalculator = ({
  initialDocuments = 15,
  initialPayments = 8,
  onSelectPlan,
  className,
  compact = false,
}: ROICalculatorProps) => {
  const ctx = useContext(AudienceContext);
  const audience = ctx?.audience ?? "business";
  const isBusiness = audience === "business";

  // --- Business state ---
  const [documents, setDocuments] = useState(initialDocuments);
  const [payments, setPayments] = useState(initialPayments);
  const [employees, setEmployees] = useState(0);
  const [contractors, setContractors] = useState(8);
  const [vatPayer, setVatPayer] = useState(false);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);

  // --- Individual state ---
  const [incomeSources, setIncomeSources] = useState(2);
  const [rentalObjects, setRentalObjects] = useState(1);
  const [brokerReports, setBrokerReports] = useState(0);
  const [foreignIncome, setForeignIncome] = useState(false);
  const [activeIndProfile, setActiveIndProfile] = useState<string | null>(null);

  // --- Shared state ---
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const activeProfileData = PROFILES.find(p => p.id === activeProfile);

  const applyProfile = (profile: BusinessProfile) => {
    setDocuments(profile.docs);
    setPayments(profile.payments);
    setEmployees(profile.employees);
    setContractors(profile.contractors);
    setVatPayer(profile.vatPayer);
    setActiveProfile(profile.id);
    setAiAdvice(null);
  };

  const applyIndProfile = (profile: IndividualProfile) => {
    setIncomeSources(profile.incomeSources);
    setRentalObjects(profile.rentalObjects);
    setBrokerReports(profile.brokerReports);
    setForeignIncome(profile.foreignIncome);
    setActiveIndProfile(profile.id);
    setAiAdvice(null);
  };

  const handleSliderChange = (setter: (v: number) => void) => (v: number) => {
    setter(v);
    if (isBusiness) setActiveProfile(null); else setActiveIndProfile(null);
  };

  // ===== BUSINESS savings =====
  const businessSavings = useMemo(() => {
    const manualDocTime = documents * TIME_PER_DOCUMENT_MANUAL;
    const manualPayTime = payments * TIME_PER_PAYMENT_MANUAL;
    const manualReportTime = REPORTS_PER_QUARTER / 3;
    const manualPayrollTime = employees * TIME_PER_PAYROLL_MANUAL;
    const manualVatTime = vatPayer ? TIME_PER_VAT_REPORT : 0;
    const manualContractorTime = contractors * TIME_PER_CONTRACTOR_CHECK;

    const savedDoc = manualDocTime * TIME_SAVING_DOCUMENTS;
    const savedPay = manualPayTime * TIME_SAVING_PAYMENTS;
    const savedReport = manualReportTime * TIME_SAVING_REPORTS;
    const savedPayroll = manualPayrollTime * TIME_SAVING_PAYROLL;
    const savedVat = manualVatTime * TIME_SAVING_VAT;
    const savedContractor = manualContractorTime * TIME_SAVING_CONTRACTOR;

    const timeSaved = savedDoc + savedPay + savedReport + savedPayroll + savedVat + savedContractor;
    const moneySaved = Math.round(timeSaved * ACCOUNTANT_HOURLY_RATE);
    const yearlySaved = moneySaved * 12;

    let recommendedPlan: "start" | "smart" | "premium" = "start";
    const totalActions = documents + payments;
    if ((vatPayer && employees > 10) || totalActions > 80 || employees > 15) {
      recommendedPlan = "premium";
    } else if (vatPayer || employees > 0 || contractors > 10 || totalActions > 25) {
      recommendedPlan = "smart";
    }

    const planPrice = PLAN_PRICES[recommendedPlan];
    const roi = planPrice > 0 ? Math.round((yearlySaved / (planPrice * 12)) * 100) : 0;

    let reason = "";
    if (recommendedPlan === "premium") {
      const parts: string[] = [];
      if (totalActions > 80) parts.push(`великий обсяг операцій (${totalActions})`);
      if (employees > 10) parts.push(`значний штат (${employees} осіб)`);
      if (vatPayer) parts.push("платник ПДВ");
      reason = parts.join(", ") || "масштабний бізнес";
    } else if (recommendedPlan === "smart") {
      const parts: string[] = [];
      if (vatPayer) parts.push("ПДВ-звітність");
      if (employees > 0) parts.push(`зарплатний модуль (${employees} осіб)`);
      if (contractors > 10) parts.push(`перевірка контрагентів (${contractors})`);
      reason = parts.join(", ") || `активний документообіг (${documents} док/міс)`;
    } else {
      reason = "початковий обсяг роботи";
    }

    return {
      timeSaved: Math.round(timeSaved * 10) / 10,
      moneySaved, yearlySaved, roi, recommendedPlan, reason,
      planNames: PLAN_NAMES, planPrices: PLAN_PRICES,
      bars: [
        { label: "Документи", pct: TIME_SAVING_DOCUMENTS * 100, minutes: Math.round(savedDoc * 60), show: true },
        { label: "Платежі", pct: TIME_SAVING_PAYMENTS * 100, minutes: Math.round(savedPay * 60), show: true },
        { label: "Звіти", pct: TIME_SAVING_REPORTS * 100, minutes: Math.round(savedReport * 60), show: true },
        { label: "Зарплата", pct: TIME_SAVING_PAYROLL * 100, minutes: Math.round(savedPayroll * 60), show: employees > 0 },
        { label: "ПДВ та реєстри", pct: TIME_SAVING_VAT * 100, minutes: Math.round(savedVat * 60), show: vatPayer },
        { label: "Контрагенти", pct: TIME_SAVING_CONTRACTOR * 100, minutes: Math.round(savedContractor * 60), show: contractors > 5 },
      ],
    };
  }, [documents, payments, employees, contractors, vatPayer]);

  // ===== INDIVIDUAL savings =====
  const individualSavings = useMemo(() => {
    const manualIncome = incomeSources * TIME_PER_INCOME_SOURCE;
    const manualRental = rentalObjects * TIME_PER_RENTAL_OBJECT;
    const manualBroker = brokerReports * TIME_PER_BROKER_REPORT;
    const manualForeign = foreignIncome ? TIME_FOREIGN_INCOME : 0;

    const savedIncome = manualIncome * SAVING_INCOME;
    const savedRental = manualRental * SAVING_RENTAL;
    const savedBroker = manualBroker * SAVING_BROKER;
    const savedForeign = manualForeign * SAVING_FOREIGN;

    const timeSaved = savedIncome + savedRental + savedBroker + savedForeign;
    const moneySaved = Math.round(timeSaved * INDIVIDUAL_HOURLY_RATE);
    const yearlySaved = moneySaved * 12;

    let recommendedPlan: "basic" | "standard" | "professional" = "basic";
    if (incomeSources > 4 || (brokerReports > 2 && foreignIncome) || activeIndProfile === "civil-servant") {
      recommendedPlan = "professional";
    } else if (brokerReports > 0 || rentalObjects > 1 || foreignIncome) {
      recommendedPlan = "standard";
    }

    const planPrice = IND_PLAN_PRICES[recommendedPlan];
    const roi = planPrice > 0 ? Math.round((yearlySaved / (planPrice * 12)) * 100) : 0;

    let reason = "";
    if (recommendedPlan === "professional") {
      const parts: string[] = [];
      if (incomeSources > 4) parts.push(`${incomeSources} джерел доходу`);
      if (brokerReports > 2 && foreignIncome) parts.push("складні інвестиції + іноземні доходи");
      if (activeIndProfile === "civil-servant") parts.push("е-декларування НАЗК");
      reason = parts.join(", ") || "складне декларування";
    } else if (recommendedPlan === "standard") {
      const parts: string[] = [];
      if (brokerReports > 0) parts.push(`${brokerReports} брокерських звітів/рік`);
      if (rentalObjects > 1) parts.push(`${rentalObjects} об'єкти оренди`);
      if (foreignIncome) parts.push("іноземні доходи");
      reason = parts.join(", ") || "розширене декларування";
    } else {
      reason = "базове декларування доходів";
    }

    return {
      timeSaved: Math.round(timeSaved * 10) / 10,
      moneySaved, yearlySaved, roi, recommendedPlan, reason,
      planNames: IND_PLAN_NAMES, planPrices: IND_PLAN_PRICES,
      bars: [
        { label: "Джерела доходу", pct: SAVING_INCOME * 100, minutes: Math.round(savedIncome * 60), show: true },
        { label: "Облік оренди", pct: SAVING_RENTAL * 100, minutes: Math.round(savedRental * 60), show: rentalObjects > 0 },
        { label: "Брокерські звіти", pct: SAVING_BROKER * 100, minutes: Math.round(savedBroker * 60), show: brokerReports > 0 },
        { label: "Іноземні доходи", pct: SAVING_FOREIGN * 100, minutes: Math.round(savedForeign * 60), show: foreignIncome },
      ],
    };
  }, [incomeSources, rentalObjects, brokerReports, foreignIncome, activeIndProfile]);

  const savings = isBusiness ? businessSavings : individualSavings;

  const fetchAiAdvice = async () => {
    setAiLoading(true);
    setAiAdvice(null);
    try {
      const body = isBusiness
        ? {
            audienceType: "business" as const,
            documents, payments, employees, contractors, vatPayer,
            entityType: activeProfileData?.category || (employees > 3 ? "tov" : "fop"),
            fopGroup: activeProfileData?.fopGroup,
          }
        : {
            audienceType: "individual" as const,
            incomeSources, rentalObjects, brokerReports, foreignIncome,
          };
      const { data, error } = await supabase.functions.invoke("roi-advice", { body });
      if (error) throw error;
      setAiAdvice(data?.advice || "Не вдалося отримати пораду.");
    } catch {
      setAiAdvice("Не вдалося отримати пораду. Спробуйте пізніше.");
    } finally {
      setAiLoading(false);
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat("uk-UA").format(v);

  if (compact) {
    return (
      <Card className={cn("bg-gradient-to-br from-emerald-50/50 to-sky-50/50 dark:from-emerald-950/20 dark:to-sky-950/20 border-emerald-200/50 dark:border-emerald-800/50", className)}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-sm">Калькулятор вигоди</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-background/80 rounded-lg">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">~{savings.timeSaved} год</p>
              <p className="text-xs text-muted-foreground">економія часу/міс</p>
            </div>
            <div className="text-center p-2 bg-background/80 rounded-lg">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">~{fmt(savings.moneySaved)} ₴</p>
              <p className="text-xs text-muted-foreground">економія коштів/міс</p>
            </div>
          </div>
          {onSelectPlan && (
            <Button size="sm" className="w-full" onClick={() => onSelectPlan(savings.recommendedPlan)}>Обрати тариф</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT: Parameters */}
          <div className="p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-border">
            {isBusiness ? (
              <>
                {/* Business Profile Cards */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Ваш бізнес-профіль</h3>
                  {(["fop", "tov"] as const).map((cat) => (
                    <div key={cat} className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">{CATEGORY_LABELS[cat]}</span>
                      <div className="grid grid-cols-3 gap-2">
                        {PROFILES.filter(p => p.category === cat).map((profile) => {
                          const Icon = profile.icon;
                          const isActive = activeProfile === profile.id;
                          return (
                            <button
                              key={profile.id}
                              onClick={() => applyProfile(profile)}
                              className={cn(
                                "flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all duration-200 border",
                                isActive
                                  ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-sm"
                                  : "bg-background border-border/60 hover:border-primary/40 hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("font-semibold text-xs leading-tight", isActive ? "text-primary" : "text-foreground")}>{profile.label}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground leading-tight">{profile.subtitle}</span>
                              <span className="text-[10px] text-muted-foreground/60">~{profile.docs} док/міс</span>
                              {profile.vatPayer && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 w-fit border-amber-400/50 text-amber-600 dark:text-amber-400">ПДВ</Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Business Sliders */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Налаштуйте параметри</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-primary" />Документів на місяць</Label>
                      <span className="font-semibold tabular-nums text-sm bg-muted px-2 py-0.5 rounded">{documents}</span>
                    </div>
                    <Slider value={[documents]} onValueChange={([v]) => handleSliderChange(setDocuments)(v)} max={100} min={1} step={1} className="py-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4 text-primary" />Платежів на місяць</Label>
                      <span className="font-semibold tabular-nums text-sm bg-muted px-2 py-0.5 rounded">{payments}</span>
                    </div>
                    <Slider value={[payments]} onValueChange={([v]) => handleSliderChange(setPayments)(v)} max={50} min={1} step={1} className="py-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" />Співробітників на зарплаті</Label>
                      <span className="font-semibold tabular-nums text-sm bg-muted px-2 py-0.5 rounded">{employees}</span>
                    </div>
                    <Slider value={[employees]} onValueChange={([v]) => handleSliderChange(setEmployees)(v)} max={50} min={0} step={1} className="py-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm"><UserSearch className="h-4 w-4 text-primary" />Контрагентів</Label>
                      <span className="font-semibold tabular-nums text-sm bg-muted px-2 py-0.5 rounded">{contractors}</span>
                    </div>
                    <Slider value={[contractors]} onValueChange={([v]) => handleSliderChange(setContractors)(v)} max={100} min={0} step={1} className="py-2" />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Individual Profile Cards */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Ваш сценарій декларування</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {INDIVIDUAL_PROFILES.map((profile) => {
                      const Icon = profile.icon;
                      const isActive = activeIndProfile === profile.id;
                      return (
                        <button
                          key={profile.id}
                          onClick={() => applyIndProfile(profile)}
                          className={cn(
                            "flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all duration-200 border",
                            isActive
                              ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-sm"
                              : "bg-background border-border/60 hover:border-primary/40 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("font-semibold text-xs leading-tight", isActive ? "text-primary" : "text-foreground")}>{profile.label}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground leading-tight">{profile.subtitle}</span>
                          {profile.foreignIncome && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 w-fit border-sky-400/50 text-sky-600 dark:text-sky-400">іноз.</Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Sliders */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Налаштуйте параметри</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-primary" />Джерел доходу</Label>
                      <span className="font-semibold tabular-nums text-sm bg-muted px-2 py-0.5 rounded">{incomeSources}</span>
                    </div>
                    <Slider value={[incomeSources]} onValueChange={([v]) => handleSliderChange(setIncomeSources)(v)} max={10} min={1} step={1} className="py-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm"><Home className="h-4 w-4 text-primary" />Об'єктів нерухомості в оренді</Label>
                      <span className="font-semibold tabular-nums text-sm bg-muted px-2 py-0.5 rounded">{rentalObjects}</span>
                    </div>
                    <Slider value={[rentalObjects]} onValueChange={([v]) => handleSliderChange(setRentalObjects)(v)} max={10} min={0} step={1} className="py-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-primary" />Брокерських/крипто звітів на рік</Label>
                      <span className="font-semibold tabular-nums text-sm bg-muted px-2 py-0.5 rounded">{brokerReports}</span>
                    </div>
                    <Slider value={[brokerReports]} onValueChange={([v]) => handleSliderChange(setBrokerReports)(v)} max={12} min={0} step={1} className="py-2" />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <Label className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-primary" />Іноземні доходи</Label>
                    <Switch
                      checked={foreignIncome}
                      onCheckedChange={(v) => { setForeignIncome(v); setActiveIndProfile(null); }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Results */}
          <div className="p-6 space-y-5 bg-muted/30">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">~{savings.timeSaved}</p>
                <p className="text-xs text-muted-foreground">годин на місяць</p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-border text-center">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">~{fmt(savings.moneySaved)} ₴</p>
                <p className="text-xs text-muted-foreground">гривень на місяць</p>
              </div>
            </div>

            {/* Animated bars */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Економія часу по категоріях</h4>
              {savings.bars.filter(b => b.show).map((bar) => (
                <div key={bar.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className="font-medium text-foreground">-{bar.minutes} хв <span className="text-muted-foreground text-xs">({bar.pct}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Yearly projection */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/40 dark:to-sky-950/40 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">~{fmt(savings.yearlySaved)} ₴</p>
                  <p className="text-xs text-muted-foreground">економія за рік</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{savings.roi}%</p>
                  <p className="text-xs text-muted-foreground">ROI при тарифі {savings.planNames[savings.recommendedPlan]}</p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm">
                💡 Рекомендуємо{" "}
                <Badge variant="secondary" className="mx-1">{savings.planNames[savings.recommendedPlan]}</Badge>
                — {savings.reason}
              </p>
            </div>

            {/* AI Advice */}
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={fetchAiAdvice} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? "Аналізую..." : "Отримати пораду від AI"}
              </Button>

              {aiAdvice && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-background border border-border rounded-lg text-sm text-muted-foreground leading-relaxed"
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p>{aiAdvice}</p>
                  </div>
                </motion.div>
              )}
            </div>

              <Button className="w-full" onClick={() => {
                const target = document.getElementById("pricing") || document.getElementById("tariffs");
                target?.scrollIntoView({ behavior: "smooth" });
              }}>
                Обрати рекомендований тариф
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ROICalculator;
