import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, Check, ChevronRight, ArrowLeft, Edit2, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CabinetType } from "@/types/cabinet";
import { 
  getRolesForCabinetType, 
  permissionGroups,
  roleColorClasses,
  type RoleDefinition,
  type PermissionKey
} from "@/config/teamRolesConfig";

interface RoleCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinetType: CabinetType;
  onAddRole?: (role: RoleDefinition, customName?: string, customPermissions?: PermissionKey[]) => void;
}

export const RoleCatalogDialog = ({
  open,
  onOpenChange,
  cabinetType,
  onAddRole,
}: RoleCatalogDialogProps) => {
  const availableRoles = getRolesForCabinetType(cabinetType);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPermissions, setCustomPermissions] = useState<PermissionKey[]>([]);

  const handleSelectRole = (role: RoleDefinition) => {
    setSelectedRole(role);
    setCustomName(role.label);
    setCustomPermissions([...role.permissions]);
    setIsCustomizing(false);
  };

  const handleBack = () => {
    if (isCustomizing) {
      setIsCustomizing(false);
    } else {
      setSelectedRole(null);
    }
  };

  const handleTogglePermission = (permission: PermissionKey) => {
    setCustomPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleAddRole = () => {
    if (!selectedRole) return;
    
    const hasChanges = customName !== selectedRole.label || 
      customPermissions.length !== selectedRole.permissions.length ||
      !customPermissions.every(p => selectedRole.permissions.includes(p));

    onAddRole?.(
      selectedRole, 
      hasChanges ? customName : undefined,
      hasChanges ? customPermissions : undefined
    );
    
    toast.success(`Роль "${customName}" додано до кабінету`);
    onOpenChange(false);
    
    // Reset state
    setSelectedRole(null);
    setIsCustomizing(false);
  };

  const renderRolesList = () => (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-2">
        {availableRoles.filter(r => !r.isOwnerRole).map((role) => {
          const colorClasses = roleColorClasses[role.color];
          
          return (
            <button
              key={role.key}
              onClick={() => handleSelectRole(role)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                "hover:border-primary/50 hover:shadow-sm"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                colorClasses.bg
              )}>
                <Shield className={cn("w-5 h-5", colorClasses.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{role.label}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {role.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {role.permissions.length} дозволів
                  </Badge>
                  {role.canDelegate && (
                    <Badge variant="secondary" className="text-xs">
                      Може делегувати
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );

  const renderRoleDetails = () => {
    if (!selectedRole) return null;
    
    const colorClasses = roleColorClasses[selectedRole.color];
    const permissionsToShow = isCustomizing ? customPermissions : selectedRole.permissions;

    return (
      <div className="space-y-4">
        {/* Role header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
            colorClasses.bg
          )}>
            <Shield className={cn("w-6 h-6", colorClasses.text)} />
          </div>
          <div className="flex-1">
            {isCustomizing ? (
              <div className="space-y-2">
                <Label htmlFor="custom-name">Назва ролі</Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Введіть назву ролі"
                />
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-lg">{selectedRole.label}</h3>
                <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
              </>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Дозволи ({permissionsToShow.length})
            </Label>
            {!isCustomizing && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsCustomizing(true)}
                className="h-8 gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Налаштувати
              </Button>
            )}
          </div>

          <ScrollArea className="h-[280px] border rounded-lg">
            <Accordion type="multiple" className="p-2">
              {permissionGroups.map((group) => {
                const groupPermissions = group.permissions.filter(p => 
                  isCustomizing || selectedRole.permissions.includes(p.key)
                );
                
                if (groupPermissions.length === 0 && !isCustomizing) return null;

                const activeCount = groupPermissions.filter(p => 
                  permissionsToShow.includes(p.key)
                ).length;

                return (
                  <AccordionItem key={group.id} value={group.id} className="border-b-0">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{group.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {activeCount}/{group.permissions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-1">
                        {group.permissions.map((permission) => {
                          const isActive = permissionsToShow.includes(permission.key);
                          
                          if (!isCustomizing && !isActive) return null;
                          
                          return (
                            <div
                              key={permission.key}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md",
                                isCustomizing ? "hover:bg-muted/50 cursor-pointer" : ""
                              )}
                              onClick={() => isCustomizing && handleTogglePermission(permission.key)}
                            >
                              {isCustomizing ? (
                                <Checkbox
                                  checked={isActive}
                                  onCheckedChange={() => handleTogglePermission(permission.key)}
                                />
                              ) : (
                                <Check className="w-4 h-4 text-green-500 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">{permission.label}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={handleAddRole}
            disabled={isCustomizing && (!customName.trim() || customPermissions.length === 0)}
          >
            {isCustomizing ? (
              <>
                <Save className="w-4 h-4" />
                Зберегти роль
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Додати в кабінет
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {selectedRole ? (isCustomizing ? "Налаштування ролі" : "Деталі ролі") : "Каталог ролей"}
          </DialogTitle>
          <DialogDescription>
            {selectedRole 
              ? "Перегляньте дозволи або налаштуйте їх перед додаванням"
              : "Оберіть роль для додавання до кабінету"
            }
          </DialogDescription>
        </DialogHeader>

        {selectedRole ? renderRoleDetails() : renderRolesList()}
      </DialogContent>
    </Dialog>
  );
};
