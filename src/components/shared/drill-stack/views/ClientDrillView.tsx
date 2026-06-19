/**
 * ClientDrillView — compact preview клієнта салону у drill-sheet (kind="client").
 *
 * Викликається з:
 *   • BookingDrillView (клік на імʼя клієнта)
 *   • SalonClientsPage (клік на рядок — головне місце)
 *   • SalonMasterDrillView/Diary (top-клієнти майстра — у майбутньому)
 */

import { useMemo } from "react";
import { ArrowRight, ExternalLink, User, Phone, Mail, Gift, CalendarClock, Tag, AlertCircle, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { useSalonClients } from "@/components/cabinets/clients-salon/useSalonClients";
import { SEGMENT_LABEL } from "@/components/cabinets/clients-salon/rfm";
import { formatPhone } from "@/components/cabinets/clients-salon/phoneNormalize";
import { formatCurrency } from "@/lib/formatters";
import { salonMasters } from "@/config/demoCabinets/salonData";

interface Props {
  clientId: string;
  cabinetId?: string;
  sourceLabel?: string;
  onOpenFullClient?: (id: string) => void;
}

export function ClientDrillView({ clientId, cabinetId, sourceLabel, onOpenFullClient }: Props) {
  const { popAll, push } = useDrillStack();
  const { byId, getBookings } = useSalonClients(cabinetId ?? "");
  const enriched = byId.get(clientId);
  const bookings = useMemo(() => (cabinetId ? getBookings(clientId).slice(0, 5) : []), [cabinetId, clientId, getBookings]);

  if (!enriched) {
    return (
      <DrillSheet matchKind="client" matchId={clientId} title="Клієнт не знайдений" sourceLabel={sourceLabel}>
        <p className="text-sm text-muted-foreground">Запис із ID {clientId} відсутній або прихований у цьому кабінеті.</p>
      </DrillSheet>
    );
  }

  const { client, rfm, segment, ltv, avgCheck, topMasterId } = enriched;
  const topMaster = topMasterId ? salonMasters.find((m) => m.id === topMasterId) : null;

  return (
    <DrillSheet
      matchKind="client"
      matchId={clientId}
      title={client.fullName}
      sourceLabel={sourceLabel}
      footer={
        onOpenFullClient ? (
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              popAll();
              onOpenFullClient(clientId);
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Відкрити у розділі «Клієнти»
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="outline" className="text-[10px]">{SEGMENT_LABEL[segment]}</Badge>
              {client.isVip && <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">VIP</Badge>}
              {client.externalCrmId && (
                <Badge variant="outline" className="text-[10px]">{client.externalCrmId.provider}</Badge>
              )}
              {client.isAnonymized && (
                <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground gap-1">
                  <ShieldOff className="w-3 h-3" /> GDPR
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">RFM {rfm.r}-{rfm.f}-{rfm.m} · {rfm.recencyDays === 9999 ? "ніколи" : `${rfm.recencyDays}д тому`}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <Row icon={Phone} label="Телефон" value={client.phone === "—" ? "—" : formatPhone(client.phone)} />
          {client.email && <Row icon={Mail} label="Email" value={client.email} />}
          {client.birthDate && <Row icon={CalendarClock} label="Дата народження" value={new Date(client.birthDate).toLocaleDateString("uk-UA")} />}
          <Row icon={Gift} label="Бонусний баланс" value={formatCurrency(client.bonusBalance ?? 0)} />
          <Row icon={User} label="Усього візитів" value={String(client.totalVisits)} />
          {topMaster && <Row icon={User} label="Майстер-улюбленець" value={topMaster.shortName} />}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Metric label="LTV" value={formatCurrency(ltv)} />
          <Metric label="Сер. чек" value={formatCurrency(avgCheck)} />
          <Metric label="Частота / рік" value={`${rfm.frequency} візитів`} />
          <Metric label="No-show" value={`${client.noShowCount ?? 0}`} />
        </div>

        {client.allergies && client.allergies.length > 0 && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs flex gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-700 dark:text-amber-400">Алергії та протипоказання</div>
              <div className="text-muted-foreground mt-0.5">{client.allergies.join(", ")}</div>
            </div>
          </div>
        )}

        {client.tags && client.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {client.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] gap-1"><Tag className="w-2.5 h-2.5" />{t}</Badge>
            ))}
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground">Останні візити</div>
            <ul className="text-sm space-y-1">
              {bookings.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => push({ kind: "booking", id: b.id, sourceLabel: `Клієнт ${client.fullName}` })}
                    className="w-full text-left rounded-md border bg-card hover:bg-muted/40 px-2.5 py-1.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs tabular-nums">
                        {new Date(b.date).toLocaleDateString("uk-UA", { day: "2-digit", month: "short" })} · {b.startTime}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">{formatCurrency(b.totalPrice)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {client.notes && (
          <div className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
            <span className="font-medium text-foreground">Нотатка:</span> {client.notes}
          </div>
        )}
      </div>
    </DrillSheet>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="text-right truncate font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
