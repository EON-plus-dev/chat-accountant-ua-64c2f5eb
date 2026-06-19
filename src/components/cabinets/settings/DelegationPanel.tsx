import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  ArrowRightLeft, 
  Calendar, 
  Check, 
  Clock, 
  Plus, 
  User, 
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { useDelegations, type CreateDelegationInput } from "@/hooks/useDelegations";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { 
  type Delegation,
  type DelegationReason,
  delegationReasons,
  getDelegationStatusInfo,
  formatDelegationPeriod,
} from "@/config/delegationsConfig";
import { 
  permissionGroups, 
  type PermissionKey,
  getPermissionsForRole,
} from "@/config/teamRolesConfig";

interface DelegationPanelProps {
  cabinet: Cabinet;
}

export const DelegationPanel = ({ cabinet }: DelegationPanelProps) => {
  const { 
    activeDelegations, 
    scheduledDelegations, 
    expiredDelegations,
    revokedDelegations,
    delegationsFromMe,
    createDelegation,
    revokeDelegation,
    canCreateDelegation,
  } = useDelegations(cabinet.id);
  
  const { activeMembers } = useTeamManagement(cabinet);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<DelegationReason>("vacation");
  const [customReason, setCustomReason] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [delegateAll, setDelegateAll] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  
  // Current user ID (demo)
  const currentUserId = "user-5";
  const eligibleDelegates = activeMembers.filter(m => m.userId !== currentUserId);
  
  const handleCreateDelegation = () => {
    if (!selectedDelegate || !dateFrom || !dateTo) return;
    
    const input: CreateDelegationInput = {
      delegateId: selectedDelegate,
      delegatedPermissions: delegateAll ? "all" : selectedPermissions,
      reason: selectedReason,
      customReason: selectedReason === "other" ? customReason : undefined,
      validFrom: dateFrom.toISOString(),
      validUntil: dateTo.toISOString(),
    };
    
    createDelegation(input);
    setCreateDialogOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setSelectedDelegate("");
    setSelectedReason("vacation");
    setCustomReason("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setDelegateAll(true);
    setSelectedPermissions([]);
  };
  
  const togglePermission = (permission: PermissionKey) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };
  
  // Get my permissions for delegation options
  const myPermissions = getPermissionsForRole("director", cabinet.type);
  
  const renderDelegationCard = (delegation: Delegation) => {
    const statusInfo = getDelegationStatusInfo(delegation);
    const isFromMe = delegation.delegatorId === currentUserId;
    
    const statusColors = {
      green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      gray: "bg-muted text-muted-foreground",
      red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
    
    const StatusIcon = statusInfo.color === "green" ? CheckCircle2 
      : statusInfo.color === "blue" ? CalendarClock
      : statusInfo.color === "red" ? XCircle
      : Clock;
    
    return (
      <div key={delegation.id} className="p-4 border rounded-lg space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {isFromMe ? (
                  <>Делеговано для: {delegation.delegateName}</>
                ) : (
                  <>Від: {delegation.delegatorName}</>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {isFromMe ? delegation.delegateRoleLabel : delegation.delegatorRoleLabel}
              </p>
            </div>
          </div>
          <Badge className={cn("gap-1", statusColors[statusInfo.color])}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDelegationPeriod(delegation)}
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {delegation.reasonLabel}
          </div>
        </div>
        
        <div className="text-sm">
          <span className="text-muted-foreground">Дозволи: </span>
          {delegation.delegatedPermissions === "all" ? (
            <Badge variant="outline">Усі права ролі</Badge>
          ) : (
            <span>{delegation.delegatedPermissions.length} дозволів</span>
          )}
        </div>
        
        {delegation.status === "active" && isFromMe && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive"
            onClick={() => revokeDelegation(delegation.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Скасувати
          </Button>
        )}
      </div>
    );
  };
  
  const historyDelegations = [...expiredDelegations, ...revokedDelegations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Делегування повноважень
            </CardTitle>
            <CardDescription>
              Тимчасова передача прав іншим учасникам команди
            </CardDescription>
          </div>
          {canCreateDelegation && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Створити делегування
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Нове делегування</DialogTitle>
                  <DialogDescription>
                    Тимчасово передайте свої повноваження іншому учаснику
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Delegate selection */}
                  <div className="space-y-2">
                    <Label>Кому делегувати</Label>
                    <Select value={selectedDelegate} onValueChange={setSelectedDelegate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Оберіть учасника" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleDelegates.map(member => (
                          <SelectItem key={member.id} value={member.userId}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {member.name}
                              <span className="text-muted-foreground">({member.roleLabel})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Reason */}
                  <div className="space-y-2">
                    <Label>Причина</Label>
                    <Select value={selectedReason} onValueChange={(v) => setSelectedReason(v as DelegationReason)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {delegationReasons.map(reason => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedReason === "other" && (
                      <Textarea
                        placeholder="Вкажіть причину..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                      />
                    )}
                  </div>
                  
                  {/* Date range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Дата початку</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "dd.MM.yyyy", { locale: uk }) : "Оберіть дату"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Дата завершення</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "dd.MM.yyyy", { locale: uk }) : "Оберіть дату"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  {/* Permissions */}
                  <div className="space-y-2">
                    <Label>Які дозволи делегувати</Label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox 
                        id="delegate-all" 
                        checked={delegateAll}
                        onCheckedChange={(checked) => setDelegateAll(!!checked)}
                      />
                      <label htmlFor="delegate-all" className="text-sm font-medium cursor-pointer">
                        Усі мої повноваження
                      </label>
                    </div>
                    
                    {!delegateAll && (
                      <ScrollArea className="h-48 border rounded-md p-3">
                        <div className="space-y-4">
                          {permissionGroups.map(group => {
                            const groupPermissions = group.permissions.filter(p => 
                              myPermissions.includes(p.key)
                            );
                            if (groupPermissions.length === 0) return null;
                            
                            return (
                              <div key={group.id}>
                                <p className="text-sm font-medium mb-2">{group.label}</p>
                                <div className="space-y-1">
                                  {groupPermissions.map(p => (
                                    <div key={p.key} className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={p.key}
                                        checked={selectedPermissions.includes(p.key)}
                                        onCheckedChange={() => togglePermission(p.key)}
                                      />
                                      <label htmlFor={p.key} className="text-sm cursor-pointer">
                                        {p.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Скасувати
                  </Button>
                  <Button 
                    onClick={handleCreateDelegation}
                    disabled={!selectedDelegate || !dateFrom || !dateTo || (!delegateAll && selectedPermissions.length === 0)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Створити
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="gap-1">
              Активні
              {activeDelegations.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {activeDelegations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-1">
              Заплановані
              {scheduledDelegations.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {scheduledDelegations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Історія</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4 space-y-3">
            {activeDelegations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Немає активних делегувань</p>
              </div>
            ) : (
              activeDelegations.map(renderDelegationCard)
            )}
          </TabsContent>
          
          <TabsContent value="scheduled" className="mt-4 space-y-3">
            {scheduledDelegations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Немає запланованих делегувань</p>
              </div>
            ) : (
              scheduledDelegations.map(renderDelegationCard)
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4 space-y-3">
            {historyDelegations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Історія делегувань порожня</p>
              </div>
            ) : (
              historyDelegations.slice(0, 5).map(renderDelegationCard)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
