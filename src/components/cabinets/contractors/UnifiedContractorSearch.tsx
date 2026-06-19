import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Briefcase,
  User,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Mail,
  Send,
  Gift,
  Copy,
  Link2,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";
import {
  searchContractorUnified,
  isValidSearchQuery,
  getCodeTypeLabel,
  type UnifiedSearchResult,
} from "@/lib/contractorSearch";
import { contractorRoleOptions } from "@/config/contractorFormSchema";
import { generateInviteCode } from "@/lib/inviteCodeGenerator";
import { generateContractorInviteEmailHtml } from "@/lib/emailTemplates";

interface UnifiedContractorSearchProps {
  cabinet: Cabinet;
  onSuccess?: () => void;
  onCancel?: () => void;
  onNavigateToContractor?: (contractor: Contractor) => void;
}

const typeIcons = {
  legal: Building2,
  fop: Briefcase,
  individual: User,
};

const typeLabels = {
  legal: "Юридична особа",
  fop: "ФОП",
  individual: "Фізична особа",
};

const relationshipLabels = {
  buyer: "Покупець",
  supplier: "Постачальник",
  both: "Покупець і постачальник",
};

export const UnifiedContractorSearch = ({
  cabinet,
  onSuccess,
  onCancel,
  onNavigateToContractor,
}: UnifiedContractorSearchProps) => {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<UnifiedSearchResult>({ status: "idle" });
  const [isSearching, setIsSearching] = useState(false);
  
  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [preferredEmail, setPreferredEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"buyer" | "supplier" | "both">("buyer");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteMethod, setInviteMethod] = useState<"system" | "link">("system");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Email preview
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailPreviewHtml, setEmailPreviewHtml] = useState("");
  
  // Add to database state (for registry match)
  const [addRole, setAddRole] = useState<"buyer" | "supplier" | "both">("buyer");
  const [alsoInvite, setAlsoInvite] = useState(false);
  
  // Debounced search
  useEffect(() => {
    if (!isValidSearchQuery(query)) {
      setSearchResult({ status: "idle" });
      setShowInviteForm(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setSearchResult({ status: "searching" });
      
      try {
        const result = await searchContractorUnified(query, cabinet);
        setSearchResult(result);
        setShowInviteForm(false);
        
        // Pre-fill email from registry if available
        if (result.registryMatch?.email) {
          setPreferredEmail("");
          setInviteEmail(result.registryMatch.email);
        }
      } catch {
        toast.error("Помилка пошуку");
        setSearchResult({ status: "idle" });
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [query, cabinet]);
  
  const handleQueryChange = (value: string) => {
    // Allow both text and numbers
    setQuery(value);
  };
  
  const getEffectiveEmail = () => {
    return preferredEmail || inviteEmail || searchResult.registryMatch?.email || "";
  };
  
  const handleRequestAccess = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Запит на доступ надіслано", {
      description: "Контрагент отримає сповіщення",
    });
    setIsSubmitting(false);
    onSuccess?.();
  };
  
  const handleGenerateCode = () => {
    if (!inviteCode) {
      const code = generateInviteCode();
      setInviteCode(code);
      return code;
    }
    return inviteCode;
  };
  
  const handleShowEmailPreview = () => {
    const email = getEffectiveEmail();
    if (!email) {
      toast.error("Введіть email контрагента для превʼю");
      return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Невірний формат email");
      return;
    }
    
    const code = handleGenerateCode();
    
    const html = generateContractorInviteEmailHtml({
      inviterCabinetName: cabinet.name,
      inviterCabinetType: cabinet.type,
      inviterName: "Власник кабінету",
      contractorName: searchResult.registryMatch?.name,
      contractorCode: searchResult.registryMatch?.code || searchResult.searchedCode,
      inviteeEmail: email,
      inviteCode: code,
      relationshipType: alsoInvite ? addRole : inviteRole,
      personalMessage: inviteMessage || undefined,
    });
    
    setEmailPreviewHtml(html);
    setShowEmailPreview(true);
  };
  
  const handleAddFromRegistry = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    
    if (alsoInvite) {
      const code = handleGenerateCode();
      const email = getEffectiveEmail();
      
      if (inviteMethod === "link") {
        const link = `${window.location.origin}/contractor-onboarding?code=${code}`;
        navigator.clipboard.writeText(link);
        toast.success("Контрагента додано, посилання скопійовано", {
          description: `Код: ${code}`,
        });
      } else {
        if (!email) {
          toast.error("Введіть email для надсилання запрошення");
          setIsSubmitting(false);
          return;
        }
        toast.success("Контрагента додано та запрошено", {
          description: `Запрошення надіслано на ${email}`,
        });
      }
    } else {
      toast.success("Контрагента додано до бази", {
        description: searchResult.registryMatch?.name,
      });
    }
    
    setIsSubmitting(false);
    onSuccess?.();
  };
  
  const handleInviteAnyway = async () => {
    const email = getEffectiveEmail();
    const code = handleGenerateCode();
    
    if (inviteMethod === "link") {
      const link = `${window.location.origin}/contractor-onboarding?code=${code}`;
      navigator.clipboard.writeText(link);
      toast.success("Посилання скопійовано", {
        description: `Код: ${code}`,
      });
      onSuccess?.();
      return;
    }
    
    if (!email) {
      toast.error("Введіть email контрагента");
      return;
    }
    
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    
    toast.success("Запрошення надіслано", {
      description: `Контрагент отримає лист на ${email}`,
    });
    
    setIsSubmitting(false);
    onSuccess?.();
  };
  
  const handleResendInvitation = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Запрошення надіслано повторно");
    setIsSubmitting(false);
  };
  
  const handleCopyInviteLink = () => {
    const code = handleGenerateCode();
    const link = `${window.location.origin}/contractor-onboarding?code=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Посилання скопійовано");
  };
  
  const TypeIcon = searchResult.registryMatch?.type 
    ? typeIcons[searchResult.registryMatch.type]
    : searchResult.systemMatch?.type 
      ? typeIcons[searchResult.systemMatch.type]
      : searchResult.cabinetMatch?.contractor.type
        ? typeIcons[searchResult.cabinetMatch.contractor.type]
        : Building2;

  return (
    <>
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
          <div className="space-y-6 py-4">
            {/* Search Input */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Введіть ЄДРПОУ, ІПН або назву"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="pl-10 text-base"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {searchResult.status === "idle" && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    Ваша база
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                    Система
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                    Реєстри ЄДР
                  </span>
                </p>
              )}
            </div>
            
            {/* Searching State */}
            {searchResult.status === "searching" && (
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">Пошук...</p>
                  <p className="text-xs text-muted-foreground">
                    Перевірка бази, системи та реєстрів
                  </p>
                </div>
              </div>
            )}
            
            {/* Found in Cabinet - Synced */}
            {searchResult.status === "found_cabinet_synced" && searchResult.cabinetMatch && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Контрагент синхронізований
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Вже у вашій базі з повним доступом до даних
                      </p>
                    </div>
                  </div>
                </div>
                
                <ContractorPreviewCard contractor={searchResult.cabinetMatch.contractor} />
                
                <Button 
                  className="w-full" 
                  onClick={() => onNavigateToContractor?.(searchResult.cabinetMatch!.contractor)}
                >
                  Перейти до профілю
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
            
            {/* Found in Cabinet - Not Synced */}
            {searchResult.status === "found_cabinet_not_synced" && searchResult.cabinetMatch && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Контрагент у базі, не синхронізований
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Запросіть для отримання актуальних реквізитів
                      </p>
                    </div>
                  </div>
                </div>
                
                <ContractorPreviewCard contractor={searchResult.cabinetMatch.contractor} />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1" 
                    onClick={() => onNavigateToContractor?.(searchResult.cabinetMatch!.contractor)}
                  >
                    Перейти
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleRequestAccess}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Запросити синхронізацію
                  </Button>
                </div>
              </div>
            )}
            
            {/* Found in Cabinet - Pending */}
            {searchResult.status === "found_cabinet_pending" && searchResult.cabinetMatch && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Очікує реєстрації
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Запрошення надіслано, контрагент ще не зареєструвався
                      </p>
                    </div>
                  </div>
                </div>
                
                <ContractorPreviewCard contractor={searchResult.cabinetMatch.contractor} />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1" 
                    onClick={() => onNavigateToContractor?.(searchResult.cabinetMatch!.contractor)}
                  >
                    Перейти
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleResendInvitation}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Надіслати повторно
                  </Button>
                </div>
              </div>
            )}
            
            {/* Found in System */}
            {searchResult.status === "found_system" && searchResult.systemMatch && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Зареєстрований в системі
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Дані приватні — надішліть запит на доступ
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full p-2 bg-primary/10 text-primary">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{searchResult.systemMatch.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {getCodeTypeLabel(searchResult.systemMatch.code)}: {searchResult.systemMatch.code}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {typeLabels[searchResult.systemMatch.type]}
                    </Badge>
                  </div>
                </div>
                
                
                <Button 
                  className="w-full"
                  onClick={handleRequestAccess}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Запросити доступ
                </Button>
              </div>
            )}
            
            {/* Found in Registry (EDR) */}
            {searchResult.status === "found_registry" && searchResult.registryMatch && (
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-lg border",
                  searchResult.registryMatch.isSuspended
                    ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20"
                    : "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "rounded-full p-2",
                      searchResult.registryMatch.isSuspended
                        ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                    )}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        searchResult.registryMatch.isSuspended
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-emerald-700 dark:text-emerald-300"
                      )}>
                        {searchResult.registryMatch.isSuspended ? "Знайдено в ЄДР (призупинено)" : "Знайдено в реєстрі ЄДР"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {searchResult.registryMatch.isSuspended 
                          ? "Перевірте статус контрагента" 
                          : "Верифіковані дані з державного реєстру"}
                      </p>
                    </div>
                    {searchResult.registryMatch.isVerified && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        ЄДР
                      </Badge>
                    )}
                  </div>
                </div>
                
                <RegistryDataCard data={searchResult.registryMatch} />
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Напрямок співпраці</Label>
                  <Select value={addRole} onValueChange={(v) => setAddRole(v as typeof addRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contractorRoleOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alsoInvite}
                      onChange={(e) => setAlsoInvite(e.target.checked)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">
                      Також запросити до електронного документообігу
                    </span>
                    <Badge variant="secondary" className="gap-1 text-xs ml-auto">
                      <Gift className="h-3 w-3" />
                      +5K кредитів
                    </Badge>
                  </label>
                </div>
                
                {/* Invite form when checkbox is checked */}
                {alsoInvite && (
                  <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                    {/* Preferred Email */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Контактний email для запрошення</Label>
                        <div className="group relative">
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-md shadow-md text-xs w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            Дані з реєстрів можуть бути застарілими. Введіть актуальний email контрагента.
                          </div>
                        </div>
                      </div>
                      
                      {searchResult.registryMatch?.email && (
                        <p className="text-xs text-muted-foreground">
                          Email з ЄДР: <span className="font-mono">{searchResult.registryMatch.email}</span>
                          <span className="text-amber-600 ml-1">(може бути застарілим)</span>
                        </p>
                      )}
                      
                      <Input
                        type="email"
                        placeholder={searchResult.registryMatch?.email || "contractor@example.com"}
                        value={preferredEmail}
                        onChange={(e) => setPreferredEmail(e.target.value)}
                      />
                    </div>
                    
                    {/* Delivery Method */}
                    <div className="space-y-2">
                      <Label>Спосіб доставки</Label>
                      <RadioGroup 
                        value={inviteMethod} 
                        onValueChange={(v) => setInviteMethod(v as "system" | "link")}
                        className="flex gap-4"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="system" />
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Надіслати email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="link" />
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Скопіювати посилання</span>
                        </label>
                      </RadioGroup>
                    </div>
                    
                    {/* Personal Message */}
                    <div className="space-y-2">
                      <Label>Повідомлення (необов'язково)</Label>
                      <Textarea
                        placeholder="Додаткове повідомлення для контрагента..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        className="resize-none h-16"
                      />
                    </div>
                    
                    {/* Email Preview Button */}
                    {inviteMethod === "system" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={handleShowEmailPreview}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Переглянути email
                      </Button>
                    )}
                    
                    {/* Invite Link Preview */}
                    {inviteMethod === "link" && (
                      <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                        <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <code className="text-xs text-muted-foreground flex-1 truncate">
                          /contractor-onboarding?code={inviteCode || "ABC-123-XYZ"}
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopyInviteLink}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Not Found */}
            {searchResult.status === "not_found" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-destructive/10 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-destructive">
                        {searchResult.searchedCode 
                          ? `Код ${searchResult.searchedCode} не знайдено`
                          : `"${searchResult.searchedName}" не знайдено`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Не знайдено ні у вашій базі, ні в системі, ні в державних реєстрах
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg border bg-muted/30 text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Можливі причини:
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-0.5 ml-6">
                    <li>Помилка у введеному коді</li>
                    <li>Новозареєстрована компанія (ще не в реєстрі)</li>
                    <li>ФОП без активності</li>
                  </ul>
                </div>
                
                {!showInviteForm ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowInviteForm(true)}
                  >
                    Все одно запросити контрагента
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Запросити контрагента</span>
                      <Badge variant="outline" className="ml-auto gap-1 text-amber-600 border-amber-200 bg-amber-50 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        Неверифікований
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Email контрагента *</Label>
                        <Input
                          type="email"
                          placeholder="contractor@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label>Напрямок співпраці</Label>
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contractorRoleOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Delivery Method */}
                      <div className="space-y-2">
                        <Label>Спосіб доставки</Label>
                        <RadioGroup 
                          value={inviteMethod} 
                          onValueChange={(v) => setInviteMethod(v as "system" | "link")}
                          className="flex gap-4"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="system" />
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Надіслати email</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="link" />
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Скопіювати посилання</span>
                          </label>
                        </RadioGroup>
                      </div>
                      
                      {inviteMethod === "link" && (
                        <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <code className="text-xs text-muted-foreground flex-1 truncate">
                            /contractor-onboarding?code={inviteCode || "ABC-123-XYZ"}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopyInviteLink}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <BonusBadge />
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer Actions */}
        <div className="shrink-0 border-t p-4 sm:px-6 flex gap-2 pb-safe">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Скасувати
          </Button>
          
          {searchResult.status === "found_registry" && (
            <Button
              className="flex-1"
              onClick={handleAddFromRegistry}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {alsoInvite ? "Додати та запросити" : "Додати до бази"}
            </Button>
          )}
          
          {searchResult.status === "not_found" && showInviteForm && (
            <Button
              className="flex-1"
              onClick={handleInviteAnyway}
              disabled={isSubmitting || (inviteMethod === "system" && !inviteEmail)}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : inviteMethod === "link" ? (
                <Copy className="h-4 w-4 mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {inviteMethod === "link" ? "Копіювати посилання" : "Надіслати запрошення"}
            </Button>
          )}
        </div>
      </div>
      
      {/* Email Preview Dialog */}
      <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b shrink-0">
            <DialogTitle>Попередній перегляд email</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <iframe
              srcDoc={emailPreviewHtml}
              className="w-full h-[600px] border-0"
              title="Email Preview"
            />
          </div>
          <div className="p-4 border-t flex gap-2 shrink-0">
            <Button variant="outline" className="flex-1" onClick={() => setShowEmailPreview(false)}>
              Закрити
            </Button>
            <Button className="flex-1" onClick={() => {
              setShowEmailPreview(false);
              handleAddFromRegistry();
            }}>
              <Send className="h-4 w-4 mr-2" />
              Надіслати
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper Components
const ContractorPreviewCard = ({ contractor }: { contractor: Contractor }) => {
  const TypeIcon = typeIcons[contractor.type] || Building2;
  
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className="rounded-full p-2 bg-primary/10 text-primary">
          <TypeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{contractor.name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {getCodeTypeLabel(contractor.code)}: {contractor.code}
          </p>
          {contractor.email && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {contractor.email}
            </p>
          )}
        </div>
        {contractor.reliabilityScore !== undefined && (
          <Badge variant="outline" className={cn(
            "text-xs",
            contractor.reliabilityScore >= 80 ? "text-green-600 border-green-200" :
            contractor.reliabilityScore >= 50 ? "text-amber-600 border-amber-200" :
            "text-destructive border-destructive/30"
          )}>
            {contractor.reliabilityScore}%
          </Badge>
        )}
      </div>
    </div>
  );
};

const RegistryDataCard = ({ data }: { data: UnifiedSearchResult["registryMatch"] }) => {
  if (!data) return null;
  
  const TypeIcon = typeIcons[data.type] || Building2;
  
  return (
    <div className="p-4 rounded-lg border bg-card space-y-3">
      <div className="flex items-center gap-3">
        <div className="rounded-full p-2 bg-primary/10 text-primary">
          <TypeIcon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {getCodeTypeLabel(data.code)}: {data.code}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {typeLabels[data.type]}
        </Badge>
      </div>
      
      {(data.address || data.director || data.taxStatus || data.email) && (
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          {data.address && (
            <p className="flex items-start gap-2">
              <span className="text-muted-foreground/60">📍</span>
              {data.address}
            </p>
          )}
          {data.director && (
            <p className="flex items-start gap-2">
              <span className="text-muted-foreground/60">👤</span>
              {data.director}
            </p>
          )}
          {data.taxStatus && (
            <p className="flex items-start gap-2">
              <span className="text-muted-foreground/60">💰</span>
              {data.taxStatus}
            </p>
          )}
          {data.email && (
            <p className="flex items-start gap-2">
              <span className="text-muted-foreground/60">📧</span>
              {data.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const BonusBadge = () => (
  <div className="flex items-center gap-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
    <Gift className="h-5 w-5 text-primary" />
    <div className="flex-1">
      <p className="text-sm font-medium">+5K кредитів за запрошення</p>
      <p className="text-xs text-muted-foreground">
        Отримайте бонус, коли контрагент зареєструється
      </p>
    </div>
  </div>
);