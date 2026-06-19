import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PartnerEngagementRequestsCard } from "./PartnerEngagementRequestsCard";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Clock, 
  CheckCircle,
  Shield,
  Eye,
  Edit,
  Trash2,
  Send,
  ArrowRightLeft,
  History,
  Copy,
  Link,
  Plus,
  ChevronDown,
  Loader2,
  XCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";
import { getTeamRolesForType } from "@/config/settingsConfig";
import { mockRegisteredUsers } from "@/config/userSettingsConfig";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  getRoleDefinition, 
  getPermissionLabel, 
  permissionGroups, 
  groupPermissionsByCategory, 
  type PermissionKey 
} from "@/config/teamRolesConfig";
import { getActiveDelegationsForCabinet } from "@/config/delegationsConfig";
import { getTeamAuditLogForCabinet, auditActionLabels, getExtendedTeamMembersForCabinet, type ExtendedTeamMember } from "@/config/teamMembersConfig";
import { useCabinetPermissions } from "@/hooks/useCabinetPermissions";
import { DelegationPanel } from "./DelegationPanel";
import { RolePermissionsEditor } from "./RolePermissionsEditor";
import { TeamNotificationSettings } from "./TeamNotificationSettings";
import { MemberProfilePage } from "./MemberProfilePage";
import { RoleCatalogDialog } from "./RoleCatalogDialog";
import { InvitePermissionsEditor } from "./InvitePermissionsEditor";
import { generateInviteCode } from "@/lib/inviteCodeGenerator";
import { generateTeamInviteEmailHtml } from "@/lib/emailTemplates";
import { supabase } from "@/integrations/supabase/client";

interface TeamAccessSectionProps {
  cabinet: Cabinet;
}

const statusConfig: Record<ExtendedTeamMember["status"], { label: string; variant: "default" | "secondary" | "outline"; icon: typeof CheckCircle; className?: string }> = {
  active: { label: "Активний", variant: "default", icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  invited: { label: "Запрошено", variant: "outline", icon: Clock, className: "border-blue-500/50 text-blue-700 dark:text-blue-400" },
  suspended: { label: "Призупинено", variant: "secondary", icon: Clock, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  left: { label: "Покинув", variant: "secondary", icon: Clock, className: "text-muted-foreground" },
};

export const TeamAccessSection = ({ cabinet }: TeamAccessSectionProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightRequestId = searchParams.get("request");
  const extendedMembers = getExtendedTeamMembersForCabinet(cabinet.id);
  const availableRoles = getTeamRolesForType(cabinet.type);
  const activeDelegations = getActiveDelegationsForCabinet(cabinet.id);
  const auditLog = getTeamAuditLogForCabinet(cabinet.id);
  
  // Permission checks
  const { 
    canInviteMembers, 
    canManageTeam, 
    canDelegate,
    isOwner 
  } = useCabinetPermissions(cabinet.id, cabinet.type);
  
  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteToken, setInviteToken] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteMethod, setInviteMethod] = useState<"system" | "link">("system");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Email preview state
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState("");
  
  // Role catalog state
  const [roleCatalogOpen, setRoleCatalogOpen] = useState(false);
  
  // Invite permissions preview/editor state
  const [showPermissionsPreview, setShowPermissionsPreview] = useState(false);
  const [editingInvitePermissions, setEditingInvitePermissions] = useState(false);
  const [customInvitePermissions, setCustomInvitePermissions] = useState<PermissionKey[]>([]);
  const [restrictedInvitePermissions, setRestrictedInvitePermissions] = useState<PermissionKey[]>([]);
  
  // New component states
  const [delegationPanelOpen, setDelegationPanelOpen] = useState(false);
  
  const [permissionsEditorOpen, setPermissionsEditorOpen] = useState(false);
  const [viewingMemberProfile, setViewingMemberProfile] = useState<ExtendedTeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<ExtendedTeamMember | null>(null);
  
  // Revoke invitation state
  const [revokingMember, setRevokingMember] = useState<ExtendedTeamMember | null>(null);
  
  const handleRevokeInvitation = (member: ExtendedTeamMember) => {
    setRevokingMember(member);
  };
  
  const confirmRevokeInvitation = () => {
    if (!revokingMember) return;
    
    toast.success(`Запрошення для ${revokingMember.email} відкликано`, {
      description: "Користувач більше не зможе скористатися запрошенням"
    });
    
    setRevokingMember(null);
  };
  
  // Live user lookup
  const foundUser = inviteEmail.trim().length > 3 
    ? mockRegisteredUsers.find(u => u.email.toLowerCase() === inviteEmail.trim().toLowerCase())
    : null;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim());

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const resetInviteDialog = () => {
    setInviteEmail("");
    setInviteRole("");
    setInviteMessage("");
    setInviteSuccess(false);
    setInviteToken("");
    setInviteCode("");
    setInviteMethod("system");
    setShowPermissionsPreview(false);
    setEditingInvitePermissions(false);
    setCustomInvitePermissions([]);
    setRestrictedInvitePermissions([]);
    setIsSendingEmail(false);
    setShowEmailPreview(false);
    setEmailPreviewHtml("");
  };

  // Reset custom permissions when role changes
  useEffect(() => {
    setCustomInvitePermissions([]);
    setRestrictedInvitePermissions([]);
    setShowPermissionsPreview(false);
  }, [inviteRole]);

  // Calculate effective permissions for invite
  const getEffectiveInvitePermissions = useMemo(() => {
    if (!inviteRole) return [];
    const roleDef = getRoleDefinition(inviteRole, cabinet.type);
    if (!roleDef) return [];
    
    const basePerms = roleDef.permissions;
    const allPerms = [...basePerms, ...customInvitePermissions];
    return [...new Set(allPerms)].filter(p => !restrictedInvitePermissions.includes(p));
  }, [inviteRole, cabinet.type, customInvitePermissions, restrictedInvitePermissions]);

  const hasCustomInvitePermissions = customInvitePermissions.length > 0 || restrictedInvitePermissions.length > 0;

  // Generate email preview
  const generateEmailPreview = () => {
    if (!inviteRole) {
      toast.error("Оберіть роль для користувача");
      return;
    }
    if (!inviteEmail.trim() || !isValidEmail) {
      toast.error("Введіть коректний email");
      return;
    }

    const roleLabel = availableRoles.find(r => r.id === inviteRole)?.label || inviteRole;
    const code = inviteCode || generateInviteCode();
    if (!inviteCode) setInviteCode(code);

    const html = generateTeamInviteEmailHtml({
      cabinetName: cabinet.name,
      cabinetType: cabinet.type,
      inviterName: foundUser?.name || "Власник кабінету",
      inviterRole: "Власник",
      inviteeEmail: inviteEmail.trim(),
      roleLabel,
      inviteCode: code,
      personalMessage: inviteMessage || undefined,
    });

    setEmailPreviewHtml(html);
    setShowEmailPreview(true);
  };

  const handleInvite = async () => {
    if (!inviteRole) {
      toast.error("Оберіть роль для користувача");
      return;
    }

    const roleLabel = availableRoles.find(r => r.id === inviteRole)?.label || inviteRole;
    
    // Generate invite code in ABC-123-XYZ format (use existing if from preview)
    const code = inviteCode || generateInviteCode();
    if (!inviteCode) setInviteCode(code);
    
    // Token for URL (includes code for lookup)
    const token = `${code}-${Date.now().toString(36)}`;
    setInviteToken(token);

    if (inviteMethod === "link") {
      // Generate link with code for manual sharing
      const link = `${window.location.origin}/add-cabinet?code=${code}`;
      navigator.clipboard.writeText(link);
      toast.success("Посилання скопійовано в буфер обміну", {
        description: `Код: ${code}. Роль: ${roleLabel}.`
      });
      setInviteSuccess(true);
      return;
    }

    // System method - requires email
    if (!inviteEmail.trim() || !isValidEmail) {
      toast.error("Введіть коректний email");
      return;
    }

    // Send email via Edge Function
    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-team-invite", {
        body: {
          cabinetId: cabinet.id,
          cabinetName: cabinet.name,
          cabinetType: cabinet.type,
          inviterName: foundUser?.name || "Власник кабінету",
          inviterRole: "Власник",
          inviteeEmail: inviteEmail.trim(),
          role: inviteRole,
          roleLabel,
          inviteCode: code,
          personalMessage: inviteMessage || undefined,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Помилка відправки запрошення");
        setIsSendingEmail(false);
        return;
      }

      if (data?.demo) {
        toast.info(`Демо-режим: email буде відправлено на ${inviteEmail}`, {
          description: "Для реальної відправки потрібен RESEND_API_KEY",
          duration: 5000,
        });
        toast.success(`Код запрошення: ${code}`, { duration: 5000 });
        setShowEmailPreview(false);
      } else if (data?.success) {
        toast.success(`Email-запрошення надіслано на ${inviteEmail}`);
        toast.info(`Код запрошення: ${code}`, { duration: 5000 });
        setShowEmailPreview(false);
      }

      setInviteSuccess(true);
    } catch (err) {
      console.error("Error sending invite:", err);
      toast.error("Помилка відправки запрошення");
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  const copyInviteLink = () => {
    const link = `${window.location.origin}/add-cabinet?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Посилання скопійовано");
  };
  
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success("Код скопійовано");
  };
  
  const generateQuickLink = () => {
    if (!inviteRole) {
      toast.error("Спочатку оберіть роль");
      return;
    }
    const code = generateInviteCode();
    setInviteCode(code);
    const link = `${window.location.origin}/add-cabinet?code=${code}`;
    navigator.clipboard.writeText(link);
    const roleLabel = availableRoles.find(r => r.id === inviteRole)?.label || inviteRole;
    toast.success("Посилання скопійовано", {
      description: `Код: ${code}. Роль: ${roleLabel}`
    });
  };

  const getRolePermissionsPreview = (roleId: string) => {
    const roleDef = getRoleDefinition(roleId, cabinet.type);
    if (!roleDef) return [];
    return roleDef.permissions.slice(0, 6);
  };
  
  const handleOpenPermissionsEditor = (member: ExtendedTeamMember) => {
    setSelectedMember(member);
    setPermissionsEditorOpen(true);
  };

  // If viewing a member profile, show the profile page
  if (viewingMemberProfile) {
    return (
      <MemberProfilePage
        member={viewingMemberProfile}
        cabinet={cabinet}
        onBack={() => setViewingMemberProfile(null)}
        onOpenDelegationPanel={() => setDelegationPanelOpen(true)}
        onOpenPermissionsEditor={() => {
          setSelectedMember(viewingMemberProfile);
          setPermissionsEditorOpen(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* Referral Bonus Banner - only for cabinet owners */}
      {isOwner && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-emerald-50/30 to-transparent dark:from-emerald-950/20 dark:via-emerald-950/10 dark:to-transparent">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">+5K кредитів за кожного учасника!</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                    Кредити нараховуються на ваш особистий баланс
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Бонуси за запрошених учасників нараховуються на ваш профіль. 
                  Ви можете конвертувати їх у будь-який кабінет, де ви є власником.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0 gap-1.5"
              onClick={() => {
                navigate(
                  buildUrlWithTrail(
                    "/dashboard?tab=user-settings&subtab=tariff&section=earnings&scrollTo=bonus-program",
                    {
                      label: "Команда та доступи",
                      url: window.location.pathname + window.location.search,
                    },
                  ),
                );
              }}
            >
              Детальніше
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Partner engagement requests (real-time) */}
      {isOwner && (
        <PartnerEngagementRequestsCard
          cabinetId={cabinet.id}
          highlightRequestId={highlightRequestId}
        />
      )}

      {/* Delegation Banner */}
      {activeDelegations.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="p-4 flex items-center gap-3">
            <ArrowRightLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Активні делегування: {activeDelegations.length}</p>
              <p className="text-xs text-muted-foreground">
                Деякі права тимчасово передано іншим учасникам
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDelegationPanelOpen(true)}>
              Переглянути
            </Button>
          </CardContent>
        </Card>
      )}
      

      {/* Team Members List with Action Buttons */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <CardTitle className="text-base min-w-0">Учасники ({extendedMembers.length})</CardTitle>
            <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
              {/* Demo Onboarding Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open("/specialist-onboarding", "_blank")}
                className="text-muted-foreground"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Демо</span>
              </Button>
              
              {/* Delegate Button */}
              {canDelegate && (
                <Button variant="outline" size="sm" onClick={() => setDelegationPanelOpen(true)}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Делегувати
                </Button>
              )}
              
              {/* Invite Dialog */}
              {canInviteMembers && (
                <Dialog open={inviteDialogOpen} onOpenChange={(open) => {
                  setInviteDialogOpen(open);
                  if (!open) resetInviteDialog();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Запросити
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Запросити до кабінету
                      </DialogTitle>
                      <DialogDescription>
                        Оберіть спосіб запрошення до "{cabinet.name}"
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                      {/* Invite Method Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Спосіб запрошення</Label>
                        <RadioGroup 
                          value={inviteMethod} 
                          onValueChange={(v) => setInviteMethod(v as "system" | "link")}
                          className="space-y-2"
                        >
                          <div className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            inviteMethod === "system" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          )}>
                            <RadioGroupItem value="system" id="method-system" />
                            <Label htmlFor="method-system" className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Через систему</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Надіслати email-запрошення автоматично
                              </p>
                            </Label>
                          </div>
                          <div className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            inviteMethod === "link" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          )}>
                            <RadioGroupItem value="link" id="method-link" />
                            <Label htmlFor="method-link" className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Link className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Отримати посилання</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Скопіювати та надіслати самостійно (Telegram, Viber тощо)
                              </p>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Role Selection - Always Required */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Роль *</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Оберіть роль" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {availableRoles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Permissions Preview - appears after role selection */}
                      {inviteRole && (
                        <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Дозволи ролі
                              {hasCustomInvitePermissions && (
                                <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-700 dark:text-amber-400">
                                  Змінено
                                </Badge>
                              )}
                            </Label>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowPermissionsPreview(!showPermissionsPreview)}
                              className="h-7 px-2"
                            >
                              {showPermissionsPreview ? "Сховати" : "Переглянути"}
                              <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", showPermissionsPreview && "rotate-180")} />
                            </Button>
                          </div>
                          
                          <Collapsible open={showPermissionsPreview}>
                            <CollapsibleContent className="pt-2 space-y-3">
                              {/* Permissions list by category */}
                              {Object.entries(groupPermissionsByCategory(getEffectiveInvitePermissions)).map(([groupId, permissions]) => {
                                const group = permissionGroups.find(g => g.id === groupId);
                                if (!group || permissions.length === 0) return null;
                                return (
                                  <div key={groupId} className="text-xs">
                                    <p className="font-medium text-muted-foreground mb-1">{group.label}</p>
                                    <div className="flex flex-wrap gap-1">
                                      {permissions.map(perm => (
                                        <Badge key={perm} variant="secondary" className="text-xs font-normal">
                                          {group.permissions.find(p => p.key === perm)?.label || perm}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Edit permissions button */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingInvitePermissions(true)}
                                className="w-full mt-2"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Налаштувати дозволи
                              </Button>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )}

                      {/* Email Input - Only for System Method */}
                      {inviteMethod === "system" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Email користувача *</Label>
                          <Input 
                            type="email" 
                            placeholder="user@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                          
                          {/* Live User Indication */}
                          {inviteEmail.trim().length > 3 && isValidEmail && (
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
                                      Отримає внутрішнє сповіщення та миттєвий доступ
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
                                      Буде надіслано email з посиланням для реєстрації
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Optional Message - Only for System Method */}
                      {inviteMethod === "system" && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Повідомлення <span className="text-muted-foreground font-normal">(опціонально)</span>
                          </Label>
                          <Textarea
                            placeholder="Наприклад: Вітаю! Запрошую вас до співпраці..."
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                      {inviteSuccess ? (
                        <div className="w-full space-y-3">
                          {/* Show generated code prominently */}
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center">
                            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                              Код запрошення створено:
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <code className="text-2xl font-mono font-bold tracking-wider text-green-800 dark:text-green-200">
                                {inviteCode}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={copyInviteCode}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              Учасник може ввести цей код на сторінці "Додати кабінет"
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyInviteLink} className="flex-1 gap-2">
                              <Link className="h-4 w-4" />
                              Скопіювати посилання
                            </Button>
                            <Button onClick={() => {
                              setInviteDialogOpen(false);
                              resetInviteDialog();
                            }} className="flex-1">
                              Готово
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                            Скасувати
                          </Button>
                          <Button 
                            onClick={inviteMethod === "link" ? handleInvite : generateEmailPreview} 
                            disabled={!inviteRole || (inviteMethod === "system" && !isValidEmail)}
                          >
                            {inviteMethod === "link" ? (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Скопіювати посилання
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Переглянути запрошення
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Email Preview Modal */}
              <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
                <DialogContent className="sm:max-w-2xl max-h-[85dvh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Превʼю email-запрошення
                    </DialogTitle>
                    <DialogDescription>
                      Перегляньте лист перед відправкою на {inviteEmail}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Email Preview in iframe */}
                  <div className="flex-1 min-h-0 border rounded-lg overflow-hidden bg-white">
                    <iframe
                      srcDoc={emailPreviewHtml}
                      className="w-full h-[400px] sm:h-[450px]"
                      title="Email Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                  
                  <DialogFooter className="flex-col gap-2 sm:flex-row pt-4">
                    <Button variant="outline" onClick={() => setShowEmailPreview(false)} className="sm:order-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Редагувати
                    </Button>
                    <Button onClick={handleInvite} disabled={isSendingEmail} className="sm:order-2">
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Відправка...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Надіслати запрошення
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {extendedMembers.map((member) => {
            const status = statusConfig[member.status];
            const StatusIcon = status.icon;
            const isCurrentMemberOwner = member.role === "director" || member.role === "owner";

            return (
              <div 
                key={member.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate" title={member.name}>{member.name}</p>
                      <Badge variant={status.variant} className={status.className}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate" title={member.email}>{member.email}</span>
                    </div>
                    {member.lastActive && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Активність: {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true, locale: uk })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">{member.roleLabel}</Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="font-medium text-sm mb-2">Дозволи ролі {member.roleLabel}:</p>
                      <ul className="text-xs space-y-1">
                        {getRolePermissionsPreview(member.role).map((perm) => (
                          <li key={perm} className="text-muted-foreground">
                            • {getPermissionLabel(perm)}
                          </li>
                        ))}
                        {getRolePermissionsPreview(member.role).length >= 6 && (
                          <li className="text-muted-foreground italic">та інші...</li>
                        )}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingMemberProfile(member)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Переглянути профіль
                      </DropdownMenuItem>
                      {canManageTeam && (
                        <DropdownMenuItem onClick={() => handleOpenPermissionsEditor(member)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Змінити роль / дозволи
                        </DropdownMenuItem>
                      )}
                      {canManageTeam && !isCurrentMemberOwner && (
                        <>
                          <DropdownMenuSeparator />
                          {member.status === "invited" ? (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleRevokeInvitation(member)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Відкликати запрошення
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => toast.info("Видалення доступу (demo)")}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Видалити доступ
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Roles Overview */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Доступні ролі</CardTitle>
            </div>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setRoleCatalogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Додати роль
              </Button>
            )}
          </div>
          <CardDescription>
            Ролі визначають рівень доступу до функцій кабінету
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableRoles.map((role) => (
              <div 
                key={role.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-all"
              >
                <div className="rounded-full bg-primary/10 p-2">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{role.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {extendedMembers.filter(m => m.role === role.id).length} користувач(ів)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Role Catalog Dialog */}
      <RoleCatalogDialog
        open={roleCatalogOpen}
        onOpenChange={setRoleCatalogOpen}
        cabinetType={cabinet.type}
        onAddRole={(role, customName, customPermissions) => {
          // In real app, would save to database
          toast.success(`Роль "${customName || role.label}" додано`);
        }}
      />

      {/* Access Stats */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <CardTitle className="text-base">Статистика доступу</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-green-600">
                {extendedMembers.filter(m => m.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Активних</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-yellow-600">
                {extendedMembers.filter(m => m.status === "invited").length}
              </p>
              <p className="text-sm text-muted-foreground">Запрошено</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">
                {availableRoles.length}
              </p>
              <p className="text-sm text-muted-foreground">Ролей</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Timeline */}
      {auditLog.length > 0 && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Остання активність</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLog.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{entry.actorName}</span>
                      {" "}
                      <span className="text-muted-foreground">{auditActionLabels[entry.action]}</span>
                      {entry.targetName && (
                        <>
                          {" "}
                          <span className="font-medium">{entry.targetName}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: uk })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Notification Settings - Consolidated from CabinetNotificationsSection */}
      <TeamNotificationSettings cabinet={cabinet} />
      
      {/* Delegation Panel Sheet */}
      <Sheet open={delegationPanelOpen} onOpenChange={setDelegationPanelOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Делегування повноважень
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <DelegationPanel cabinet={cabinet} />
          </div>
        </SheetContent>
      </Sheet>
      
      
      {/* Role Permissions Editor Sheet */}
      <Sheet open={permissionsEditorOpen} onOpenChange={setPermissionsEditorOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Редагування дозволів
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {selectedMember && (
              <RolePermissionsEditor
                member={selectedMember}
                cabinetType={cabinet.type}
                onSave={(custom, restricted) => {
                  toast.success("Дозволи оновлено");
                  setPermissionsEditorOpen(false);
                }}
                onCancel={() => setPermissionsEditorOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Invite Permissions Editor Sheet */}
      <Sheet open={editingInvitePermissions} onOpenChange={setEditingInvitePermissions}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Налаштування дозволів для запрошення
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {inviteRole && (
              <InvitePermissionsEditor
                roleKey={inviteRole}
                cabinetType={cabinet.type}
                customPermissions={customInvitePermissions}
                restrictedPermissions={restrictedInvitePermissions}
                onSave={(custom, restricted) => {
                  setCustomInvitePermissions(custom);
                  setRestrictedInvitePermissions(restricted);
                  setEditingInvitePermissions(false);
                }}
                onCancel={() => setEditingInvitePermissions(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Revoke Invitation Confirmation */}
      <AlertDialog open={!!revokingMember} onOpenChange={(open) => !open && setRevokingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Відкликати запрошення?</AlertDialogTitle>
            <AlertDialogDescription>
              Запрошення для <strong>{revokingMember?.email}</strong> на роль "{revokingMember?.roleLabel}" буде скасовано. 
              Користувач більше не зможе приєднатися за цим запрошенням.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRevokeInvitation}
            >
              Відкликати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
