/**
 * WaitlistTab — список клієнтів у черзі очікування.
 * «Запропонувати слот» → WaitlistSuggestSheet з реальними вільними слотами.
 */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Phone, UserCheck, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffMember as SalonMaster, BookableService as SalonService, WaitlistEntry as SalonWaitlistEntry } from "@/core";
import {
  readState,
  subscribeAdminBookings,
  removeFromWaitlist,
} from "./bookingsStore";
import { WaitlistSuggestSheet } from "./WaitlistSuggestSheet";

interface Props {
  cabinetId: string;
  masters: SalonMaster[];
  services: SalonService[];
}

const PRIORITY_CHIP: Record<SalonWaitlistEntry["priority"], string> = {
  low: "bg-muted text-muted-foreground border-border",
  normal: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
};

export function WaitlistTab({ cabinetId, masters, services }: Props) {
  const [entries, setEntries] = useState<SalonWaitlistEntry[]>(() => readState(cabinetId).waitlist);
  const [suggestEntry, setSuggestEntry] = useState<SalonWaitlistEntry | null>(null);

  useEffect(() => {
    setEntries(readState(cabinetId).waitlist);
    return subscribeAdminBookings(() => setEntries(readState(cabinetId).waitlist));
  }, [cabinetId]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-2">
          <Clock className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <div className="text-sm text-muted-foreground">
            Черга очікування порожня. Записи додаються автоматично при скасуванні чи no-show.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => {
        const master = masters.find((m) => m.id === e.preferredMasterId);
        const svcNames = e.serviceIds
          .map((id) => services.find((s) => s.id === id)?.name)
          .filter(Boolean)
          .join(" · ");
        return (
          <Card key={e.id}>
            <CardContent className="p-3 md:p-4 flex flex-wrap items-start gap-3 justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm font-medium">{e.clientName}</div>
                  <Badge variant="outline" size="sm" className={cn("text-[10px] border", PRIORITY_CHIP[e.priority])}>
                    {e.priority === "high" ? "Висока" : e.priority === "normal" ? "Звичайна" : "Низька"}
                  </Badge>
                  {e.status === "proposed" && (
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      Слот запропоновано
                    </Badge>
                  )}
                </div>
                <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {e.clientPhone || "—"}
                </div>
                <div className="text-[12px] text-muted-foreground truncate">{svcNames || "Послуги не вказано"}</div>
                <div className="text-[11px] text-muted-foreground">
                  Період: {e.fromDate}{e.fromDate !== e.toDate ? ` – ${e.toDate}` : ""}
                  {master ? ` · бажаний майстер: ${master.fullName}` : ""}
                </div>
                {e.note && (
                  <div className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-none" /> {e.note}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[11px]"
                  onClick={() => setSuggestEntry(e)}
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" /> Запропонувати слот
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-[11px] text-muted-foreground"
                  onClick={() => removeFromWaitlist(cabinetId, e.id)}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Зняти
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      <WaitlistSuggestSheet
        open={!!suggestEntry}
        onClose={() => setSuggestEntry(null)}
        cabinetId={cabinetId}
        entry={suggestEntry}
        masters={masters}
        services={services}
      />
    </div>
  );
}
