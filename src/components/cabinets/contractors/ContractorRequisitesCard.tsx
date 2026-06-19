import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  User,
  Briefcase,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  UserCircle,
  Receipt,
  Calendar,
  Landmark,
  Wallet,
  UserPlus,
  RefreshCw,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import type { Contractor } from "@/config/settingsConfig";

interface ContractorRequisitesCardProps {
  contractor: Contractor;
  onEdit?: () => void;
}

// Check if contractor data can be edited
const canEditContractor = (contractor: Contractor): boolean => {
  // Cannot edit if:
  // 1. Data is synced from linked cabinet
  // 2. Data is verified from EDR registry
  return !contractor.linkedCabinetId && !contractor.isEdrsVerified;
};

export const ContractorRequisitesCard = ({
  contractor,
  onEdit,
}: ContractorRequisitesCardProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} скопійовано`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getTypeIcon = () => {
    switch (contractor.type) {
      case "legal":
        return <Building2 className="h-4 w-4" />;
      case "fop":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (contractor.type) {
      case "legal":
        return "Юридична особа";
      case "fop":
        return "ФОП";
      default:
        return "Фізична особа";
    }
  };

  const getStatusBadge = () => {
    const status = contractor.status || "active";
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="gap-1 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30"
          >
            <CheckCircle className="h-3 w-3" />
            Активний
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            Неактивний
          </Badge>
        );
      case "blocked":
        return (
          <Badge
            variant="outline"
            className="gap-1 text-destructive border-destructive/30 bg-destructive/10"
          >
            <AlertCircle className="h-3 w-3" />
            Заблоковано
          </Badge>
        );
    }
  };

  const getSyncBadge = () => {
    if (contractor.linkedCabinetId) {
      return (
        <Badge
          variant="outline"
          className="gap-1 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30"
        >
          <RefreshCw className="h-3 w-3" />
          Синхронізовано
        </Badge>
      );
    }
    if (contractor.isSynced) {
      return (
        <Badge
          variant="outline"
          className="gap-1 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30"
        >
          <CheckCircle className="h-3 w-3" />
          Синхронізовано
        </Badge>
      );
    }
    if (contractor.isPending) {
      return (
        <Badge
          variant="outline"
          className="gap-1 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30"
        >
          <Clock className="h-3 w-3" />
          Запрошено
        </Badge>
      );
    }
    return null;
  };

  // Credit limit calculations
  const creditUsedPercent =
    contractor.creditLimit && contractor.creditUsed
      ? Math.round((contractor.creditUsed / contractor.creditLimit) * 100)
      : 0;

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {getTypeIcon()}
            Реквізити
          </CardTitle>
          {/* Show Edit button only if contractor can be edited */}
          {onEdit && canEditContractor(contractor) && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Редагувати
            </Button>
          )}
          {/* Show lock badge if data is protected */}
          {!canEditContractor(contractor) && (
            <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" />
              {contractor.linkedCabinetId ? "Синхронізовано" : "Дані з реєстру"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status & Type & Role Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            {getTypeIcon()}
            {getTypeLabel()}
          </Badge>
          {contractor.role && (
            <Badge variant="outline" className="gap-1">
              {contractor.role === "supplier" && "Постачальник"}
              {contractor.role === "buyer" && "Покупець"}
              {contractor.role === "both" && "Постачальник/Покупець"}
            </Badge>
          )}
          {getStatusBadge()}
          {getSyncBadge()}
          {contractor.isEdrsVerified && (
            <Badge
              variant="outline"
              className="gap-1 text-primary border-primary/30 bg-primary/5"
            >
              <ShieldCheck className="h-3 w-3" />
              ЄДРС верифіковано
            </Badge>
          )}
        </div>

        {/* Full Name (if different from short name) */}
        {contractor.fullName && contractor.fullName !== contractor.name && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Повна назва</p>
            <p className="text-sm">{contractor.fullName}</p>
          </div>
        )}

        {/* EDRPOU/IPN */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {contractor.type === "legal" ? "ЄДРПОУ" : "ІПН"}
          </p>
          <div className="flex items-center gap-2">
            <p className="font-mono font-medium">{contractor.code}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                copyToClipboard(
                  contractor.code,
                  contractor.type === "legal" ? "ЄДРПОУ" : "ІПН"
                )
              }
            >
              {copiedField ===
              (contractor.type === "legal" ? "ЄДРПОУ" : "ІПН") ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* IBAN */}
        {contractor.iban && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              IBAN
              {contractor.ibanConfirmed && (
                <Badge variant="outline" className="ml-1 h-4 text-[10px] gap-0.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Підтверджено
                </Badge>
              )}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm break-all">{contractor.iban}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => copyToClipboard(contractor.iban!, "IBAN")}
              >
                {copiedField === "IBAN" ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Contact Info */}
        <div className="grid gap-3 sm:grid-cols-2">
          {contractor.email && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </p>
              <a
                href={`mailto:${contractor.email}`}
                className="text-sm text-primary hover:underline"
              >
                {contractor.email}
              </a>
            </div>
          )}

          {contractor.phone && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Телефон
              </p>
              <a
                href={`tel:${contractor.phone}`}
                className="text-sm text-primary hover:underline"
              >
                {contractor.phone}
              </a>
            </div>
          )}
        </div>

        {/* Address */}
        {contractor.address && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Адреса
            </p>
            <p className="text-sm">{contractor.address}</p>
          </div>
        )}

        {/* Director - from KEP onboarding */}
        {contractor.director && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <UserCircle className="h-3 w-3" />
                Керівник
              </p>
              <p className="text-sm font-medium">{contractor.director}</p>
              {contractor.directorPosition && (
                <p className="text-xs text-muted-foreground">
                  {contractor.directorPosition}
                </p>
              )}
            </div>
          </>
        )}

        {/* Tax Status */}
        {contractor.taxStatus && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              Податковий статус
            </p>
            <Badge variant="outline">{contractor.taxStatus}</Badge>
          </div>
        )}

        {/* Payment Terms & Credit Limit - FinTech fields */}
        {(contractor.paymentTermsDays || contractor.creditLimit) && (
          <>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              {contractor.paymentTermsDays && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Термін оплати
                  </p>
                  <p className="text-sm font-medium">
                    Нетто {contractor.paymentTermsDays} днів
                  </p>
                </div>
              )}
              {contractor.creditLimit && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Кредитний ліміт
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">
                        {(contractor.creditUsed || 0).toLocaleString("uk-UA")} ₴
                      </span>
                      <span className="text-muted-foreground">
                        з {contractor.creditLimit.toLocaleString("uk-UA")} ₴
                      </span>
                    </div>
                    <Progress value={creditUsedPercent} className="h-1.5" />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* KVEDs */}
        {contractor.kveds && contractor.kveds.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                КВЕДи
              </p>
              <div className="space-y-1">
                {contractor.kveds.map((kved, i) => (
                  <p key={i} className="text-sm">
                    {kved}
                  </p>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Registration Date & Bank */}
        {(contractor.registrationDate || contractor.bankName) && (
          <>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              {contractor.registrationDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Дата реєстрації
                  </p>
                  <p className="text-sm">
                    {new Date(contractor.registrationDate).toLocaleDateString(
                      "uk-UA"
                    )}
                  </p>
                </div>
              )}
              {contractor.bankName && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Landmark className="h-3 w-3" />
                    Банк
                  </p>
                  <p className="text-sm">{contractor.bankName}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Invitation Info */}
        {contractor.invitedByCabinetName && (
          <>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <UserPlus className="h-3 w-3" />
                Запрошено
              </p>
              <p className="text-sm">
                {contractor.invitedByCabinetName}
                {contractor.invitedAt && (
                  <span className="text-muted-foreground">
                    {" "}• {new Date(contractor.invitedAt).toLocaleDateString("uk-UA")}
                  </span>
                )}
              </p>
            </div>
          </>
        )}

        {/* Created At */}
        {contractor.createdAt && (
          <p className="text-xs text-muted-foreground text-right pt-2">
            Додано: {new Date(contractor.createdAt).toLocaleDateString("uk-UA")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
