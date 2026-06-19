import { useState } from "react";
import { Globe, Copy, ExternalLink, Zap, MessageSquare, Phone, Sparkles, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { SectionShell, ComingSoonNote } from "../shared/SectionShell";
import { getSettingsSectionLabel } from "@/core";
import { BookingQrDialog } from "../shared/BookingQrDialog";
import { slugForCabinet, getSalonPublicProfile } from "@/lib/publicBooking/slugMap";

export function OnlineBookingWidgetSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const defaultProfile = getSalonPublicProfile(cabinet);
  const [enabled, setEnabled] = useState(true);
  const [brandName, setBrandName] = useState(defaultProfile.brandName);
  const [tagline, setTagline] = useState(defaultProfile.tagline ?? "");
  const [slug, setSlug] = useState(slugForCabinet(cabinet.id));
  const [minIntervalMin, setMinIntervalMin] = useState(30);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(200);
  const [smsConfirm, setSmsConfirm] = useState(false);
  const [accent, setAccent] = useState(defaultProfile.accentColor ?? "#E11D48");
  const [channels, setChannels] = useState({ wizard: true, aiChat: true, aiCall: true });

  const url = `${typeof window !== "undefined" ? window.location.origin : "https://fintodo.com.ua"}/book/${slug}`;
  const brandTrimmed = brandName.trim();
  const brandError = enabled && (brandTrimmed.length < 2 || brandTrimmed.length > 60);
  const taglineError = tagline.length > 80;

  const label = getSettingsSectionLabel(cabinet, "online-booking", {
    title: "Онлайн-запис (віджет)",
    description: "Публічна сторінка для самостійного бронювання клієнтами. Інтегрується на сайт або в Instagram.",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
    >
      {/* Бренд салону */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div className="min-w-0">
              <Label className="text-sm font-medium">Бренд салону</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Цю назву бачать клієнти на публічній сторінці запису. Юридична назва ФОП залишається для документів і чеків.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-name" className="text-xs">
              Маркетингова назва <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brand-name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Напр. Beauty Lab"
              maxLength={60}
              aria-invalid={brandError || undefined}
              className={brandError ? "border-destructive" : ""}
            />
            {brandError && (
              <p className="text-[11px] text-destructive">
                Введіть назву, яку побачать клієнти (2–60 символів).
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-tagline" className="text-xs">
              Підзаголовок (опційно)
            </Label>
            <Input
              id="brand-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Напр. Перукарські, манікюр, масаж, брови"
              maxLength={80}
              aria-invalid={taglineError || undefined}
            />
            <p className="text-[11px] text-muted-foreground">
              {tagline.length}/80 — буде під назвою салону у шапці віджета.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5">
            <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Юридична назва (для документів)
              </div>
              <div className="text-xs font-medium truncate" title={cabinet.name}>
                {cabinet.name}
              </div>
            </div>
          </div>

          {/* Прев'ю шапки */}
          <div className="rounded-md border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
              Як це бачить клієнт
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center shrink-0"
                aria-hidden
              >
                <span className="text-sm font-semibold text-primary">
                  {(brandTrimmed || "··").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {brandTrimmed || "Назва салону"}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">
                  {tagline || "Салон краси · перукарські, манікюр, масаж, брови"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Активувати онлайн-запис
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Публічна форма буде доступна за посиланням.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs">Публічне посилання</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center rounded-md border bg-muted/30 overflow-hidden">
                    <span className="px-2.5 text-xs text-muted-foreground border-r bg-muted/40">
                      /book/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="h-9 border-0 bg-transparent flex-1"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    aria-label="Скопіювати"
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      toast({ title: "Скопійовано", description: url });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    aria-label="Відкрити публічну сторінку"
                    onClick={() => window.open(`/book/${slug}`, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <BookingQrDialog slug={slug} brandName={brandTrimmed || cabinet.name} />
                </div>
              </div>

              {/* Канали запису */}
              <div className="space-y-2 p-2.5 rounded-md border bg-background">
                <Label className="text-sm font-medium">Канали запису</Label>
                <p className="text-[11px] text-muted-foreground -mt-1">
                  Які режими бачитиме клієнт на публічній сторінці.
                </p>
                <div className="grid gap-1.5">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={channels.wizard}
                      onCheckedChange={(v) => setChannels((c) => ({ ...c, wizard: v }))}
                    />
                    <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                    Швидкий запис (4 кроки)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={channels.aiChat}
                      onCheckedChange={(v) => setChannels((c) => ({ ...c, aiChat: v }))}
                    />
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    AI-консʼєрж (текст)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={channels.aiCall}
                      onCheckedChange={(v) => setChannels((c) => ({ ...c, aiCall: v }))}
                    />
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Голосовий дзвінок AI
                  </label>
                </div>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Мін. інтервал бронювання, хв</Label>
                  <Input
                    type="number"
                    value={minIntervalMin}
                    onChange={(e) => setMinIntervalMin(Number(e.target.value))}
                    className="h-9 tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Колір віджета</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      className="h-9 w-12 rounded-md border bg-background cursor-pointer"
                      aria-label="Колір віджета"
                    />
                    <span className="text-xs font-mono text-muted-foreground">{accent}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-2.5 rounded-md border bg-background">
                <div className="min-w-0">
                  <Label className="text-sm font-medium">Депозит за запис</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Гарантує приїзд клієнта. Знімається при no-show.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {requireDeposit && (
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="h-8 w-20 text-right tabular-nums"
                    />
                  )}
                  <span className="text-xs text-muted-foreground">{requireDeposit ? "₴" : ""}</span>
                  <Switch checked={requireDeposit} onCheckedChange={setRequireDeposit} />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-2.5 rounded-md border bg-background">
                <div className="min-w-0">
                  <Label className="text-sm font-medium">Підтвердження SMS-кодом</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Анти-спам: код на телефон перед збереженням запису.
                  </p>
                </div>
                <Switch checked={smsConfirm} onCheckedChange={setSmsConfirm} />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t">
                <span className="text-xs text-muted-foreground">Що показувати публічно:</span>
                <Badge variant="secondary" className="text-[10px]">Усі активні послуги</Badge>
                <Badge variant="secondary" className="text-[10px]">Усі активні майстри</Badge>
                <Badge variant="secondary" className="text-[10px]">Ціни ₴</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ComingSoonNote>
        Тонке налаштування блоків віджета (приховати майстра, ціновий діапазон, заглушка фото) — у наступному релізі.
      </ComingSoonNote>
    </SectionShell>
  );
}
