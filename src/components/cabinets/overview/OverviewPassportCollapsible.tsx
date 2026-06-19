import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Lock,
  Calendar as CalendarIcon,
  MapPin,
  UserCircle2,
  Briefcase,
  Users as UsersIcon,
  Hash,
  Receipt as ReceiptIcon,
  Banknote,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareCabinetDialog } from "@/components/cabinets/share/ShareCabinetDialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { getEntityStyle } from "@/config/entityStyles";
import {
  getIntegrationsForCabinet,
  getStatusIndicator,
  type DataSource,
} from "@/config/dataSourcesConfig";
import { getKvedsForCabinet } from "@/config/settingsConfig";
import { getCabinetRequisites } from "@/config/cabinetRequisitesDemo";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import { useOverviewBp } from "./OverviewBpContext";
import { expandLegalName } from "@/lib/cabinet/expandLegalName";

interface Props {
  cabinet: Cabinet;
  description: string;
  onOpenIntegrations: () => void;
}

// (industry/tax shortcuts removed from header — full data shown in expanded view)

function getFullTaxSystemLabel(cabinet: Cabinet, isVatPayer?: boolean): string | null {
  if (cabinet.type === "fop") {
    const parts: string[] = ["ФОП"];
    if (cabinet.fopGroup) parts.push(`${cabinet.fopGroup} група`);
    if (cabinet.fopGroup === 3) {
      parts.push(isVatPayer ? "3% від доходу" : "5% від доходу");
    } else if (cabinet.fopGroup === 2) {
      parts.push("фікс. до 1 600 грн/міс");
    } else if (cabinet.fopGroup === 1) {
      parts.push("фікс. до 302,8 грн/міс");
    }
    return parts.join(" · ");
  }
  if (cabinet.type === "tov") return "ТОВ · загальна система";
  return null;
}

function Field({
  label,
  children,
  locked,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  locked?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5 min-w-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/70 mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 font-medium">
          {label}
        </div>
        <div className="text-sm flex items-center gap-1.5 flex-wrap min-w-0">
          <span className="min-w-0">{children}</span>
          {locked && (
            <Lock
              className="w-3 h-3 text-muted-foreground/50 shrink-0"
              aria-label="Синхронізовано з ЄДР"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold pt-2 pb-1 border-b border-border/40">
      {children}
    </div>
  );
}

export function OverviewPassportCollapsible({
  cabinet,
  description,
  onOpenIntegrations,
}: Props) {
  const { isAtLeast } = useOverviewBp();
  const storageKey = `overview-passport-${cabinet.id}`;
  // Default COLLAPSED — collapsed header is itself informative (acts as hero)
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === "1") setOpen(true);
      else if (v === "0") setOpen(false);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const entityStyle = getEntityStyle(cabinet.type);
  const Icon = entityStyle.icon;
  const isPassive = cabinet.accessMode === "passive";
  const isIndividual = cabinet.type === "individual";
  const isFop = cabinet.type === "fop";
  const isTov = cabinet.type === "tov";

  const requisites = useMemo(() => getCabinetRequisites(cabinet), [cabinet]);
  const allIntegrations = getIntegrationsForCabinet(cabinet.type);
  const integrations = isPassive
    ? allIntegrations.filter((i) => i.category === "bank")
    : allIntegrations;
  const kveds = isPassive || isIndividual ? [] : getKvedsForCabinet(cabinet);

  const code = requisites.edrpou || requisites.ipn || cabinet.taxId;
  const codeLabel = requisites.edrpou ? "ЄДРПОУ" : "ІПН";

  const taxSystemLabel = getFullTaxSystemLabel(cabinet, requisites.isVatPayer);

  const showTaxSection = !isPassive && !isIndividual;
  const showKvedsSection = kveds.length > 0;
  const dataColsClass = isAtLeast("lg")
    ? showTaxSection && showKvedsSection
      ? "grid-cols-3"
      : showTaxSection || showKvedsSection
        ? "grid-cols-2"
        : "grid-cols-1"
    : "grid-cols-1";

  const regDateRaw = (requisites as { registrationDate?: string }).registrationDate;

  return (
    <Card className="border-border/70">
      <Collapsible open={open} onOpenChange={toggle}>
        {/* HEADER (acts as hero, click anywhere except actions to toggle) */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={open}
          onClick={() => toggle(!open)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle(!open);
            }
          }}
          className={cn(
            "w-full text-left hover:bg-muted/30 transition-colors rounded-t-lg cursor-pointer",
            open && "rounded-b-none border-b border-border/40",
            isAtLeast("md") ? "px-4 py-3" : "px-3 py-2.5",
          )}
        >
          <div className="flex items-start gap-3">
            {/* Type icon */}
            <div
              className={cn(
                "rounded-lg flex items-center justify-center shrink-0",
                entityStyle.bgColor,
                isAtLeast("md") ? "w-10 h-10" : "w-9 h-9",
              )}
            >
              <Icon className={cn("w-5 h-5", entityStyle.color)} />
            </div>

            {/* Title + active badge only — full info shown on expand */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h2
                  className={cn(
                    "font-semibold tracking-tight min-w-0 break-words",
                    isAtLeast("md") ? "text-base" : "text-sm",
                  )}
                  title={expandLegalName(requisites.name || cabinet.name)}
                >
                  {expandLegalName(requisites.name || cabinet.name)}
                </h2>
                <Badge
                  variant={cabinet.status === "active" ? "success" : "secondary"}
                  size="sm"
                  className="shrink-0"
                >
                  {cabinet.status === "active" ? "Активний" : "Архів"}
                </Badge>
              </div>
            </div>



            {/* Share button — only for FOP/TOV (sharable requisites) */}
            {!isIndividual && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 shrink-0 mt-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareOpen(true);
                }}
                aria-label="Поділитися реквізитами"
              >
                <Share2 className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline text-xs">Поділитися</span>
              </Button>
            )}

            {/* Chevron — decorative; whole header is the toggle target */}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "shrink-0 w-4 h-4 mt-1 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </div>

        <CollapsibleContent>
          <CardContent
            className={cn(
              "space-y-4",
              isAtLeast("md") ? "px-4 pb-4 pt-3" : "px-3 pb-3 pt-3",
            )}
          >
            {/* Data sections grid */}
            <div className={cn("grid gap-x-6 gap-y-1", dataColsClass)}>
              {/* Identification */}
              <div className="space-y-0.5">
                <SectionHeader>Ідентифікація</SectionHeader>
                {code && (
                  <Field label={codeLabel} icon={Hash} locked>
                    <span className="font-mono tabular-nums font-medium">{code}</span>
                  </Field>
                )}
                {regDateRaw && (
                  <Field label="Дата реєстрації" icon={CalendarIcon} locked>
                    {format(new Date(regDateRaw), "d MMMM yyyy", { locale: uk })}
                  </Field>
                )}
                {requisites.legalAddress && (
                  <Field label="Юридична адреса" icon={MapPin} locked>
                    <span className="text-foreground">{requisites.legalAddress}</span>
                  </Field>
                )}
                {requisites.director && (
                  <Field label="Керівник" icon={UserCircle2}>
                    <span className="text-foreground">{requisites.director}</span>
                    {requisites.directorPosition && (
                      <span className="text-muted-foreground ml-1">
                        · {requisites.directorPosition}
                      </span>
                    )}
                  </Field>
                )}
                {(requisites.iban || requisites.bankName) && (
                  <Field label="Основний рахунок" icon={Banknote}>
                    {requisites.iban && (
                      <span className="font-mono tabular-nums text-xs">{requisites.iban}</span>
                    )}
                    {requisites.bankName && (
                      <div className="text-xs text-muted-foreground">{requisites.bankName}</div>
                    )}
                  </Field>
                )}
              </div>

              {/* Tax regime */}
              {showTaxSection && (
                <div className="space-y-0.5">
                  <SectionHeader>Податковий режим</SectionHeader>
                  {taxSystemLabel && (
                    <Field label="Система оподаткування" icon={Briefcase}>
                      <span className="text-foreground">{taxSystemLabel}</span>
                    </Field>
                  )}
                  <Field label="ПДВ" icon={ReceiptIcon} locked={!!requisites.isVatPayer}>
                    {requisites.isVatPayer ? (
                      <span className="text-foreground">
                        Платник ПДВ
                        {requisites.vatNumber && (
                          <span className="text-muted-foreground font-mono tabular-nums ml-1.5">
                            · ІПН ПДВ {requisites.vatNumber}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Неплатник ПДВ</span>
                    )}
                  </Field>
                  {isFop && (
                    <Field label="Працівники" icon={UsersIcon}>
                      {cabinet.hasEmployees ? (
                        <span className="text-foreground">Є</span>
                      ) : (
                        <span className="text-muted-foreground">Немає</span>
                      )}
                    </Field>
                  )}
                </div>
              )}

              {/* KVEDs */}
              {showKvedsSection && (
                <div className="space-y-0.5">
                  <SectionHeader>КВЕДи</SectionHeader>
                  <div className="pt-1.5 space-y-1">
                    {kveds.map((k) => (
                      <div
                        key={k.code}
                        className="flex items-start gap-2 text-xs"
                        title={k.name}
                      >
                        <span
                          className={cn(
                            "font-mono tabular-nums font-medium px-1.5 py-0.5 rounded shrink-0",
                            k.isMain
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {k.code}
                        </span>
                        <span className="text-muted-foreground leading-relaxed min-w-0">
                          {k.name}
                          {k.isMain && (
                            <span className="ml-1 text-[10px] uppercase font-semibold text-primary">
                              · основний
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Integrations row */}
            {integrations.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <SectionHeader>Інтеграції</SectionHeader>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {integrations.map((integration: DataSource) => {
                    const statusInfo = getStatusIndicator(integration.status);
                    return (
                      <button
                        key={integration.id}
                        type="button"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted rounded-lg text-xs hover:bg-muted/80 transition-colors"
                        title={statusInfo.label}
                        onClick={onOpenIntegrations}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dot)} />
                        <integration.icon className="w-3.5 h-3.5" />
                        <span>{integration.name}</span>
                        {integration.lastSync && (
                          <span className="text-muted-foreground">
                            · {format(new Date(integration.lastSync), "HH:mm", { locale: uk })}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      {!isIndividual && (
        <ShareCabinetDialog
          cabinet={cabinet}
          open={shareOpen}
          onOpenChange={setShareOpen}
          taxSystemLabel={taxSystemLabel}
        />
      )}
    </Card>
  );
}
