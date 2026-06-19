import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Circle, Plus, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  permissionGroups,
  getRoleDefinition,
  type PermissionKey,
} from "@/config/teamRolesConfig";
import type { CabinetType } from "@/types/cabinet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvitePermissionsEditorProps {
  roleKey: string;
  cabinetType: CabinetType;
  customPermissions: PermissionKey[];
  restrictedPermissions: PermissionKey[];
  onSave: (custom: PermissionKey[], restricted: PermissionKey[]) => void;
  onCancel: () => void;
}

export const InvitePermissionsEditor = ({
  roleKey,
  cabinetType,
  customPermissions: initialCustom,
  restrictedPermissions: initialRestricted,
  onSave,
  onCancel,
}: InvitePermissionsEditorProps) => {
  const [customPermissions, setCustomPermissions] = useState<PermissionKey[]>(initialCustom);
  const [restrictedPermissions, setRestrictedPermissions] = useState<PermissionKey[]>(initialRestricted);

  const roleDef = getRoleDefinition(roleKey, cabinetType);
  const basePermissions = roleDef?.permissions || [];

  const effectivePermissions = useMemo(() => {
    const allPerms = [...basePermissions, ...customPermissions];
    return [...new Set(allPerms)].filter(p => !restrictedPermissions.includes(p));
  }, [basePermissions, customPermissions, restrictedPermissions]);

  const hasChanges = customPermissions.length > 0 || restrictedPermissions.length > 0;

  const getPermissionStatus = (permKey: PermissionKey): "base" | "custom" | "restricted" | "available" => {
    if (restrictedPermissions.includes(permKey)) return "restricted";
    if (customPermissions.includes(permKey)) return "custom";
    if (basePermissions.includes(permKey)) return "base";
    return "available";
  };

  const togglePermission = (permKey: PermissionKey) => {
    const status = getPermissionStatus(permKey);

    if (status === "base") {
      // Base permission -> restrict it
      setRestrictedPermissions(prev => [...prev, permKey]);
    } else if (status === "restricted") {
      // Restricted -> remove restriction
      setRestrictedPermissions(prev => prev.filter(p => p !== permKey));
    } else if (status === "custom") {
      // Custom -> remove custom
      setCustomPermissions(prev => prev.filter(p => p !== permKey));
    } else {
      // Available -> add as custom
      setCustomPermissions(prev => [...prev, permKey]);
    }
  };

  const handleSave = () => {
    onSave(customPermissions, restrictedPermissions);
  };

  const handleReset = () => {
    setCustomPermissions([]);
    setRestrictedPermissions([]);
  };

  return (
    <div className="space-y-4">
      {/* Role info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{roleDef?.label || roleKey}</p>
          <p className="text-sm text-muted-foreground">
            Базових дозволів: {basePermissions.length} | Ефективних: {effectivePermissions.length}
          </p>
        </div>
        {hasChanges && (
          <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-400">
            Змінено
          </Badge>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg text-xs">
        <div className="flex items-center gap-1.5">
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
          <span>Від ролі</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Plus className="h-3 w-3 text-blue-500" />
          <span>Додатковий</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="h-3 w-3 text-red-500" />
          <span>Заборонений</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="h-3 w-3 text-muted-foreground/50" />
          <span>Доступний</span>
        </div>
      </div>

      {/* Permissions by group */}
      <ScrollArea className="h-[400px] pr-4">
        <Accordion type="multiple" defaultValue={permissionGroups.map(g => g.id)} className="space-y-2">
          {permissionGroups.map((group) => {
            const groupPermsInEffect = group.permissions.filter(p => 
              effectivePermissions.includes(p.key)
            ).length;

            return (
              <AccordionItem key={group.id} value={group.id} className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-medium text-sm">{group.label}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {groupPermsInEffect}/{group.permissions.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {group.permissions.map((perm) => {
                      const status = getPermissionStatus(perm.key);
                      const isEnabled = status === "base" || status === "custom";

                      return (
                        <div
                          key={perm.key}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer",
                            status === "restricted" && "bg-red-50/50 dark:bg-red-950/20",
                            status === "custom" && "bg-blue-50/50 dark:bg-blue-950/20",
                            "hover:bg-muted/50"
                          )}
                          onClick={() => togglePermission(perm.key)}
                        >
                          <Checkbox
                            checked={isEnabled}
                            className={cn(
                              status === "restricted" && "border-red-500 data-[state=checked]:bg-red-500",
                              status === "custom" && "border-blue-500 data-[state=checked]:bg-blue-500"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm",
                                status === "restricted" && "line-through text-muted-foreground"
                              )}>
                                {perm.label}
                              </span>
                              {status === "custom" && (
                                <Plus className="h-3 w-3 text-blue-500 shrink-0" />
                              )}
                              {status === "restricted" && (
                                <Minus className="h-3 w-3 text-red-500 shrink-0" />
                              )}
                            </div>
                            {perm.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {perm.description}
                              </p>
                            )}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[200px]">
                              <p className="text-xs">{perm.description || perm.label}</p>
                            </TooltipContent>
                          </Tooltip>
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

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t">
        {hasChanges && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Скинути зміни
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="outline" onClick={onCancel}>
          Скасувати
        </Button>
        <Button onClick={handleSave}>
          Застосувати
        </Button>
      </div>
    </div>
  );
};
