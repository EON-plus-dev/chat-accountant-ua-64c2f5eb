import { useState, useMemo } from "react";
import { Check, Lock, Minus, Shield, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CabinetType } from "@/types/cabinet";
import type { ExtendedTeamMember } from "@/config/teamMembersConfig";
import { 
  type PermissionKey,
  permissionGroups,
  getPermissionsForRole,
  getRoleDefinition,
  roleColorClasses,
} from "@/config/teamRolesConfig";

interface RolePermissionsEditorProps {
  member: ExtendedTeamMember;
  cabinetType: CabinetType;
  onSave?: (customPermissions: PermissionKey[], restrictedPermissions: PermissionKey[]) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export const RolePermissionsEditor = ({
  member,
  cabinetType,
  onSave,
  onCancel,
  readOnly = false,
}: RolePermissionsEditorProps) => {
  const roleDefinition = getRoleDefinition(member.role, cabinetType);
  const basePermissions = getPermissionsForRole(member.role, cabinetType);
  
  const [customPermissions, setCustomPermissions] = useState<PermissionKey[]>(
    member.customPermissions || []
  );
  const [restrictedPermissions, setRestrictedPermissions] = useState<PermissionKey[]>(
    member.restrictedPermissions || []
  );
  
  // Effective permissions calculation
  const effectivePermissions = useMemo(() => {
    const all = [...basePermissions, ...customPermissions];
    return [...new Set(all)].filter(p => !restrictedPermissions.includes(p));
  }, [basePermissions, customPermissions, restrictedPermissions]);
  
  const toggleCustomPermission = (permission: PermissionKey) => {
    if (readOnly) return;
    if (basePermissions.includes(permission)) return; // Can't add if already from role
    
    setCustomPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
    // Remove from restricted if adding as custom
    setRestrictedPermissions(prev => prev.filter(p => p !== permission));
  };
  
  const toggleRestrictedPermission = (permission: PermissionKey) => {
    if (readOnly) return;
    
    setRestrictedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
    // Remove from custom if restricting
    setCustomPermissions(prev => prev.filter(p => p !== permission));
  };
  
  const getPermissionStatus = (permission: PermissionKey): "base" | "custom" | "restricted" | "available" => {
    if (restrictedPermissions.includes(permission)) return "restricted";
    if (customPermissions.includes(permission)) return "custom";
    if (basePermissions.includes(permission)) return "base";
    return "available";
  };
  
  const handleSave = () => {
    onSave?.(customPermissions, restrictedPermissions);
  };
  
  const hasChanges = 
    JSON.stringify(customPermissions.sort()) !== JSON.stringify((member.customPermissions || []).sort()) ||
    JSON.stringify(restrictedPermissions.sort()) !== JSON.stringify((member.restrictedPermissions || []).sort());
  
  const roleColors = roleDefinition?.color 
    ? roleColorClasses[roleDefinition.color] 
    : roleColorClasses.gray;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Дозволи: {member.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              Роль: 
              <Badge className={cn(roleColors.bg, roleColors.text, "border", roleColors.border)}>
                {roleDefinition?.label || member.roleLabel}
              </Badge>
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Базових: {basePermissions.length}</p>
            <p>Ефективних: {effectivePermissions.length}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/50 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-primary bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
            <span>Від ролі</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span>Додатковий</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-destructive bg-destructive flex items-center justify-center">
              <X className="h-3 w-3 text-white" />
            </div>
            <span>Заборонений</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-muted-foreground/30" />
            <span>Доступний</span>
          </div>
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="multiple" defaultValue={permissionGroups.map(g => g.id)} className="w-full">
            {permissionGroups.map(group => (
              <AccordionItem key={group.id} value={group.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{group.label}</span>
                    <Badge variant="outline" className="ml-2">
                      {group.permissions.filter(p => effectivePermissions.includes(p.key)).length}
                      /{group.permissions.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {group.permissions.map(permission => {
                      const status = getPermissionStatus(permission.key);
                      const isEffective = effectivePermissions.includes(permission.key);
                      
                      return (
                        <div 
                          key={permission.key}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-md border",
                            status === "restricted" && "bg-destructive/5 border-destructive/20",
                            status === "custom" && "bg-green-500/5 border-green-500/20",
                            status === "base" && "bg-primary/5 border-primary/20",
                            status === "available" && "bg-muted/30"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    {status === "base" ? (
                                      <div className="h-5 w-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
                                        <Lock className="h-3 w-3 text-primary-foreground" />
                                      </div>
                                    ) : status === "custom" ? (
                                      <Checkbox 
                                        checked 
                                        onCheckedChange={() => toggleCustomPermission(permission.key)}
                                        disabled={readOnly}
                                        className="border-green-500 data-[state=checked]:bg-green-500"
                                      />
                                    ) : status === "restricted" ? (
                                      <div 
                                        className={cn(
                                          "h-5 w-5 rounded border-2 border-destructive bg-destructive flex items-center justify-center",
                                          !readOnly && "cursor-pointer"
                                        )}
                                        onClick={() => toggleRestrictedPermission(permission.key)}
                                      >
                                        <X className="h-3 w-3 text-white" />
                                      </div>
                                    ) : (
                                      <Checkbox 
                                        checked={false}
                                        onCheckedChange={() => toggleCustomPermission(permission.key)}
                                        disabled={readOnly}
                                      />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {status === "base" && "Дозвіл від ролі (не можна змінити)"}
                                  {status === "custom" && "Додатковий дозвіл (клікніть щоб прибрати)"}
                                  {status === "restricted" && "Заборонений дозвіл (клікніть щоб дозволити)"}
                                  {status === "available" && "Клікніть щоб додати дозвіл"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <div>
                              <p className={cn(
                                "text-sm font-medium",
                                status === "restricted" && "line-through text-muted-foreground"
                              )}>
                                {permission.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Restrict button for base permissions */}
                          {status === "base" && !readOnly && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => toggleRestrictedPermission(permission.key)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Заборонити цей дозвіл</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
        
        {!readOnly && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hasChanges ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    Є незбережені зміни
                  </span>
                ) : (
                  "Без змін"
                )}
              </div>
              <div className="flex gap-2">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    Скасувати
                  </Button>
                )}
                <Button onClick={handleSave} disabled={!hasChanges}>
                  <Check className="h-4 w-4 mr-2" />
                  Зберегти
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
