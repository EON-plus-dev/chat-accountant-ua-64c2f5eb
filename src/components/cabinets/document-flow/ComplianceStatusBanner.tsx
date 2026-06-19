import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileSignature,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  type ComplianceStatus,
  type IntegrityStatus,
  retentionCategories,
} from "@/config/complianceConfig";

interface ComplianceStatusBannerProps {
  status: ComplianceStatus;
  className?: string;
}

const integrityConfig: Record<IntegrityStatus, {
  icon: typeof ShieldCheck;
  label: string;
  className: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}> = {
  verified: {
    icon: ShieldCheck,
    label: "Цілісність підтверджено",
    className: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "default",
  },
  warning: {
    icon: ShieldAlert,
    label: "Потребує перевірки",
    className: "text-amber-600 dark:text-amber-400",
    badgeVariant: "secondary",
  },
  broken: {
    icon: ShieldX,
    label: "Виявлено порушення",
    className: "text-destructive",
    badgeVariant: "destructive",
  },
};

const signatureStatusConfig = {
  valid: { icon: CheckCircle2, className: "text-emerald-600", label: "Дійсні" },
  expired: { icon: AlertCircle, className: "text-amber-600", label: "Закінчився термін" },
  revoked: { icon: XCircle, className: "text-destructive", label: "Відкликано" },
  none: { icon: FileSignature, className: "text-muted-foreground", label: "Немає" },
};

export const ComplianceStatusBanner = ({
  status,
  className,
}: ComplianceStatusBannerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const integrityInfo = integrityConfig[status.integrity];
  const IntegrityIcon = integrityInfo.icon;
  
  const sigConfig = signatureStatusConfig[status.signatures.status];
  const SigStatusIcon = sigConfig.icon;

  const retentionConfig = retentionCategories[status.retention.category];
  
  // Retention color based on days remaining
  const getRetentionColor = () => {
    if (status.retention.daysRemaining > 365) return "text-emerald-600 dark:text-emerald-400";
    if (status.retention.daysRemaining > 90) return "text-amber-600 dark:text-amber-400";
    return "text-destructive";
  };

  const getProgressColor = () => {
    if (status.retention.progress < 50) return "bg-emerald-500";
    if (status.retention.progress < 80) return "bg-amber-500";
    return "bg-destructive";
  };

  const formatDaysRemaining = (days: number): string => {
    if (days > 365) {
      const years = Math.floor(days / 365);
      const remainingMonths = Math.floor((days % 365) / 30);
      return remainingMonths > 0 
        ? `${years} р. ${remainingMonths} міс.`
        : `${years} р.`;
    }
    if (days > 30) {
      return `${Math.floor(days / 30)} міс.`;
    }
    return `${days} дн.`;
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div
        className={cn(
          "rounded-lg border bg-card p-3 space-y-3",
          status.legalHold && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20",
          className
        )}
      >
        {/* Summary Row */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full h-auto p-0 hover:bg-transparent justify-between"
          >
            <div className="flex items-center gap-4 flex-wrap">
              {/* Integrity */}
              <div className="flex items-center gap-1.5">
                <IntegrityIcon className={cn("w-4 h-4", integrityInfo.className)} />
                <span className={cn("text-sm font-medium", integrityInfo.className)}>
                  {integrityInfo.label}
                </span>
              </div>

              {/* Signatures */}
              <div className="flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {status.signatures.count} КЕП
                </span>
                <SigStatusIcon className={cn("w-3.5 h-3.5", sigConfig.className)} />
              </div>

              {/* Retention */}
              <div className="flex items-center gap-1.5">
                <Clock className={cn("w-4 h-4", getRetentionColor())} />
                <span className={cn("text-sm", getRetentionColor())}>
                  {formatDaysRemaining(status.retention.daysRemaining)}
                </span>
              </div>

              {/* Legal Hold */}
              {status.legalHold && (
                <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400">
                  <Lock className="w-3 h-3" />
                  Legal Hold
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="text-xs">Деталі</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Expanded Details */}
        <CollapsibleContent className="space-y-4">
          <div className="border-t pt-3 space-y-4">
            {/* Integrity Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Цілісність даних</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {status.integrityMessage}
              </p>
              <div className="pl-6">
                <Badge variant="outline" className="text-xs gap-1">
                  <Shield className="w-3 h-3" />
                  eIDAS Ст. 41 Compliant
                </Badge>
              </div>
            </div>

            {/* Signatures Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Електронні підписи ({status.signatures.count})
                </span>
                <Badge variant={sigConfig.className.includes("emerald") ? "default" : "secondary"} className="text-xs">
                  {sigConfig.label}
                </Badge>
              </div>
              <ul className="pl-6 space-y-1">
                {status.signatures.signers.map((signer, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {signer}
                  </li>
                ))}
              </ul>
            </div>

            {/* Retention Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Термін зберігання</span>
                <Badge variant="outline" className="text-xs">
                  {retentionConfig.labelUk}
                </Badge>
              </div>
              <div className="pl-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    До {status.retention.archiveDate.toLocaleDateString("uk-UA")}
                  </span>
                  <span className={cn("font-medium", getRetentionColor())}>
                    {formatDaysRemaining(status.retention.daysRemaining)} залишилось
                  </span>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={status.retention.progress} 
                    className="h-1.5"
                  />
                  <p className="text-xs text-muted-foreground">
                    {retentionConfig.legalBasis} — {retentionConfig.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Verified */}
            <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Остання перевірка: {new Date(status.lastVerified).toLocaleString("uk-UA")}
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                Перевірити зараз
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
