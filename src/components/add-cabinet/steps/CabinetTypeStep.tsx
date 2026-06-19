import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, Building2, IdCard, Users, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, CheckCircle
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CABINET_TYPE_OPTIONS, CabinetTypeOption } from "@/config/addCabinetConfig";
import { cn } from "@/lib/utils";

interface CabinetTypeStepProps {
  onSelect: (data: {
    type: 'fop' | 'tov' | 'individual' | 'fop-group';
  }) => void;
  onBack: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  'user': User,
  'building-2': Building2,
  'id-card': IdCard,
  'users': Users,
};

export const CabinetTypeStep = ({ onSelect, onBack }: CabinetTypeStepProps) => {
  const [selectedType, setSelectedType] = useState<CabinetTypeOption['id'] | null>(null);
  const [showSecondary, setShowSecondary] = useState(false);

  const primaryTypes = CABINET_TYPE_OPTIONS.filter(t => !t.secondary);
  const secondaryTypes = CABINET_TYPE_OPTIONS.filter(t => t.secondary);

  const handleContinue = () => {
    if (!selectedType) return;
    onSelect({ type: selectedType });
  };

  const renderTypeCard = (type: CabinetTypeOption, isSelected: boolean) => {
    const Icon = iconMap[type.icon] || User;
    
    return (
      <Card
        key={type.id}
        className={cn(
          "cursor-pointer transition-all duration-200",
          isSelected
            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
            : "hover:border-primary/30 hover:shadow-sm"
        )}
        onClick={() => setSelectedType(type.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold">{type.title}</h3>
                {type.recommended && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Популярне
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{type.description}</p>
              {type.socialProof && (
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {type.socialProof}
                </p>
              )}
            </div>
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)] px-4 py-6">
      <div className="max-w-lg w-full mx-auto flex-1">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Який тип кабінету створюємо?
          </h2>
          <p className="text-muted-foreground">
            AI підбере оптимальні налаштування під ваш тип діяльності
          </p>
        </div>

        {/* Primary types */}
        <div className="space-y-3 mb-4">
          {primaryTypes.map(type => renderTypeCard(type, selectedType === type.id))}
        </div>

        {/* Secondary types - collapsible */}
        <Collapsible open={showSecondary} onOpenChange={setShowSecondary}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-muted-foreground hover:text-foreground mb-3"
            >
              <span>Інші типи</span>
              {showSecondary ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {secondaryTypes.map(type => renderTypeCard(type, selectedType === type.id))}
          </CollapsibleContent>
        </Collapsible>

        {(() => {
          const userType = typeof window !== "undefined" ? localStorage.getItem("user_type") : null;
          const isPaired =
            (userType === "individual" && (selectedType === "fop" || selectedType === "fop-group")) ||
            (userType === "fop" && selectedType === "individual") ||
            (userType === "business" && selectedType === "fop");
          if (!isPaired) return null;
          return (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                ФОП і фізособа — це ви як одна людина з одним ІПН. У ДПС вони фігурують разом, тому ми зв'яжемо ці кабінети автоматично за вашим ІПН.
              </AlertDescription>
            </Alert>
          );
        })()}

      </div>

      {/* Bottom navigation */}
      <div className="max-w-lg w-full mx-auto pt-6 mt-auto">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={!selectedType}
            onClick={handleContinue}
          >
            Продовжити
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
