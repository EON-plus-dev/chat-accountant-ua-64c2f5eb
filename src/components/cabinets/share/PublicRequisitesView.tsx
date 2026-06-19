import { Lock, Hash, MapPin, UserCircle2, Banknote, Receipt, Briefcase, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Cabinet } from "@/types/cabinet";
import type { CabinetRequisites } from "@/config/cabinetRequisitesDemo";

interface Props {
  cabinet: Cabinet;
  requisites: CabinetRequisites;
  /** When true, hides sensitive fields (IBAN, director, full legal address, VAT number). */
  redacted?: boolean;
  taxSystemLabel?: string | null;
}

function Row({
  label,
  icon: Icon,
  children,
  locked,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border/40 last:border-b-0">
      <Icon className="w-4 h-4 text-muted-foreground/70 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground/80 font-medium">
          {label}
        </div>
        <div className="text-sm flex items-center gap-1.5 flex-wrap">
          <span className="min-w-0">{children}</span>
          {locked && <Lock className="w-3 h-3 text-muted-foreground/50 shrink-0" aria-label="Дані з ЄДР" />}
        </div>
      </div>
    </div>
  );
}

export function PublicRequisitesView({ cabinet, requisites: req, redacted, taxSystemLabel }: Props) {
  const code = req.edrpou || req.ipn;
  const codeLabel = req.edrpou ? "ЄДРПОУ" : "ІПН (РНОКПП)";
  const regDate = (req as { registrationDate?: string }).registrationDate;

  return (
    <div className="space-y-0">
      {code && (
        <Row label={codeLabel} icon={Hash} locked>
          <span className="font-mono tabular-nums font-medium">{code}</span>
        </Row>
      )}
      {taxSystemLabel && (
        <Row label="Система оподаткування" icon={Briefcase}>
          <span className="text-foreground">{taxSystemLabel}</span>
        </Row>
      )}
      {req.isVatPayer !== undefined && (
        <Row label="ПДВ" icon={Receipt} locked={!!req.vatNumber}>
          {req.isVatPayer ? (
            <>
              <span className="text-success font-medium">Платник ПДВ</span>
              {!redacted && req.vatNumber && (
                <span className="text-muted-foreground ml-1">
                  · ІПН ПДВ <span className="font-mono tabular-nums">{req.vatNumber}</span>
                </span>
              )}
              {redacted && req.vatNumber && (
                <span className="text-muted-foreground ml-1">· ІПН ПДВ прихований</span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">Неплатник ПДВ</span>
          )}
        </Row>
      )}
      {regDate && (
        <Row label="Дата реєстрації" icon={CalendarIcon} locked>
          {format(new Date(regDate), "d MMMM yyyy", { locale: uk })}
        </Row>
      )}
      {req.legalAddress && (
        <Row label="Юридична адреса" icon={MapPin} locked={!redacted}>
          {redacted ? (
            <span className="text-muted-foreground italic">Доступно після представлення</span>
          ) : (
            <span className="text-foreground">{req.legalAddress}</span>
          )}
        </Row>
      )}
      {req.director && (
        <Row label="Керівник" icon={UserCircle2}>
          {redacted ? (
            <span className="text-muted-foreground italic">Доступно після представлення</span>
          ) : (
            <>
              <span className="text-foreground">{req.director}</span>
              {req.directorPosition && (
                <span className="text-muted-foreground ml-1">· {req.directorPosition}</span>
              )}
            </>
          )}
        </Row>
      )}
      {(req.iban || req.bankName) && (
        <Row label="Банківський рахунок" icon={Banknote}>
          {redacted ? (
            <span className="text-muted-foreground italic">Доступно після представлення</span>
          ) : (
            <>
              {req.iban && <span className="font-mono tabular-nums text-xs">{req.iban}</span>}
              {req.bankName && <div className="text-xs text-muted-foreground">{req.bankName}</div>}
            </>
          )}
        </Row>
      )}
    </div>
  );
}
