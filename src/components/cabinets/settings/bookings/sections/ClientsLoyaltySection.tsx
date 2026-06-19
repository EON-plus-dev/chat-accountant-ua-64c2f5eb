/**
 * ClientsLoyaltySection — політики клієнтського хабу.
 *
 * Оперативні дані (лічильники сегментів, картки) переїхали в
 * Операції → «Клієнти». Тут лишаються лише ПРАВИЛА:
 *   1) RFM-сегменти (пороги)
 *   2) Обовʼязкові поля картки
 *   3) Бонусна система
 *   4) Ранги лояльності
 *   5) No-show політика (винесена окремо)
 *   6) GDPR & Communications (per-channel consent, quiet-hours, retention)
 *   7) CRM-синхронізація (deep-link)
 */

import { useState } from "react";
import { Heart, Gift, AlertCircle, Star, Shield, Trash2, Plus, ChevronRight, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { SectionShell } from "../shared/SectionShell";
import { getSettingsSectionLabel } from "@/core";

interface LoyaltyTier {
  id: string;
  name: string;
  ltvThreshold: number;
  cashbackMultiplier: number;
  privileges: string[];
}

const DEFAULT_TIERS: LoyaltyTier[] = [
  { id: "bronze", name: "Bronze", ltvThreshold: 0, cashbackMultiplier: 1, privileges: ["Базовий кешбек"] },
  { id: "silver", name: "Silver", ltvThreshold: 5000, cashbackMultiplier: 1.5, privileges: ["Безкоштовний перенос запису", "+1 пріоритетний слот/міс"] },
  { id: "gold", name: "Gold", ltvThreshold: 15000, cashbackMultiplier: 2, privileges: ["Пріоритет у вікнах VIP-майстра", "Особистий менеджер", "Поза-чергові слоти"] },
];

export function ClientsLoyaltySection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  // Capability switch
  const [crmEnabled, setCrmEnabled] = useState(true);

  // RFM
  const [vipMinVisits, setVipMinVisits] = useState(10);
  const [vipMinLtv, setVipMinLtv] = useState(8000);
  const [newDays, setNewDays] = useState(30);
  const [loyalMinFreq, setLoyalMinFreq] = useState(5);
  const [sleepDays, setSleepDays] = useState(60);
  const [autoRecalc, setAutoRecalc] = useState(true);

  // Card mandatory fields
  const [reqFields, setReqFields] = useState({
    fullName: true,
    phone: true,
    email: false,
    birthDate: true,
    allergies: true,
    gdpr: true,
  });

  // Bonus
  const [cashback, setCashback] = useState(true);
  const [cashbackPct, setCashbackPct] = useState(3);
  const [birthdayBonus, setBirthdayBonus] = useState(true);
  const [bonusExpiryMonths, setBonusExpiryMonths] = useState(12);
  const [minRedeem, setMinRedeem] = useState(100);

  // Tiers
  const [tiers, setTiers] = useState<LoyaltyTier[]>(DEFAULT_TIERS);

  // No-show policy
  const [noShowThreshold, setNoShowThreshold] = useState(3);
  const [autoBlacklist, setAutoBlacklist] = useState(true);
  const [depositAfter, setDepositAfter] = useState(2);
  const [banDays, setBanDays] = useState(90);

  // GDPR & comms
  const [defaultMarketingConsent, setDefaultMarketingConsent] = useState({
    sms: false,
    viber: false,
    telegram: false,
    email: false,
  });
  const [quietFrom, setQuietFrom] = useState("21:00");
  const [quietTo, setQuietTo] = useState("10:00");
  const [retentionDays, setRetentionDays] = useState(1095);
  const [lawfulBasis, setLawfulBasis] = useState<"contract" | "consent" | "legitimate">("contract");

  const label = getSettingsSectionLabel(cabinet, "clients", {
    title: "Клієнти й програма лояльності",
    description: "Правила сегментації, лояльності, no-show, GDPR та зʼєднання з зовнішньою CRM. Список клієнтів і операції — у розділі Управління → «Клієнти».",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
    >
      {/* 1. Capability switch */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <Label className="text-sm font-medium">Модуль «Клієнти»</Label>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Вмикає підрозділ «Клієнти» в Операціях. Необхідний для RFM-сегментації, бонусів, CRM-синхронізації.
              </p>
            </div>
            <Switch checked={crmEnabled} onCheckedChange={setCrmEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* 2. RFM segments */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-medium">RFM-сегменти (пороги)</h4>
            <Badge variant="outline" className="text-[9px]">авто-перерахунок</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Розраховується деривативно з історії бронювань (Recency / Frequency / Monetary). Пороги ви можете адаптувати під свій салон.
          </p>
          <NumRow label="VIP / Champions: мінімум візитів" value={vipMinVisits} onChange={setVipMinVisits} suffix="візитів" />
          <NumRow label="VIP / Champions: АБО LTV ≥" value={vipMinLtv} onChange={setVipMinLtv} suffix="₴" />
          <NumRow label="Новий клієнт: вікно (днів від першого візиту)" value={newDays} onChange={setNewDays} suffix="днів" />
          <NumRow label="Лояльний: мінімум візитів за рік" value={loyalMinFreq} onChange={setLoyalMinFreq} suffix="візитів" />
          <NumRow label="Сплячий: останній візит ≥" value={sleepDays} onChange={setSleepDays} suffix="днів" />
          <div className="flex items-center justify-between text-sm pt-1">
            <Label className="text-xs text-muted-foreground">Авто-перерахунок щодня о 03:00</Label>
            <Switch checked={autoRecalc} onCheckedChange={setAutoRecalc} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Required fields */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-600" />
            <h4 className="text-sm font-medium">Картка клієнта — обовʼязкові поля</h4>
          </div>
          {(Object.keys(reqFields) as Array<keyof typeof reqFields>).map((k) => (
            <div key={k} className="flex items-center justify-between gap-2 text-sm">
              <Label className="text-sm font-normal cursor-pointer" onClick={() => setReqFields((p) => ({ ...p, [k]: !p[k] }))}>
                {FIELD_LABELS[k]}
              </Label>
              <Checkbox
                checked={reqFields[k]}
                onCheckedChange={(v) => setReqFields((p) => ({ ...p, [k]: !!v }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Bonus */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-medium">Бонусна система</h4>
          </div>
          <ToggleRow
            label="Кешбек на бонусний рахунок"
            hint="Накопичується від суми кожного візиту. Списується на наступну послугу (не на чай майстру)."
            checked={cashback}
            onCheckedChange={setCashback}
            extra={
              cashback && (
                <NumInline value={cashbackPct} onChange={setCashbackPct} suffix="%" />
              )
            }
          />
          <ToggleRow
            label="Бонус на день народження"
            hint="−20% на будь-яку послугу протягом тижня з дати ДН."
            checked={birthdayBonus}
            onCheckedChange={setBirthdayBonus}
          />
          <NumRow label="Згоряння бонусів через" value={bonusExpiryMonths} onChange={setBonusExpiryMonths} suffix="міс" />
          <NumRow label="Мінімальний баланс для списання" value={minRedeem} onChange={setMinRedeem} suffix="₴" />
        </CardContent>
      </Card>

      {/* 5. Loyalty tiers */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-medium">Ранги лояльності</h4>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => toast({ title: "Демо-режим", description: "Додавання нових рангів — у повній версії." })}>
              <Plus className="w-3 h-3" /> Додати ранг
            </Button>
          </div>
          <div className="rounded-md border bg-card divide-y text-sm">
            {tiers.map((t) => (
              <div key={t.id} className="px-3 py-2 flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] font-medium uppercase">{t.name}</Badge>
                <div className="text-xs text-muted-foreground flex-1">
                  ≥ {t.ltvThreshold.toLocaleString("uk-UA")} ₴ LTV · кешбек ×{t.cashbackMultiplier} · {t.privileges.length} privileges
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast({ title: "Демо-режим", description: "Редагування рангів — у повній версії." })}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. No-show policy */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <h4 className="text-sm font-medium">Політика no-show</h4>
          </div>
          <NumRow label="Поріг no-show перед діями" value={noShowThreshold} onChange={setNoShowThreshold} suffix="разів" />
          <ToggleRow
            label="Авто-blacklist при перевищенні порогу"
            hint="Клієнт автоматично потрапляє у чорний список."
            checked={autoBlacklist}
            onCheckedChange={setAutoBlacklist}
          />
          <NumRow label="Депозит обовʼязковий після" value={depositAfter} onChange={setDepositAfter} suffix="no-show" />
          <NumRow label="Тривалість бану (днів, далі — авто-розбан)" value={banDays} onChange={setBanDays} suffix="днів" />
        </CardContent>
      </Card>

      {/* 7. GDPR & Comms */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-600" />
            <h4 className="text-sm font-medium">GDPR і комунікації</h4>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Marketing-згода за замовчуванням (per-channel)</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {(Object.keys(defaultMarketingConsent) as Array<keyof typeof defaultMarketingConsent>).map((ch) => (
                <div key={ch} className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-1.5">
                  <Label className="text-xs uppercase tracking-wide cursor-pointer" onClick={() => setDefaultMarketingConsent((p) => ({ ...p, [ch]: !p[ch] }))}>
                    {ch}
                  </Label>
                  <Switch
                    checked={defaultMarketingConsent[ch]}
                    onCheckedChange={(v) => setDefaultMarketingConsent((p) => ({ ...p, [ch]: v }))}
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Transactional-повідомлення (нагадування, підтвердження) надсилаються незалежно від цього налаштування.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Тиха година з</Label>
              <Input value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)} className="h-8 text-sm tabular-nums" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">до</Label>
              <Input value={quietTo} onChange={(e) => setQuietTo(e.target.value)} className="h-8 text-sm tabular-nums" />
            </div>
          </div>

          <NumRow label="Збереження даних (днів, мін. 1095 за податковим обліком)" value={retentionDays} onChange={setRetentionDays} suffix="днів" />

          <div>
            <Label className="text-xs text-muted-foreground">Правова підстава обробки даних</Label>
            <Select value={lawfulBasis} onValueChange={(v) => setLawfulBasis(v as typeof lawfulBasis)}>
              <SelectTrigger className="h-8 text-sm mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract" className="text-sm">Виконання договору (Art. 6.1.b)</SelectItem>
                <SelectItem value="consent" className="text-sm">Згода клієнта (Art. 6.1.a)</SelectItem>
                <SelectItem value="legitimate" className="text-sm">Легітимний інтерес (Art. 6.1.f)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast({ title: "Шаблон згенеровано (демо)", description: "JSON-експорт даних клієнта — Art. 15 GDPR." })}>
              <Shield className="w-3.5 h-3.5" /> Експорт даних клієнта
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast({ title: "Шаблон згенеровано (демо)", description: "Анонімізація замість delete — bookings зберігаються для податкового обліку." })}>
              <Trash2 className="w-3.5 h-3.5" /> Право бути забутим
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 8. CRM-sync link */}
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="p-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">CRM-синхронізація</h4>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Подвійна синхронізація з Altegio, KeyCRM, Bitrix24, amoCRM, HubSpot — налаштовується у блоці «Інтеграції салону».
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => toast({ title: "Перехід у «Інтеграції салону»", description: "Скористайтеся лівим меню секції." })}>
            Налаштувати <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

// ─────────────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  fullName: "ПІБ",
  phone: "Телефон",
  email: "Email",
  birthDate: "Дата народження",
  allergies: "Алергії / протипоказання (обовʼязково для масажу і SPA)",
  gdpr: "GDPR-згода на обробку даних",
};

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
  extra,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-2.5 rounded-md border bg-background">
      <div className="min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {extra}
        <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
      </div>
    </div>
  );
}

function NumRow({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-normal flex-1">{label}</Label>
      <div className="flex items-center gap-1.5 shrink-0">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 w-20 text-center tabular-nums"
        />
        <span className="text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function NumInline({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-16 text-center tabular-nums"
      />
      <span className="text-sm text-muted-foreground">{suffix}</span>
    </div>
  );
}
