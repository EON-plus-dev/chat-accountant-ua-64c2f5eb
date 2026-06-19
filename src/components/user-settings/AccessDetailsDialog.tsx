import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Shield, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { demoCabinetAccessDetails, CabinetAccessDetails } from "@/config/userSettingsConfig";
import { entityStyles } from "@/config/entityStyles";
import { cn } from "@/lib/utils";
import type { CabinetType } from "@/types/cabinet";

interface AccessDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinet: {
    id: string;
    name: string;
    type: CabinetType;
    roleLabel: string;
  } | null;
}

const AccessDetailsDialog = ({ open, onOpenChange, cabinet }: AccessDetailsDialogProps) => {
  if (!cabinet) return null;

  const accessDetails = demoCabinetAccessDetails[cabinet.id];
  const style = entityStyles[cabinet.type];
  const Icon = style?.icon;

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAccessTypeLabel = (type: CabinetAccessDetails['accessType']) => {
    switch (type) {
      case 'full': return { label: 'Повний доступ', icon: CheckCircle, className: 'text-green-600' };
      case 'limited': return { label: 'Обмежений доступ', icon: Shield, className: 'text-amber-600' };
      case 'readonly': return { label: 'Тільки перегляд', icon: Eye, className: 'text-blue-600' };
    }
  };

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      documents: 'Документи',
      reports: 'Звіти',
      analytics: 'Аналітика',
      settings: 'Налаштування'
    };
    return labels[permission] || permission;
  };

  const accessType = accessDetails ? getAccessTypeLabel(accessDetails.accessType) : null;
  const AccessIcon = accessType?.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Деталі доступу
          </DialogTitle>
          <DialogDescription>
            Інформація про ваш доступ до кабінету
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cabinet Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          {Icon && (
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", style?.bgColor)}>
                <Icon className={cn("w-5 h-5", style?.color)} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{cabinet.name}</p>
              <Badge variant="outline" className={cn("text-xs mt-1", style?.badgeClass)}>
                {style?.label}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Role */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ваша роль</p>
            <p className="font-medium">{cabinet.roleLabel}</p>
          </div>

          {/* Access Type */}
          {accessType && AccessIcon && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Тип доступу</p>
              <div className={cn("flex items-center gap-2 font-medium", accessType.className)}>
                <AccessIcon className="w-4 h-4" />
                {accessType.label}
              </div>
            </div>
          )}

          {/* Permissions */}
          {accessDetails?.permissions && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Дозволи</p>
              <div className="flex flex-wrap gap-1.5">
                {accessDetails.permissions.map((perm) => (
                  <Badge key={perm} variant="secondary" className="text-xs">
                    {getPermissionLabel(perm)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Granted Info */}
          {accessDetails && (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Дата надання
                </p>
                <p className="font-medium">{formatDate(accessDetails.grantedAt)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Доступ надав
                </p>
                <p className="font-medium">{accessDetails.grantedBy}</p>
                <p className="text-sm text-muted-foreground">{accessDetails.grantedByEmail}</p>
              </div>
            </>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Щоб змінити роль або права доступу, зверніться до власника кабінету.
            </p>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AccessDetailsDialog;