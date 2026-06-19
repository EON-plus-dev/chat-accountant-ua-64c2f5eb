import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronRight, LogOut, Check, X, Clock, Mail, 
  MoreHorizontal, UserPlus, Info, CheckCircle, Send
} from "lucide-react";
import { mockCabinets } from "@/config/cabinetsData";
import { cn } from "@/lib/utils";
import { entityStyles } from "@/config/entityStyles";
import { toast } from "sonner";
import { demoInvitations, demoPendingRequests, CabinetMembership, cabinetAccessRoles, mockRegisteredUsers } from "@/config/userSettingsConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CabinetType } from "@/types/cabinet";

import AccessDetailsDialog from "./AccessDetailsDialog";

import type { Cabinet } from "@/types/cabinet";

interface LinkedCabinetsSectionProps {
  onCabinetEnter?: (cabinet: Cabinet) => void;
}

const LinkedCabinetsSection = ({ onCabinetEnter }: LinkedCabinetsSectionProps) => {
  const [invitations, setInvitations] = useState<CabinetMembership[]>(demoInvitations);
  const [pendingRequests, setPendingRequests] = useState<CabinetMembership[]>(demoPendingRequests);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedCabinet, setSelectedCabinet] = useState<{ id: string; name: string } | null>(null);
  
  // Access details dialog state
  const [accessDetailsOpen, setAccessDetailsOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<{
    id: string;
    name: string;
    type: CabinetType;
    roleLabel: string;
  } | null>(null);
  
  // Join dialog state
  const [joinEmail, setJoinEmail] = useState("");
  const [joinRole, setJoinRole] = useState("accountant");
  const [joinMessage, setJoinMessage] = useState("");
  
  // Live user lookup
  const foundUser = joinEmail.trim().length > 3 
    ? mockRegisteredUsers.find(u => u.email.toLowerCase() === joinEmail.trim().toLowerCase())
    : null;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(joinEmail.trim());

  const handleOpenCabinet = (cabinetId: string) => {
    const cabinet = mockCabinets.find(c => c.id === cabinetId);
    if (cabinet && onCabinetEnter) {
      onCabinetEnter(cabinet);
    } else {
      toast.info("Перехід до кабінету (демо)");
    }
  };

  const handleAcceptInvitation = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.success("Запрошення прийнято! (демо)");
  };

  const handleDeclineInvitation = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.info("Запрошення відхилено");
  };

  const handleCancelRequest = (requestId: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    toast.info("Запит скасовано");
  };

  const handleLeaveCabinet = () => {
    if (selectedCabinet) {
      toast.success(`Ви вийшли з кабінету "${selectedCabinet.name}" (демо)`);
      setLeaveDialogOpen(false);
      setSelectedCabinet(null);
    }
  };

  const handleJoinRequest = () => {
    if (!joinEmail.trim() || !isValidEmail) {
      toast.error("Введіть коректний email");
      return;
    }
    
    const roleLabel = cabinetAccessRoles.find(r => r.value === joinRole)?.label || joinRole;
    
    if (foundUser) {
      // Existing user - internal notification
      toast.success(`Запит надіслано користувачу ${foundUser.name}`);
    } else {
      // New user - email invitation
      toast.success(`Email-запрошення надіслано на ${joinEmail}`);
      toast.info("Користувач отримає посилання для реєстрації", { duration: 5000 });
    }
    
    setJoinDialogOpen(false);
    resetJoinDialog();
  };

  const resetJoinDialog = () => {
    setJoinEmail("");
    setJoinRole("accountant");
    setJoinMessage("");
  };

  const formatTimeAgo = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "сьогодні";
    if (diffDays === 1) return "вчора";
    if (diffDays < 7) return `${diffDays} дн. тому`;
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">Активний</Badge>;
      case "tasks":
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">Потребує уваги</Badge>;
      default:
        return <Badge variant="outline">Активний</Badge>;
    }
  };

  const renderTypeBadge = (type: CabinetType) => {
    const style = entityStyles[type];
    if (!style) return null;
    const Icon = style.icon;
    return (
      <Badge variant="outline" className={cn("gap-1", style.badgeClass)}>
        <Icon className="w-3.5 h-3.5" />
        {style.label}
      </Badge>
    );
  };

  const renderMembershipIcon = (type: CabinetType, className?: string) => {
    const style = entityStyles[type];
    if (!style) return null;
    const Icon = style.icon;
    return <Icon className={cn("w-5 h-5", style.color, className)} />;
  };

  return (
    <div className="space-y-6">
      {/* Активні кабінети */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Активні кабінети
                <Badge variant="secondary" className="text-xs">{mockCabinets.length}</Badge>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Кабінети, до яких ви маєте доступ
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setJoinDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Приєднатися
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead compact>Назва</TableHead>
                  <TableHead compact>Тип</TableHead>
                  <TableHead compact>Моя роль</TableHead>
                  <TableHead compact>Статус</TableHead>
                  <TableHead compact className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCabinets.map((cabinet) => (
                  <TableRow 
                    key={cabinet.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => handleOpenCabinet(cabinet.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenCabinet(cabinet.id)}
                  >
                    <TableCell compact className="font-medium">
                      <div className="flex items-center gap-2">
                        {cabinet.name}
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </TableCell>
                    <TableCell compact>{renderTypeBadge(cabinet.type)}</TableCell>
                    <TableCell compact className="text-muted-foreground">{cabinet.roleLabel}</TableCell>
                    <TableCell compact>{getStatusBadge(cabinet.reportStatus)}</TableCell>
                    <TableCell compact onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => {
                              setSelectedForDetails({
                                id: cabinet.id,
                                name: cabinet.name,
                                type: cabinet.type,
                                roleLabel: cabinet.roleLabel
                              });
                              setAccessDetailsOpen(true);
                            }}
                          >
                            <Info className="w-4 h-4" />
                            Деталі доступу
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive gap-2"
                            onClick={() => {
                              setSelectedCabinet({ id: cabinet.id, name: cabinet.name });
                              setLeaveDialogOpen(true);
                            }}
                          >
                            <LogOut className="w-4 h-4" />
                            Вийти з кабінету
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
          </div>

          {/* Mobile Cards - Fully clickable */}
          <div className="md:hidden space-y-3">
            {mockCabinets.map((cabinet) => (
              <div 
                key={cabinet.id}
                className="p-3 rounded-lg border space-y-2 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group"
                onClick={() => handleOpenCabinet(cabinet.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOpenCabinet(cabinet.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{cabinet.name}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground">{cabinet.roleLabel}</p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => {
                            setSelectedForDetails({
                              id: cabinet.id,
                              name: cabinet.name,
                              type: cabinet.type,
                              roleLabel: cabinet.roleLabel
                            });
                            setAccessDetailsOpen(true);
                          }}
                        >
                          <Info className="w-4 h-4" />
                          Деталі доступу
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive gap-2"
                          onClick={() => {
                            setSelectedCabinet({ id: cabinet.id, name: cabinet.name });
                            setLeaveDialogOpen(true);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Вийти з кабінету
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderTypeBadge(cabinet.type)}
                  {getStatusBadge(cabinet.reportStatus)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Запрошення до мене */}
      {invitations.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Запрошення до мене
              <Badge className="bg-primary text-primary-foreground text-xs">{invitations.length}</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Вас запросили приєднатися до цих кабінетів
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invitation) => (
              <div 
                key={invitation.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-primary/5"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {renderMembershipIcon(invitation.cabinetType)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{invitation.cabinetName}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>Роль: {invitation.roleLabel}</span>
                      <span>·</span>
                      <span>Від: {invitation.invitedBy}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(invitation.invitedAt!)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                    onClick={() => handleDeclineInvitation(invitation.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Відхилити
                  </Button>
                  <Button 
                    size="sm"
                    className="h-8"
                    onClick={() => handleAcceptInvitation(invitation.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Прийняти
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Мої запити */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Мої запити
              <Badge variant="secondary" className="text-xs">{pendingRequests.length}</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Запити на приєднання, що очікують підтвердження
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div 
                key={request.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {renderMembershipIcon(request.cabinetType)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{request.cabinetName}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>Роль: {request.roleLabel}</span>
                      <span>·</span>
                      <span>Надіслано: {formatTimeAgo(request.requestedAt!)}</span>
                    </div>
                    {request.requestMessage && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{request.requestMessage}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Очікує
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={() => handleCancelRequest(request.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Скасувати
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Примітка:</span>{" "}
            Налаштування інтеграцій, реквізитів та КЕП виконуються на рівні Кабінету. 
            Перейдіть у потрібний кабінет для доступу до цих налаштувань.
          </p>
        </CardContent>
      </Card>

      {/* Join Cabinet Dialog - Simplified with live user indication */}
      <Dialog open={joinDialogOpen} onOpenChange={(open) => {
        setJoinDialogOpen(open);
        if (!open) resetJoinDialog();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Приєднатися до кабінету
            </DialogTitle>
            <DialogDescription>
              Надішліть запит власнику кабінету для отримання доступу
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            {/* Email Input with Live Indication */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email власника або користувача *</Label>
              <Input
                type="email"
                placeholder="owner@company.com"
                value={joinEmail}
                onChange={(e) => setJoinEmail(e.target.value)}
              />
              
              {/* Live User Indication */}
              {joinEmail.trim().length > 3 && isValidEmail && (
                <div className={cn(
                  "flex items-start gap-2 p-3 rounded-lg text-sm",
                  foundUser 
                    ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" 
                    : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                )}>
                  {foundUser ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">
                          Користувача знайдено: {foundUser.name}
                        </p>
                        <p className="text-green-600 dark:text-green-400 text-xs mt-0.5">
                          Отримає внутрішнє сповіщення в системі
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">
                          Користувача не знайдено в системі
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                          Буде надіслано email-запрошення з посиланням для реєстрації
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Яку роль ви хочете отримати? *</Label>
              <Select value={joinRole} onValueChange={setJoinRole}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {cabinetAccessRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span>{role.label}</span>
                        <span className="text-xs text-muted-foreground">{role.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Повідомлення власнику <span className="text-muted-foreground font-normal">(опціонально)</span>
              </Label>
              <Textarea
                placeholder="Наприклад: Я ваш бухгалтер, хочу отримати доступ для ведення обліку"
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleJoinRequest} disabled={!isValidEmail}>
              Надіслати запит
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Cabinet Confirmation */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вийти з кабінету?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви втратите доступ до кабінету "{selectedCabinet?.name}". 
              Для повторного доступу потрібно буде отримати нове запрошення від власника.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLeaveCabinet}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Вийти з кабінету
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Access Details Dialog */}
      <AccessDetailsDialog
        open={accessDetailsOpen}
        onOpenChange={setAccessDetailsOpen}
        cabinet={selectedForDetails}
      />
    </div>
  );
};

export default LinkedCabinetsSection;