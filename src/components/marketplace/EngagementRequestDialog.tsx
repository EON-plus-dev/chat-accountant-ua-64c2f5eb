import { useMemo, useState } from "react";
import { Loader2, Send, Eye } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Props {
  accountantSlug: string;
  accountantName: string;
  trigger?: React.ReactNode;
}

const BUSINESS_TYPES = [
  { value: "fop", label: "ФОП" },
  { value: "tov", label: "ТОВ" },
  { value: "individual", label: "Фізособа" },
  { value: "not_registered", label: "Не зареєстрований" },
] as const;

const TAX_GROUPS = [
  "1 група ЄП",
  "2 група ЄП",
  "3 група ЄП",
  "3 група ЗС (єдиний податок зі збором)",
  "Загальна система",
] as const;

const CURRENT_STATUSES = [
  { value: "newcomer", label: "Новачок, обліку немає" },
  { value: "self", label: "Веду сам у Excel/таблицях" },
  { value: "other_accountant", label: "Зараз з іншим бухгалтером" },
  { value: "one_off", label: "Разова задача / другий погляд" },
] as const;

const INDUSTRY_HINTS = ["IT", "E-commerce", "Послуги", "Торгівля", "Фріланс"];

const SERVICES = [
  "Щомісячне ведення",
  "Декларації (ЄП/ПДФО)",
  "ЄСВ та ВЗ",
  "Кадри / зарплата",
  "ЗЕД (Wise, Deel, Payoneer)",
  "Аудит / due diligence",
  "Разова консультація",
  "Реєстрація / зміни ФОП-ТОВ",
];

const schema = z
  .object({
    name: z.string().trim().max(200).optional().or(z.literal("")),
    email: z.string().trim().email("Некоректний email").max(200).optional().or(z.literal("")),
    businessType: z.enum(["fop", "tov", "individual", "not_registered"], {
      required_error: "Оберіть тип бізнесу",
    }),
    taxGroup: z.string().max(100).optional(),
    industry: z.string().trim().min(2, "Мінімум 2 символи").max(80, "До 80 символів"),
    currentStatus: z.enum(["newcomer", "self", "other_accountant", "one_off"], {
      required_error: "Оберіть поточний стан",
    }),
    servicesNeeded: z.array(z.string()).min(1, "Оберіть хоча б 1 послугу").max(10),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((d) => d.businessType !== "fop" || (d.taxGroup && d.taxGroup.length > 0), {
    path: ["taxGroup"],
    message: "Оберіть групу / систему",
  });

type FormData = z.infer<typeof schema>;

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  CURRENT_STATUSES.map((s) => [s.value, s.label]),
);
const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  BUSINESS_TYPES.map((b) => [b.value, b.label]),
);

export const EngagementRequestDialog = ({ accountantSlug, accountantName, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Partial<FormData>>({
    name: "",
    email: "",
    industry: "",
    servicesNeeded: [],
    message: "",
  });

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const { [key as string]: _, ...rest } = e;
      return rest;
    });
  };

  const toggleService = (s: string) => {
    const cur = form.servicesNeeded ?? [];
    update(
      "servicesNeeded",
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );
  };

  const handleOpen = async (val: boolean) => {
    setOpen(val);
    if (val && !authChecked) {
      const { data } = await supabase.auth.getUser();
      setIsAuth(!!data.user);
      if (data.user) {
        setForm((f) => ({
          ...f,
          email: data.user!.email || "",
          name: (data.user!.user_metadata?.full_name as string) || "",
        }));
      }
      setAuthChecked(true);
    }
  };

  const previewLines = useMemo(() => {
    const lines: string[] = [];
    if (form.businessType) {
      const label = TYPE_LABEL[form.businessType];
      lines.push(form.taxGroup ? `${label} · ${form.taxGroup}` : label);
    }
    if (form.industry) lines.push(`Галузь: ${form.industry}`);
    if (form.currentStatus) lines.push(`Стан: ${STATUS_LABEL[form.currentStatus]}`);
    if (form.servicesNeeded?.length) lines.push(`Послуги: ${form.servicesNeeded.join(", ")}`);
    if (form.message) lines.push(`Деталі: ${form.message.slice(0, 140)}${form.message.length > 140 ? "…" : ""}`);
    return lines;
  }, [form]);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) e[String(err.path[0])] = err.message;
      });
      setErrors(e);
      toast.error("Перевірте обовʼязкові поля");
      return;
    }
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Потрібна авторизація");
        return;
      }
      const d = parsed.data;
      const { error } = await supabase.from("partner_engagement_requests").insert({
        client_user_id: userData.user.id,
        accountant_slug: accountantSlug,
        client_name: d.name || null,
        client_email: d.email || null,
        business_type: d.businessType,
        tax_group: d.businessType === "fop" ? d.taxGroup ?? null : null,
        industry: d.industry,
        current_status: d.currentStatus,
        services_needed: d.servicesNeeded,
        message: d.message || null,
      });
      if (error) throw error;
      toast.success("Бриф надіслано! Партнер відповість найближчим часом.");
      setOpen(false);
      setForm({ name: "", email: "", industry: "", servicesNeeded: [], message: "" });
    } catch (e: any) {
      toast.error(e.message || "Не вдалось надіслати запит");
    } finally {
      setLoading(false);
    }
  };

  const isFop = form.businessType === "fop";

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="lg" className="gap-1">
            <Send className="h-4 w-4" /> Запросити в кабінет
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Бриф для {accountantName}</DialogTitle>
          <DialogDescription>
            Структуровані відповіді — щоб партнер одразу розумів ваш контекст і міг точно оцінити обсяг.
            0% комісії FINTODO. Після прийняття запиту тариф автоматично отримає Reseller-знижку (−25/30/35%).
          </DialogDescription>
        </DialogHeader>

        {authChecked && !isAuth ? (
          <div className="py-4 text-sm text-muted-foreground space-y-3">
            <p>Щоб надіслати бриф партнеру, потрібно увійти у свій кабінет.</p>
            <Button asChild className="w-full">
              <Link to="/auth">Увійти або зареєструватись</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Section: про вас */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Про вас
              </h3>

              <div className="space-y-1.5">
                <Label>Тип бізнесу *</Label>
                <div className="flex flex-wrap gap-1.5">
                  {BUSINESS_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update("businessType", t.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-xs transition-colors",
                        form.businessType === t.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {errors.businessType && (
                  <p className="text-[11px] text-destructive">{errors.businessType}</p>
                )}
              </div>

              {isFop && (
                <div className="space-y-1.5">
                  <Label>Група / система *</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {TAX_GROUPS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => update("taxGroup", g)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs transition-colors",
                          form.taxGroup === g
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.taxGroup && (
                    <p className="text-[11px] text-destructive">{errors.taxGroup}</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="industry">Галузь / напрям *</Label>
                <Input
                  id="industry"
                  value={form.industry ?? ""}
                  onChange={(e) => update("industry", e.target.value)}
                  maxLength={80}
                  placeholder="Наприклад: розробка SaaS, кавʼярня, маркетплейс"
                />
                <div className="flex flex-wrap gap-1">
                  {INDUSTRY_HINTS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => update("industry", h)}
                      className="text-[11px] px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:border-primary/40"
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {errors.industry && (
                  <p className="text-[11px] text-destructive">{errors.industry}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Поточний стан *</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CURRENT_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => update("currentStatus", s.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-xs transition-colors",
                        form.currentStatus === s.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {errors.currentStatus && (
                  <p className="text-[11px] text-destructive">{errors.currentStatus}</p>
                )}
              </div>
            </section>

            {/* Section: що потрібно */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Що потрібно
              </h3>

              <div className="space-y-1.5">
                <Label>Які послуги цікавлять *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {SERVICES.map((s) => {
                    const checked = form.servicesNeeded?.includes(s) ?? false;
                    return (
                      <label
                        key={s}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors",
                          checked
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleService(s)}
                        />
                        <span>{s}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.servicesNeeded && (
                  <p className="text-[11px] text-destructive">{errors.servicesNeeded}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Деталі / уточнення</Label>
                <Textarea
                  id="message"
                  value={form.message ?? ""}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Бажані терміни, обороти, дедлайни, попередній досвід — те, що не вмістилось вище."
                  rows={3}
                  maxLength={2000}
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {(form.message ?? "").length}/2000
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email для зв'язку</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => update("email", e.target.value)}
                  maxLength={200}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email}</p>
                )}
              </div>
            </section>

            {/* Preview: що побачить бухгалтер */}
            {previewLines.length > 0 && (
              <section className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Eye className="h-3.5 w-3.5" /> Що побачить бухгалтер
                </div>
                <ul className="space-y-0.5">
                  {previewLines.map((line, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground">
                      • {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="text-[11px] text-muted-foreground italic">
              Прикріпити поточний кабінет (обороти, операції) — скоро.
            </p>
          </div>
        )}

        {authChecked && isAuth && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={submit} disabled={loading} className="gap-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Надіслати бриф
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
