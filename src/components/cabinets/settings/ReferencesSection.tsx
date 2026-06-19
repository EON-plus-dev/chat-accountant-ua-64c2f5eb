import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHubBreadcrumb } from "@/components/cabinets/shared/hub-breadcrumb/HubBreadcrumbContext";
import { 
  BookOpen, 
  Plus, 
  ChevronRight,
  Zap,
  FolderOpen,
  ExternalLink,
  Phone,
  Mail,
  Handshake,
  Building2,
  MapPin,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import {
  getReferenceCategoriesForType,
  getContractorsForCabinet,
  getNomenclatureForCabinet,
} from "@/config/settingsConfig";
import { getFixedAssetsForCabinet } from "@/config/fixedAssetsConfig";
import { toast } from "sonner";
import { ContractorsListSection } from "@/components/cabinets/contractors/ContractorsListSection";
import { AddContractorSheet } from "@/components/cabinets/contractors/AddContractorSheet";
import { ContractorDetailPage } from "@/components/cabinets/contractors";
import { NomenclatureDetailPage } from "@/components/cabinets/settings/references/nomenclature";
import { FixedAssetDetailPage } from "@/components/cabinets/settings/references/fixed-assets";
import {
  IncomeCategoriesContent,
  ExpenseCategoriesContent,
  BankRulesContent,
  NomenclatureContent,
  FixedAssetsContent,
  PropertyObjectsContent,
} from "./references";

interface ReferencesSectionProps {
  cabinet: Cabinet;
  defaultCategory?: string | null;
  onCategoryChange?: (category: string | null) => void;
  // In-place detail navigation (controlled by parent)
  selectedContractorId?: string | null;
  selectedNomenclatureId?: string | null;
  selectedFixedAssetId?: string | null;
  onSelectContractor?: (id: string | null) => void;
  onSelectNomenclature?: (id: string | null) => void;
  onSelectFixedAsset?: (id: string | null) => void;
}

// Demo partner data for passive cabinet
const demoPartnerData = {
  id: "partner-fop-ivanenko",
  name: "ФОП Іваненко Іван Іванович",
  code: "3184710691",
  type: "fop" as const,
  relationshipType: "buyer" as const,
  contacts: {
    phone: "+380 67 123 4567",
    email: "ivanenko.fop@example.com",
    address: "м. Київ, вул. Хрещатик, 1",
  },
  linkedCabinetId: "2",
  invitedAt: "2024-12-15T10:30:00.000Z",
};

export const ReferencesSection = ({ 
  cabinet, 
  defaultCategory,
  onCategoryChange,
  selectedContractorId,
  selectedNomenclatureId,
  selectedFixedAssetId,
  onSelectContractor,
  onSelectNomenclature,
  onSelectFixedAsset,
}: ReferencesSectionProps) => {
  const navigate = useNavigate();
  const isPassive = cabinet.accessMode === "passive";
  const referenceCategories = getReferenceCategoriesForType(cabinet.type);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    isPassive ? "contractors" : (defaultCategory || null)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [addContractorOpen, setAddContractorOpen] = useState(false);
  const { setExtraCrumbs } = useHubBreadcrumb();

  // Sync internal state with the controlled prop (breadcrumb-driven resets, deep links, back-nav)
  useEffect(() => {
    if (isPassive) return;
    const next = defaultCategory ?? null;
    setActiveCategory((prev) => (prev === next ? prev : next));
    if (next === null) setSearchQuery("");
  }, [defaultCategory, isPassive]);

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    setSearchQuery(""); // Reset search when changing category
    // Clear any opened entity detail when leaving its category
    onSelectContractor?.(null);
    onSelectNomenclature?.(null);
    onSelectFixedAsset?.(null);
    onCategoryChange?.(category);
  };

  // Get current category label for breadcrumb
  const activeCategoryLabel = activeCategory
    ? referenceCategories.find(c => c.id === activeCategory)?.label
    : null;

  // Resolve currently opened entity (within active category) for the breadcrumb tail.
  const openedEntity = useMemo<{ id: string; name: string; onClear: () => void } | null>(() => {
    if (!activeCategory) return null;
    if (activeCategory === "contractors" && selectedContractorId) {
      const c = getContractorsForCabinet(cabinet).find(c => c.id === selectedContractorId);
      if (c) return { id: c.id, name: c.name, onClear: () => onSelectContractor?.(null) };
    }
    if (activeCategory === "nomenclature" && selectedNomenclatureId) {
      const item = getNomenclatureForCabinet(cabinet).find(i => i.id === selectedNomenclatureId);
      if (item) return { id: item.id, name: item.name, onClear: () => onSelectNomenclature?.(null) };
    }
    if (activeCategory === "fixed-assets" && selectedFixedAssetId) {
      const a = getFixedAssetsForCabinet(cabinet.id).find(a => a.id === selectedFixedAssetId);
      if (a) return { id: a.id, name: a.name, onClear: () => onSelectFixedAsset?.(null) };
    }
    return null;
  }, [
    activeCategory,
    selectedContractorId,
    selectedNomenclatureId,
    selectedFixedAssetId,
    cabinet,
    onSelectContractor,
    onSelectNomenclature,
    onSelectFixedAsset,
  ]);

  // Push категорію (+ опційно назву сутності) у глобальний breadcrumb.
  useEffect(() => {
    if (!activeCategory || !activeCategoryLabel) {
      setExtraCrumbs([]);
      return () => setExtraCrumbs([]);
    }
    if (openedEntity) {
      setExtraCrumbs([
        { id: `ref-${activeCategory}`, label: activeCategoryLabel, onSelect: openedEntity.onClear },
        { id: `entity-${openedEntity.id}`, label: openedEntity.name },
      ]);
    } else {
      setExtraCrumbs([
        { id: `ref-${activeCategory}`, label: activeCategoryLabel },
      ]);
    }
    return () => setExtraCrumbs([]);
  }, [activeCategory, activeCategoryLabel, openedEntity, setExtraCrumbs]);

  // For passive cabinets, show partner card instead of contractors list
  const renderPassivePartnerCard = () => {
    const partner = demoPartnerData;
    const relationshipLabel = partner.relationshipType === "buyer" 
      ? "Покупець" 
      : partner.relationshipType === "supplier" 
        ? "Постачальник" 
        : "Обидва напрямки";
    
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                {partner.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">{partner.name}</CardTitle>
                <Badge variant="secondary">{relationshipLabel}</Badge>
              </div>
              <CardDescription className="mt-1">
                <span className="font-mono">ІПН: {partner.code}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contacts */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{partner.contacts.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{partner.contacts.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:col-span-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{partner.contacts.address}</span>
            </div>
          </div>
          
          {/* Relationship info */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Handshake className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Тип відносин:</span>
              <span className="font-medium">{relationshipLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Тип суб'єкта:</span>
              <span className="font-medium">ФОП</span>
            </div>
          </div>
          
          {/* Note about read-only */}
          <p className="text-xs text-muted-foreground">
            Реквізити партнера доступні лише для перегляду. Для оновлення даних зверніться до партнера.
          </p>
        </CardContent>
      </Card>
    );
  };

  const renderCategoryContent = (categoryId: string) => {
    // For passive cabinets, show partner card in contractors section
    if (isPassive && categoryId === "contractors") {
      return renderPassivePartnerCard();
    }

    // In-place detail views: render full detail page inside the same scope so
    // the cabinet header and HubBreadcrumbBar remain on screen.
    if (categoryId === "contractors" && selectedContractorId) {
      return (
        <ContractorDetailPage
          contractorId={selectedContractorId}
          cabinet={cabinet}
          onBack={() => onSelectContractor?.(null)}
        />
      );
    }
    if (categoryId === "nomenclature" && selectedNomenclatureId) {
      return (
        <NomenclatureDetailPage
          itemId={selectedNomenclatureId}
          cabinet={cabinet}
          onBack={() => onSelectNomenclature?.(null)}
        />
      );
    }
    if (categoryId === "fixed-assets" && selectedFixedAssetId) {
      return (
        <FixedAssetDetailPage
          assetId={selectedFixedAssetId}
          cabinet={cabinet}
          onBack={() => onSelectFixedAsset?.(null)}
        />
      );
    }

    switch (categoryId) {
      case "contractors":
        return (
          <div className="space-y-3">
            {/* Referral Bonus Banner - тільки для контрагентів */}
            {!isPassive && (
              <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-emerald-50/30 to-transparent dark:from-emerald-950/20 dark:via-emerald-950/10 dark:to-transparent">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">+5K кредитів за кожного контрагента!</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                          Кредити нараховуються на ваш особистий баланс
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p>Бонуси за запрошених контрагентів нараховуються на ваш профіль. 
                        Ви можете конвертувати їх у будь-який кабінет, де ви є власником.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0 gap-1.5"
                    onClick={() => {
                      const currentUrl = window.location.pathname + window.location.search;
                      if (currentUrl.includes("subtab=earnings")) {
                        toast.info("Ви вже на сторінці Заробіток");
                      } else {
                        navigate(
                          buildUrlWithTrail("/dashboard?tab=user-settings&subtab=earnings", {
                            label: "Налаштування кабінету",
                            url: window.location.pathname + window.location.search,
                          }),
                        );
                      }
                    }}
                  >
                    Детальніше
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-wrap justify-end gap-2 min-w-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open("/contractor-onboarding", "_blank")}
                className="text-muted-foreground"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Демо</span>
              </Button>
              <Button size="sm" onClick={() => setAddContractorOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Додати
              </Button>
            </div>
            <ContractorsListSection 
              cabinet={cabinet} 
              onNavigateToContractor={(id) => onSelectContractor?.(id)}
              embedded
            />
            <AddContractorSheet
              open={addContractorOpen}
              onOpenChange={setAddContractorOpen}
              cabinet={cabinet}
            />
          </div>
        );

      case "income-categories":
        return (
          <IncomeCategoriesContent 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );

      case "expense-categories":
        return (
          <ExpenseCategoriesContent 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );

      case "bank-rules":
        return (
          <BankRulesContent 
            cabinet={cabinet}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );

      case "nomenclature":
        return (
          <NomenclatureContent 
            cabinet={cabinet}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNavigateToNomenclature={(id) => onSelectNomenclature?.(id)}
          />
        );

      case "fixed-assets":
        return (
          <FixedAssetsContent
            cabinet={cabinet}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNavigateToFixedAsset={(id) => onSelectFixedAsset?.(id)}
          />
        );

      case "property-objects":
        return (
          <PropertyObjectsContent
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Демо-дані для цього довідника</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Додати запис
            </Button>
          </div>
        );
    }
  };

  // For passive cabinets, auto-open contractors category
  useEffect(() => {
    if (isPassive && !activeCategory) {
      handleCategoryChange("contractors");
    }
  }, [isPassive, activeCategory]);

  return (
    <div className="space-y-4 min-w-0">
      {/* Active category content */}
      {activeCategory ? (
        <div className="space-y-4">
          {renderCategoryContent(activeCategory)}
        </div>
      ) : (
        // Categories grid
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {referenceCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className="min-w-0 cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{category.label}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {category.description}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {category.count} записів
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Card */}
          <Card className="bg-muted/50 hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Автозаповнення</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Дані з довідників автоматично підтягуються при створенні документів, 
                    категоризації банківських операцій та формуванні звітів.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
