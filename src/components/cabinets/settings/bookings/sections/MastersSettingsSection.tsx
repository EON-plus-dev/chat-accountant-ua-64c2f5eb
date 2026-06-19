/**
 * MastersSettingsSection — CRUD майстрів і ставок.
 * Single source of truth для майстрів; модуль «Бронювання → Майстри» стає read-only.
 *
 * Окрім базових полів картки показує:
 *   • статус і тип активної делегації (`getActiveDelegationByMasterId`)
 *   • публічні поля профілю (rating, відгуки, бейджі)
 *   • CTA «Профіль» (drill `salon-master`) та «Договір» (Sheet з `ContractPreview`).
 */

import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Users,
  Briefcase,
  Building2,
  Trash2,
  Eye,
  FileSignature,
  Star,
  AtSign,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import {
  type SalonMaster,
  type ServiceCategory,
  type MasterType,
} from "@/config/demoCabinets/salonData";
import { getBookableContext } from "@/core";
import { getVerticalPack } from "@/core";
import {
  getActiveDelegationByMasterId,
  getInvitationsForSalon,
} from "@/config/demoCabinets/salonMasterDelegations";
import { SectionShell } from "../shared/SectionShell";
import { ContractPreview } from "./_ContractPreview";
import {
  BADGE_META,
  getDelegationTerms,
  getShortContractKind,
} from "@/lib/salonMasterContract";

const MASTER_COLOR_PALETTE = ["#E11D48", "#7C3AED", "#0891B2", "#DB2777", "#059669", "#D97706", "#2563EB", "#9333EA"];

const WEEKDAYS = [
  { v: 1, l: "Пн" }, { v: 2, l: "Вт" }, { v: 3, l: "Ср" },
  { v: 4, l: "Чт" }, { v: 5, l: "Пт" }, { v: 6, l: "Сб" }, { v: 0, l: "Нд" },
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const CATEGORY_LABEL: Partial<Record<ServiceCategory, string>> = {
  hair: "Перукарські",
  nails: "Манікюр",
  massage: "Масаж",
  spa: "SPA",
  brows: "Брови",
  training: "Індивідуальні тренування",
  group_class: "Групові",
  court_rent: "Оренда корту",
  rental: "Прокат",
};

interface Props {
  cabinet: Cabinet;
  /** Перемикнути верхній sub-nav на розділ «Делегації майстрів». */
  onNavigateToDelegations?: () => void;
}

export function MastersSettingsSection({ cabinet, onNavigateToDelegations }: Props) {
  const { toast } = useToast();
  const drill = useDrillStack();
  const pack = getVerticalPack(cabinet);
  const isTennis = pack.id === "tennis_club";
  const ctx = useMemo(() => getBookableContext(cabinet.id), [cabinet.id]);
  const salonWorkstations = ctx.workstations;
  const [items, setItems] = useState<SalonMaster[]>(ctx.masters);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SalonMaster | null>(null);
  const [previewMasterId, setPreviewMasterId] = useState<string | null>(null);
  const openItem = items.find((i) => i.id === openId) ?? null;
  const activeItem = draft ?? openItem;
  const isNew = draft !== null;

  const staffCount = items.filter((m) => m.type === "staff").length;
  const fopCount = items.filter((m) => m.type === "fop").length;

  const invitations = getInvitationsForSalon(cabinet.id);
  const previewContract = previewMasterId
    ? getActiveDelegationByMasterId(previewMasterId)
    : null;

  const closeSheet = () => { setOpenId(null); setDraft(null); };

  const handleAdd = () => {
    setOpenId(null);
    setDraft({
      id: `m-${Date.now()}`,
      fullName: "",
      shortName: "",
      type: "staff",
      specialties: [],
      commissionPct: 40,
      schedule: { workDays: [1, 2, 3, 4, 5], startHour: 9, endHour: 19 },
      color: MASTER_COLOR_PALETTE[items.length % MASTER_COLOR_PALETTE.length],
      avatarInitials: "",
      preferredWorkstationIds: [],
    });
  };

  const handleCreate = () => {
    if (!draft) return;
    if (draft.fullName.trim().length < 3 || draft.specialties.length === 0) return;
    const finalDraft: SalonMaster = {
      ...draft,
      shortName: draft.shortName.trim() || draft.fullName.trim().split(/\s+/)[0],
      avatarInitials: draft.avatarInitials || initialsFromName(draft.fullName),
    };
    setItems((prev) => [...prev, finalDraft]);
    toast({ title: `${pack.labels.staffSingular}а додано`, description: finalDraft.fullName });
    closeSheet();
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    toast({ title: `${pack.labels.staffSingular}а видалено` });
    closeSheet();
  };

  return (
    <SectionShell
      title={`${pack.labels.staffPlural} і ставки`}
      description={
        isTennis
          ? "Картки команди клубу: тип трудових відносин (штат / ФОП), активний договір (делегація), комісія за замовч., індивідуальні ставки і постійні корти."
          : "Картки команди салону: тип трудових відносин, активний договір (делегація), комісія за замовч., індивідуальні ставки і постійне робоче місце."
      }
      actions={
        <Button size="sm" className="gap-1.5" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          Додати {pack.labels.staffSingular.toLowerCase()}а
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <MiniStat label="Усього" value={items.length} icon={Users} />
        <MiniStat label="Штатні" value={staffCount} icon={Building2} />
        <MiniStat label={isTennis ? "ФОП-тренери" : "ФОП-орендарі"} value={fopCount} icon={Briefcase} />
        <MiniStat
          label="Сер. комісія"
          value={`${items.length ? Math.round(items.reduce((s, m) => s + m.commissionPct, 0) / items.length) : 0}%`}
          icon={Users}
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2">Майстер</th>
              <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Спеціалізація</th>
              <th className="text-left font-medium px-3 py-2 hidden md:table-cell">Тип</th>
              <th className="text-left font-medium px-3 py-2 hidden md:table-cell">Договір</th>
              <th className="text-right font-medium px-3 py-2">%</th>
              <th className="text-left font-medium px-3 py-2 hidden xl:table-cell">Постійне місце</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((m) => {
              const primaryWsId = m.preferredWorkstationIds?.[0];
              const primaryWs = salonWorkstations.find((w) => w.id === primaryWsId);
              const delegation = getActiveDelegationByMasterId(m.id);
              const isInvited = !delegation && invitations.some((i) => i.masterId === m.id);
              const visibleBadges = (m.badges ?? []).slice(0, 3);
              return (
                <tr key={m.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{m.fullName}</div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {m.publicTitle && (
                            <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              {m.publicTitle}
                            </span>
                          )}
                          {m.rating != null && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] tabular-nums text-muted-foreground">
                              <Star className="w-3 h-3 fill-warning text-warning" />
                              <span className="font-medium text-foreground">{m.rating.toFixed(1)}</span>
                              {m.reviewsCount != null && (
                                <span>· {m.reviewsCount}</span>
                              )}
                            </span>
                          )}
                          {m.instagramHandle && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground truncate max-w-[120px]">
                              <AtSign className="w-3 h-3" />
                              {m.instagramHandle}
                            </span>
                          )}
                        </div>
                        {visibleBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {visibleBadges.map((b) => {
                              const meta = BADGE_META[b];
                              if (!meta) return null;
                              const Icon = meta.icon;
                              return (
                                <span
                                  key={b}
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium",
                                    meta.tone,
                                  )}
                                >
                                  <Icon className="w-2.5 h-2.5" />
                                  {meta.label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {m.specialties.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] font-normal h-5">
                          {CATEGORY_LABEL[s]}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium",
                        m.type === "staff"
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                          : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
                      )}
                    >
                      {m.type === "staff" ? "Штатний" : "ФОП"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <ContractCell
                      delegation={delegation}
                      isInvited={isInvited}
                      onOpenPreview={() => setPreviewMasterId(m.id)}
                    />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">{m.commissionPct}%</td>
                  <td className="px-3 py-2 text-muted-foreground hidden xl:table-cell text-xs">
                    {primaryWs?.name ?? "—"}
                  </td>
                  <td className="px-1 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          drill.push({ kind: "salon-master", id: m.id, displayName: m.fullName })
                        }
                        aria-label="Профіль майстра"
                        title="Профіль майстра"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setPreviewMasterId(m.id)}
                        disabled={!delegation}
                        aria-label="Переглянути договір"
                        title={delegation ? "Переглянути договір" : "Без активного договору"}
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => { setDraft(null); setOpenId(m.id); }}
                        aria-label="Редагувати"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editor sheet */}
      <Sheet open={activeItem !== null} onOpenChange={(o) => !o && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {activeItem && (
            <MasterEditor
              master={activeItem}
              isNew={isNew}
              cabinetId={cabinet.id}
              workstations={salonWorkstations}
              onPatch={(patch) => {
                if (isNew) setDraft((p) => (p ? { ...p, ...patch } : p));
                else setItems((prev) => prev.map((it) => (it.id === activeItem.id ? { ...it, ...patch } : it)));
              }}
              onCreate={handleCreate}
              onCancel={closeSheet}
              onDelete={() => handleDelete(activeItem.id)}
              onOpenProfile={() =>
                drill.push({ kind: "salon-master", id: activeItem.id, displayName: activeItem.fullName })
              }
              onOpenContract={() => setPreviewMasterId(activeItem.id)}
              onGoToDelegations={onNavigateToDelegations}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Contract preview sheet (shared) */}
      <Sheet open={previewContract !== null} onOpenChange={(o) => !o && setPreviewMasterId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {previewContract && <ContractPreview contract={previewContract} />}
        </SheetContent>
      </Sheet>
    </SectionShell>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardContent className="p-2.5 flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-sm font-semibold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractCell({
  delegation,
  isInvited,
  onOpenPreview,
}: {
  delegation: ReturnType<typeof getActiveDelegationByMasterId>;
  isInvited: boolean;
  onOpenPreview: () => void;
}) {
  if (!delegation) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-medium",
            isInvited
              ? "border-warning/40 bg-warning/10 text-warning-foreground"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {isInvited ? "Очікує реєстрації" : "Без договору"}
        </Badge>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpenPreview}
      className="text-left group inline-flex flex-col gap-0.5 hover:text-primary transition-colors"
      title="Відкрити текст договору"
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium">{getShortContractKind(delegation)}</span>
        <Badge variant="outline" className="text-[10px]">№ {delegation.contract_number}</Badge>
        {delegation.signed_at && (
          <Badge
            variant="outline"
            className="text-[10px] border-success/30 bg-success/10 text-success gap-1"
          >
            <ShieldCheck className="w-2.5 h-2.5" /> Підписано
          </Badge>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground">
        з {new Date(delegation.valid_from).toLocaleDateString("uk-UA")} · AI оплачує{" "}
        {delegation.billing_payer === "cabinet_owner" ? "салон" : "майстер"}
      </span>
    </button>
  );
}

interface MasterEditorProps {
  master: SalonMaster;
  isNew: boolean;
  cabinetId: string;
  workstations: import("@/config/demoCabinets/salonData").SalonWorkstation[];
  onPatch: (p: Partial<SalonMaster>) => void;
  onCreate: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onOpenProfile: () => void;
  onOpenContract: () => void;
  onGoToDelegations?: () => void;
}

function MasterEditor({
  master,
  isNew,
  cabinetId,
  workstations: salonWorkstations,
  onPatch,
  onCreate,
  onCancel,
  onDelete,
  onOpenProfile,
  onOpenContract,
  onGoToDelegations,
}: MasterEditorProps) {
  const canCreate = master.fullName.trim().length >= 3 && master.specialties.length > 0;
  const delegation = !isNew ? getActiveDelegationByMasterId(master.id) : undefined;
  const isInvited =
    !delegation && !isNew
      ? getInvitationsForSalon(cabinetId).some((i) => i.masterId === master.id)
      : false;
  const { kindLabel, detail } = getDelegationTerms(delegation);
  const visibleBadges = (master.badges ?? []).slice(0, 4);

  return (
    <>
      <SheetHeader>
        <SheetTitle>{isNew ? "Новий майстер" : master.fullName}</SheetTitle>
        <SheetDescription>
          {isNew
            ? "Заповніть основні дані. Деталі можна змінити пізніше."
            : "Редагування картки майстра і ставок"}
        </SheetDescription>
      </SheetHeader>

      {/* Договір та публічний профіль — лише в режимі редагування */}
      {!isNew && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-3 space-y-3">
          <div className="flex items-start gap-2">
            <FileSignature className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium">{kindLabel}</span>
                {delegation && (
                  <Badge variant="outline" className="text-[10px]">
                    № {delegation.contract_number}
                  </Badge>
                )}
                {delegation?.signed_at ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-success/30 bg-success/10 text-success gap-1"
                  >
                    <ShieldCheck className="w-2.5 h-2.5" /> Підписано
                  </Badge>
                ) : isInvited ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-warning/40 bg-warning/10 text-warning-foreground"
                  >
                    Очікує реєстрації
                  </Badge>
                ) : !delegation ? (
                  <Badge variant="outline" className="text-[10px] border-border bg-muted text-muted-foreground">
                    Без договору
                  </Badge>
                ) : null}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{detail}</div>
              {delegation && (
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  з {new Date(delegation.valid_from).toLocaleDateString("uk-UA")} · AI оплачує{" "}
                  <span className="text-foreground font-medium">
                    {delegation.billing_payer === "cabinet_owner" ? "салон" : "майстер"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {delegation ? (
              <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={onOpenContract}>
                <Eye className="w-3.5 h-3.5" />
                Переглянути договір
              </Button>
            ) : (
              onGoToDelegations && (
                <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={onGoToDelegations}>
                  <ArrowRight className="w-3.5 h-3.5" />
                  Перейти до Делегацій майстрів
                </Button>
              )
            )}
            <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={onOpenProfile}>
              <Eye className="w-3.5 h-3.5" />
              Відкрити профіль майстра
            </Button>
          </div>

          {/* Публічні поля профілю (read-only превʼю) */}
          {(master.publicTitle || master.rating != null || master.instagramHandle || visibleBadges.length > 0) && (
            <div className="border-t border-border pt-2.5 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Публічний профіль
              </div>
              {master.publicTitle && (
                <div className="text-xs text-foreground">{master.publicTitle}</div>
              )}
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                {master.rating != null && (
                  <span className="inline-flex items-center gap-0.5 tabular-nums">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{master.rating.toFixed(1)}</span>
                    {master.reviewsCount != null && <span>· {master.reviewsCount} відгуків</span>}
                  </span>
                )}
                {master.instagramHandle && (
                  <span className="inline-flex items-center gap-0.5">
                    <AtSign className="w-3 h-3" />
                    {master.instagramHandle}
                  </span>
                )}
              </div>
              {visibleBadges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {visibleBadges.map((b) => {
                    const meta = BADGE_META[b];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <span
                        key={b}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-medium",
                          meta.tone,
                        )}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                Публічні поля редагує сам майстер у власному кабінеті.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 mt-4">
        <div className="space-y-1.5">
          <Label>ПІБ</Label>
          <Input value={master.fullName} onChange={(e) => onPatch({ fullName: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Коротке ім'я</Label>
            <Input value={master.shortName} onChange={(e) => onPatch({ shortName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Тип</Label>
            <Select value={master.type} onValueChange={(v: MasterType) => onPatch({ type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Штатний (трудовий)</SelectItem>
                <SelectItem value="fop">ФОП-орендар</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Комісія за замовч., %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={master.commissionPct}
            onChange={(e) => onPatch({ commissionPct: Number(e.target.value) || 0 })}
          />
          <p className="text-[11px] text-muted-foreground">
            Використовується, якщо не задано ставку по категорії послуг.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Спеціалізації</Label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CATEGORY_LABEL) as ServiceCategory[]).map((c) => {
              const active = master.specialties.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    onPatch({
                      specialties: active
                        ? master.specialties.filter((x) => x !== c)
                        : [...master.specialties, c],
                    })
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs border transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted/60 border-border",
                  )}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Постійні робочі місця (з пріоритетом)</Label>
          <div className="space-y-1">
            {salonWorkstations.map((w) => {
              const idx = (master.preferredWorkstationIds ?? []).indexOf(w.id);
              const active = idx !== -1;
              return (
                <label
                  key={w.id}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border text-sm cursor-pointer transition-colors",
                    active ? "bg-primary/5 border-primary/30" : "bg-background hover:bg-muted/40 border-border",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {
                        const cur = master.preferredWorkstationIds ?? [];
                        onPatch({
                          preferredWorkstationIds: active
                            ? cur.filter((id) => id !== w.id)
                            : [...cur, w.id],
                        });
                      }}
                      className="shrink-0"
                    />
                    <span className="truncate">{w.name}</span>
                  </div>
                  {active && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {idx === 0 ? "Основне" : `#${idx + 1}`}
                    </Badge>
                  )}
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Перше у списку — основне. Використовується для бронювання, коли немає явної прив'язки.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Робочі дні</Label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d) => {
              const active = master.schedule.workDays.includes(d.v);
              return (
                <button
                  key={d.v}
                  type="button"
                  onClick={() =>
                    onPatch({
                      schedule: {
                        ...master.schedule,
                        workDays: active
                          ? master.schedule.workDays.filter((x) => x !== d.v)
                          : [...master.schedule.workDays, d.v].sort(),
                      },
                    })
                  }
                  className={cn(
                    "w-9 h-8 rounded-md text-xs border transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted/60 border-border",
                  )}
                >
                  {d.l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Початок, год</Label>
            <Input
              type="number" min={0} max={23}
              value={master.schedule.startHour}
              onChange={(e) => onPatch({ schedule: { ...master.schedule, startHour: Number(e.target.value) || 0 } })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Кінець, год</Label>
            <Input
              type="number" min={0} max={24}
              value={master.schedule.endHour}
              onChange={(e) => onPatch({ schedule: { ...master.schedule, endHour: Number(e.target.value) || 0 } })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Колір у календарі</Label>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="color"
              value={master.color}
              onChange={(e) => onPatch({ color: e.target.value })}
              className="h-9 w-12 rounded-md border bg-background cursor-pointer"
              aria-label="Колір"
            />
            <div className="flex gap-1">
              {MASTER_COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onPatch({ color: c })}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    master.color === c ? "border-foreground scale-110" : "border-transparent",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t gap-2">
          {isNew ? (
            <>
              <Button variant="ghost" size="sm" onClick={onCancel}>Скасувати</Button>
              <Button size="sm" onClick={onCreate} disabled={!canCreate} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Створити
              </Button>
            </>
          ) : (
            <>
              <span />
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive gap-1.5">
                <Trash2 className="w-4 h-4" />
                Видалити
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
