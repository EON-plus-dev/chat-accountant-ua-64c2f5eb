import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Loader2, ChevronLeft, ChevronRight, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateSeoFields } from "@/admin/utils/generateSeo";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

interface AddInstitutionDialogProps {
  onAdd: (profile: FullInstitutionProfile) => void;
  existingTypes: string[];
  editProfile?: FullInstitutionProfile | null;
  onUpdate?: (profile: FullInstitutionProfile) => void;
  onOpenChange?: (open: boolean) => void;
}

type Step = "input" | "basic" | "legal" | "contacts" | "confirm";
const STEPS: Step[] = ["basic", "legal", "contacts", "confirm"];
const STEP_LABELS: Record<Step, string> = {
  input: "AI генерація",
  basic: "Основне",
  legal: "Юридичні дані",
  contacts: "Контакти",
  confirm: "Підтвердження",
};

interface FormData {
  name: string;
  shortName: string;
  legalName: string;
  slug: string;
  types: string[];
  website: string;
  logoInitials: string;
  logoColor: string;
  foundedYear: number;
  headquarters: string;
  story: string;
  employeesCount: string;
  edrpou: string;
  legalForm: string;
  legalStatus: "active" | "reorganizing" | "liquidation" | "bankrupt";
  regulators: string[];
  legalAddress: string;
  actualAddress: string;
  contactCity: string;
  contactAddress: string;
  phones: string[];
  emails: string[];
  supportPhone: string;
  is247: boolean;
  workingHours: string;
  telegram: string;
  facebook: string;
  oneLiner: string;
  shortTake: string;
  verified: boolean;
  seoTitle: string;
  seoDescription: string;
}

const emptyForm: FormData = {
  name: "", shortName: "", legalName: "", slug: "", types: [], website: "",
  logoInitials: "", logoColor: "#3B82F6", foundedYear: 2020, headquarters: "Київ",
  story: "", employeesCount: "", edrpou: "", legalForm: "ТОВ",
  legalStatus: "active", regulators: [], legalAddress: "", actualAddress: "",
  contactCity: "Київ", contactAddress: "", phones: [], emails: [],
  supportPhone: "", is247: false, workingHours: "Пн-Пт 09:00-18:00",
  telegram: "", facebook: "", oneLiner: "", shortTake: "", verified: false,
  seoTitle: "", seoDescription: "",
};

function slugify(name: string): string {
  const map: Record<string, string> = {
    а:"a",б:"b",в:"v",г:"h",ґ:"g",д:"d",е:"e",є:"ye",ж:"zh",з:"z",и:"y",і:"i",
    ї:"yi",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",
    ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ю:"yu",я:"ya",ь:"",ъ:"","'":" ",
  };
  return name.toLowerCase().split("").map(c => map[c] ?? c).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function profileToFormData(p: FullInstitutionProfile): FormData {
  return {
    name: p.name,
    shortName: p.shortName || "",
    legalName: p.legalName || "",
    slug: p.slug,
    types: [...p.types],
    website: p.website || "",
    logoInitials: p.logo.initials,
    logoColor: p.logo.color,
    foundedYear: p.company.foundedYear,
    headquarters: p.company.headquarters,
    story: p.company.story,
    employeesCount: p.company.employeesCount,
    edrpou: p.legal.edrpou,
    legalForm: p.legal.legalForm,
    legalStatus: p.legal.status as any,
    regulators: [...p.legal.regulators],
    legalAddress: p.legal.address.legal,
    actualAddress: p.legal.address.actual,
    contactCity: p.contacts.mainOffice.city,
    contactAddress: p.contacts.mainOffice.address,
    phones: [...(p.contacts.mainOffice.phone || [])],
    emails: [...(p.contacts.mainOffice.email || [])],
    supportPhone: p.contacts.support.freePhone || "",
    is247: p.contacts.support.is247,
    workingHours: p.contacts.support.workingHours || "Пн-Пт 09:00-18:00",
    telegram: p.contacts.social?.telegram || "",
    facebook: p.contacts.social?.facebook || "",
    oneLiner: p.editorial.oneLiner,
    shortTake: p.editorial.shortTake || "",
    verified: p.verified,
    seoTitle: (p as any).seoTitle || "",
    seoDescription: (p as any).seoDescription || "",
  };
}

export default function AddInstitutionDialog({ onAdd, existingTypes, editProfile, onUpdate, onOpenChange }: AddInstitutionDialogProps) {
  const isEdit = !!editProfile;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"input" | "stepper">(isEdit ? "stepper" : "input");
  const [step, setStep] = useState<Step>("basic");
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [aiInput, setAiInput] = useState({ name: "", description: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [aiFields, setAiFields] = useState<Set<string>>(new Set());

  // When editProfile changes, populate form
  useEffect(() => {
    if (editProfile) {
      setForm(profileToFormData(editProfile));
      setMode("stepper");
      setStep("basic");
      setAiFields(new Set());
      setOpen(true);
    }
  }, [editProfile]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      onOpenChange?.(false);
      reset();
    }
  };

  const update = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const reset = () => {
    setMode("input");
    setStep("basic");
    setForm({ ...emptyForm });
    setAiInput({ name: "", description: "", url: "" });
    setAiFields(new Set());
  };

  const handleAiGenerate = async () => {
    if (!aiInput.name.trim()) { toast.error("Введіть назву установи"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-institution-profile", {
        body: { name: aiInput.name, description: aiInput.description, url: aiInput.url },
      });
      if (error) throw error;
      const p = data.profile;
      const filled = new Set<string>();
      const newForm: FormData = { ...emptyForm };

      newForm.name = p.name || aiInput.name; filled.add("name");
      newForm.shortName = p.shortName || ""; if (p.shortName) filled.add("shortName");
      newForm.legalName = p.legalName || ""; if (p.legalName) filled.add("legalName");
      newForm.slug = p.slug || slugify(p.name || aiInput.name); filled.add("slug");
      newForm.types = p.types || []; if (p.types?.length) filled.add("types");
      newForm.website = p.website || aiInput.url || ""; if (p.website) filled.add("website");
      newForm.logoInitials = p.logo?.initials || ""; if (p.logo?.initials) filled.add("logoInitials");
      newForm.logoColor = p.logo?.color || "#3B82F6"; if (p.logo?.color) filled.add("logoColor");
      newForm.foundedYear = p.company?.foundedYear || 2020; if (p.company?.foundedYear) filled.add("foundedYear");
      newForm.headquarters = p.company?.headquarters || "Київ"; if (p.company?.headquarters) filled.add("headquarters");
      newForm.story = p.company?.story || ""; if (p.company?.story) filled.add("story");
      newForm.employeesCount = p.company?.employeesCount || ""; if (p.company?.employeesCount) filled.add("employeesCount");
      newForm.edrpou = p.legal?.edrpou || ""; if (p.legal?.edrpou) filled.add("edrpou");
      newForm.legalForm = p.legal?.legalForm || "ТОВ"; if (p.legal?.legalForm) filled.add("legalForm");
      newForm.legalStatus = p.legal?.status || "active"; if (p.legal?.status) filled.add("legalStatus");
      newForm.regulators = p.legal?.regulators || []; if (p.legal?.regulators?.length) filled.add("regulators");
      newForm.legalAddress = p.legal?.legalAddress || ""; if (p.legal?.legalAddress) filled.add("legalAddress");
      newForm.actualAddress = p.legal?.actualAddress || ""; if (p.legal?.actualAddress) filled.add("actualAddress");
      newForm.contactCity = p.contacts?.city || "Київ"; if (p.contacts?.city) filled.add("contactCity");
      newForm.contactAddress = p.contacts?.address || ""; if (p.contacts?.address) filled.add("contactAddress");
      newForm.phones = p.contacts?.phones || []; if (p.contacts?.phones?.length) filled.add("phones");
      newForm.emails = p.contacts?.emails || []; if (p.contacts?.emails?.length) filled.add("emails");
      newForm.supportPhone = p.contacts?.supportPhone || ""; if (p.contacts?.supportPhone) filled.add("supportPhone");
      newForm.is247 = p.contacts?.is247 || false;
      newForm.workingHours = p.contacts?.workingHours || "Пн-Пт 09:00-18:00";
      newForm.telegram = p.contacts?.telegram || ""; if (p.contacts?.telegram) filled.add("telegram");
      newForm.facebook = p.contacts?.facebook || ""; if (p.contacts?.facebook) filled.add("facebook");
      newForm.oneLiner = p.editorial?.oneLiner || ""; if (p.editorial?.oneLiner) filled.add("oneLiner");
      newForm.shortTake = p.editorial?.shortTake || ""; if (p.editorial?.shortTake) filled.add("shortTake");

      setForm(newForm);
      setAiFields(filled);
      setMode("stepper");
      setStep("basic");
      toast.success("Профіль згенеровано — перевірте дані");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Помилка генерації профілю");
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    setForm({ ...emptyForm });
    setAiFields(new Set());
    setMode("stepper");
    setStep("basic");
  };

  const handleGenerateSeo = async () => {
    setSeoLoading(true);
    try {
      const result = await generateSeoFields({
        title: form.name,
        content: [form.oneLiner, form.shortTake, form.story].filter(Boolean).join(" "),
        type: "institution",
        audience: form.types.join(", "),
      });
      update("seoTitle", result.seoTitle);
      update("seoDescription", result.seoDescription);
      toast.success("SEO-метадані згенеровано");
    } catch {
      toast.error("Не вдалося згенерувати SEO");
    } finally {
      setSeoLoading(false);
    }
  };

  const stepIdx = STEPS.indexOf(step);
  const canNext = stepIdx < STEPS.length - 1;
  const canPrev = stepIdx > 0;

  const buildProfile = (): FullInstitutionProfile => {
    const now = new Date().toISOString().slice(0, 10);
    const base = isEdit ? { ...editProfile! } : {} as any;
    const profile: FullInstitutionProfile = {
      ...base,
      id: form.slug || slugify(form.name),
      slug: form.slug || slugify(form.name),
      name: form.name,
      shortName: form.shortName || undefined,
      legalName: form.legalName || form.name,
      brandNames: [form.name],
      types: form.types.length ? form.types : ["Фінансова установа"],
      logo: { initials: form.logoInitials || form.name.slice(0, 2).toUpperCase(), color: form.logoColor },
      website: form.website || "",
      verified: form.verified,
      verifiedDate: form.verified ? (base.verifiedDate || now) : "",
      dataLastUpdated: now,
      legal: {
        ...(base.legal || {}),
        edrpou: form.edrpou, legalForm: form.legalForm,
        registrationNumber: base.legal?.registrationNumber || "",
        registrationDate: base.legal?.registrationDate || "",
        registrationOrgan: base.legal?.registrationOrgan || "",
        address: { legal: form.legalAddress, actual: form.actualAddress || form.legalAddress },
        regulators: form.regulators,
        licenses: base.legal?.licenses || [],
        certifications: base.legal?.certifications || [],
        taxStatus: base.legal?.taxStatus || "Платник податків на загальних підставах",
        status: form.legalStatus,
      },
      company: {
        ...(base.company || {}),
        foundedYear: form.foundedYear, foundedCity: form.headquarters,
        story: form.story || `${form.name} — українська фінансова установа.`,
        headquarters: form.headquarters, employeesCount: form.employeesCount || "Н/Д",
        publiclyTraded: base.company?.publiclyTraded || false,
        keyPeople: base.company?.keyPeople || [],
        milestones: base.company?.milestones || [],
      },
      contacts: {
        mainOffice: {
          address: form.contactAddress, city: form.contactCity,
          country: "Україна", phone: form.phones, email: form.emails,
        },
        support: {
          freePhone: form.supportPhone, is247: form.is247,
          workingHours: form.workingHours,
        },
        social: { telegram: form.telegram, facebook: form.facebook },
      },
      branches: base.branches || { totalCount: 0, coverageNote: "", regions: [], branchList: [] },
      platforms: base.platforms || {
        web: { available: !!form.website },
        ios: { available: false }, android: { available: false },
        api: { available: false },
      },
      security: base.security || { certifications: [], features: [], dataStorage: "Україна" },
      integrations: base.integrations || [],
      products: base.products || [],
      ratings: base.ratings || {
        fintodo: {
          overall: 0, rank: 0, categorySlug: "", categoryName: "",
          parentCategorySlug: "", parentCategoryName: "", reviewDate: now,
        },
        external: [],
      },
      editorial: {
        ...(base.editorial || {}),
        oneLiner: form.oneLiner || form.name,
        shortTake: form.shortTake || "",
        fullVerdict: base.editorial?.fullVerdict || "",
        bestFor: base.editorial?.bestFor || [],
        notFor: base.editorial?.notFor || [],
        methodology: base.editorial?.methodology || {
          approach: "", testingPeriod: "", testedBy: "Fintodo",
          hoursSpent: 0, keyFindings: [],
        },
        scores: base.editorial?.scores || [],
        totalFormula: base.editorial?.totalFormula || "",
        totalScore: base.editorial?.totalScore || 0,
        independenceStatement: base.editorial?.independenceStatement || "Незалежна редакційна оцінка",
      },
      reviewThemes: base.reviewThemes || [],
      reviewSourcesNote: base.reviewSourcesNote || "",
      comparisons: base.comparisons || [],
      news: base.news || [],
      changelog: base.changelog || [],
      awards: base.awards || [],
      partnerships: base.partnerships || [],
      compliance: base.compliance || {
        aml: false, gdpr: false, nbu: false, dps: false, dia: false,
        pep: false, sanctions: false, openBanking: false, reportingFormats: [],
      },
      warPeriod: base.warPeriod || {
        operationalStatus: "Працює", reliabilityDuringBlackouts: "",
        dataBackupNote: "", businessContinuityPlan: "", warNote: "",
      },
      faq: base.faq || [],
      knownIssues: base.knownIssues || [],
      cta: base.cta || { primary: { label: "Перейти на сайт", href: form.website || "#", isInternal: false } },
    };
    // Attach SEO fields
    (profile as any).seoTitle = form.seoTitle;
    (profile as any).seoDescription = form.seoDescription;
    return profile;
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Назва обов'язкова"); return; }
    const profile = buildProfile();
    if (isEdit && onUpdate) {
      onUpdate(profile);
      toast.success(`Профіль «${form.name}» оновлено`);
    } else {
      onAdd(profile);
      toast.success(`Установу «${form.name}» додано`);
    }
    handleOpenChange(false);
  };

  const AiBadge = ({ field }: { field: string }) =>
    aiFields.has(field) ? <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-1">AI</Badge> : null;

  const renderInput = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2 pb-2">
        <Sparkles className="h-8 w-8 text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Введіть назву установи — AI заповнить форму автоматично</p>
      </div>
      <div className="space-y-2">
        <Label>Назва установи *</Label>
        <Input value={aiInput.name} onChange={e => setAiInput(p => ({ ...p, name: e.target.value }))}
          placeholder="Наприклад: ПриватБанк" />
      </div>
      <div className="space-y-2">
        <Label>Опис / додаткова інформація</Label>
        <Textarea value={aiInput.description} onChange={e => setAiInput(p => ({ ...p, description: e.target.value }))}
          placeholder="Найбільший банк України, спеціалізується на..." rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Вебсайт</Label>
        <Input value={aiInput.url} onChange={e => setAiInput(p => ({ ...p, url: e.target.value }))}
          placeholder="https://..." />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAiGenerate} disabled={loading || !aiInput.name.trim()} className="flex-1 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Генерація..." : "Згенерувати AI"}
        </Button>
        <Button variant="outline" onClick={handleManual}>Вручну</Button>
      </div>
    </div>
  );

  const renderBasic = () => (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Назва *<AiBadge field="name" /></Label>
        <Input value={form.name} onChange={e => { update("name", e.target.value); if (!aiFields.has("slug")) update("slug", slugify(e.target.value)); }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Slug<AiBadge field="slug" /></Label>
          <Input value={form.slug} onChange={e => update("slug", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Вебсайт<AiBadge field="website" /></Label>
          <Input value={form.website} onChange={e => update("website", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Типи послуг<AiBadge field="types" /></Label>
        <Textarea value={form.types.join("\n")} onChange={e => update("types", e.target.value.split("\n").filter(Boolean))}
          rows={2} placeholder="По одному на рядок" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Ініціали<AiBadge field="logoInitials" /></Label>
          <Input value={form.logoInitials} onChange={e => update("logoInitials", e.target.value)} maxLength={3} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Колір</Label>
          <div className="flex gap-1.5">
            <input type="color" value={form.logoColor} onChange={e => update("logoColor", e.target.value)}
              className="w-9 h-9 rounded border cursor-pointer" />
            <Input value={form.logoColor} onChange={e => update("logoColor", e.target.value)} className="flex-1" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Рік<AiBadge field="foundedYear" /></Label>
          <Input type="number" value={form.foundedYear} onChange={e => update("foundedYear", +e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Штаб-квартира<AiBadge field="headquarters" /></Label>
          <Input value={form.headquarters} onChange={e => update("headquarters", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">К-сть працівників<AiBadge field="employeesCount" /></Label>
          <Input value={form.employeesCount} onChange={e => update("employeesCount", e.target.value)} placeholder="~500" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Опис<AiBadge field="oneLiner" /></Label>
        <Input value={form.oneLiner} onChange={e => update("oneLiner", e.target.value)} placeholder="Коротко про установу" />
      </div>
    </div>
  );

  const renderLegal = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">ЄДРПОУ *<AiBadge field="edrpou" /></Label>
          <Input value={form.edrpou} onChange={e => update("edrpou", e.target.value)} maxLength={8} placeholder="12345678" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Орг.-правова форма<AiBadge field="legalForm" /></Label>
          <Input value={form.legalForm} onChange={e => update("legalForm", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Юридична назва<AiBadge field="legalName" /></Label>
        <Input value={form.legalName} onChange={e => update("legalName", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Статус</Label>
        <Select value={form.legalStatus} onValueChange={v => update("legalStatus", v as any)}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Активна</SelectItem>
            <SelectItem value="reorganizing">Реорганізація</SelectItem>
            <SelectItem value="liquidation">Ліквідація</SelectItem>
            <SelectItem value="bankrupt">Банкрут</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Юридична адреса<AiBadge field="legalAddress" /></Label>
        <Input value={form.legalAddress} onChange={e => update("legalAddress", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Фактична адреса<AiBadge field="actualAddress" /></Label>
        <Input value={form.actualAddress} onChange={e => update("actualAddress", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Регулятори<AiBadge field="regulators" /></Label>
        <Textarea value={form.regulators.join("\n")} onChange={e => update("regulators", e.target.value.split("\n").filter(Boolean))}
          rows={2} placeholder="По одному на рядок (НБУ, НКЦПФР...)" />
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Місто<AiBadge field="contactCity" /></Label>
          <Input value={form.contactCity} onChange={e => update("contactCity", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Адреса<AiBadge field="contactAddress" /></Label>
          <Input value={form.contactAddress} onChange={e => update("contactAddress", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Телефони<AiBadge field="phones" /></Label>
        <Textarea value={form.phones.join("\n")} onChange={e => update("phones", e.target.value.split("\n").filter(Boolean))}
          rows={2} placeholder="По одному на рядок" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Email<AiBadge field="emails" /></Label>
        <Textarea value={form.emails.join("\n")} onChange={e => update("emails", e.target.value.split("\n").filter(Boolean))}
          rows={2} placeholder="По одному на рядок" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Гаряча лінія<AiBadge field="supportPhone" /></Label>
          <Input value={form.supportPhone} onChange={e => update("supportPhone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Графік роботи</Label>
          <Input value={form.workingHours} onChange={e => update("workingHours", e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is247} onCheckedChange={v => update("is247", v)} />
        <Label className="text-xs">Підтримка 24/7</Label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Telegram<AiBadge field="telegram" /></Label>
          <Input value={form.telegram} onChange={e => update("telegram", e.target.value)} placeholder="@channel" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Facebook<AiBadge field="facebook" /></Label>
          <Input value={form.facebook} onChange={e => update("facebook", e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderConfirm = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
        <div className="w-10 h-10 rounded flex items-center justify-center text-sm font-bold text-primary-foreground"
          style={{ backgroundColor: form.logoColor }}>
          {form.logoInitials || form.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-foreground">{form.name || "Без назви"}</p>
          <p className="text-xs text-muted-foreground">{form.types.join(", ") || "Тип не вказано"} · {form.headquarters}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground">ЄДРПОУ:</span><span className="text-foreground">{form.edrpou || "—"}</span>
        <span className="text-muted-foreground">Рік заснування:</span><span className="text-foreground">{form.foundedYear}</span>
        <span className="text-muted-foreground">Статус:</span><span className="text-foreground">{form.legalStatus}</span>
        <span className="text-muted-foreground">Телефони:</span><span className="text-foreground">{form.phones.length || "—"}</span>
        <span className="text-muted-foreground">Email:</span><span className="text-foreground">{form.emails.length || "—"}</span>
        <span className="text-muted-foreground">Вебсайт:</span><span className="text-foreground truncate">{form.website || "—"}</span>
      </div>

      {/* SEO Section */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">SEO-метадані</Label>
          <Button variant="outline" size="sm" onClick={handleGenerateSeo} disabled={seoLoading} className="gap-1.5 text-xs">
            {seoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Згенерувати SEO
          </Button>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">SEO Title</Label>
            <span className={`text-[10px] ${form.seoTitle.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>
              {form.seoTitle.length}/60
            </span>
          </div>
          <Input value={form.seoTitle} onChange={e => update("seoTitle", e.target.value)}
            placeholder="SEO заголовок сторінки" maxLength={70} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Meta Description</Label>
            <span className={`text-[10px] ${form.seoDescription.length > 155 ? "text-destructive" : "text-muted-foreground"}`}>
              {form.seoDescription.length}/155
            </span>
          </div>
          <Textarea value={form.seoDescription} onChange={e => update("seoDescription", e.target.value)}
            placeholder="Опис для пошукових систем" rows={2} maxLength={170} />
        </div>
        {!form.seoTitle && !form.seoDescription && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            SEO-поля порожні — рекомендуємо згенерувати або заповнити вручну
          </div>
        )}
      </div>

      {aiFields.size > 0 && (
        <p className="text-xs text-muted-foreground">
          <Sparkles className="inline h-3 w-3 mr-1" />{aiFields.size} полів заповнено AI — решта можна додати пізніше
        </p>
      )}
      <div className="flex items-center gap-2 pt-2">
        <Switch checked={form.verified} onCheckedChange={v => update("verified", v)} />
        <Label className="text-xs">Верифікований профіль</Label>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Додати установу
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редагувати установу" : mode === "input" ? "Додати установу" : STEP_LABELS[step]}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? `Редагування: ${editProfile?.name}` : mode === "input" ? "AI або ручне створення профілю" : `Крок ${stepIdx + 1} з ${STEPS.length}`}
          </DialogDescription>
        </DialogHeader>

        {mode === "stepper" && (
          <div className="flex gap-1 mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        )}

        {mode === "input" && renderInput()}
        {mode === "stepper" && step === "basic" && renderBasic()}
        {mode === "stepper" && step === "legal" && renderLegal()}
        {mode === "stepper" && step === "contacts" && renderContacts()}
        {mode === "stepper" && step === "confirm" && renderConfirm()}

        {mode === "stepper" && (
          <DialogFooter className="gap-2 sm:gap-0">
            {canPrev ? (
              <Button variant="outline" size="sm" onClick={() => setStep(STEPS[stepIdx - 1])} className="gap-1">
                <ChevronLeft className="h-3.5 w-3.5" />Назад
              </Button>
            ) : !isEdit ? (
              <Button variant="ghost" size="sm" onClick={() => setMode("input")}>
                <ChevronLeft className="h-3.5 w-3.5" />AI
              </Button>
            ) : (
              <div />
            )}
            {canNext ? (
              <Button size="sm" onClick={() => setStep(STEPS[stepIdx + 1])} className="gap-1">
                Далі<ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} className="gap-1">
                <Check className="h-3.5 w-3.5" />{isEdit ? "Зберегти" : "Створити"}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}