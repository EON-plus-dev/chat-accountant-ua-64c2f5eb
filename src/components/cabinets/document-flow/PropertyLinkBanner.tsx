import { useState } from "react";
import { Home, Plus, Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_PROPERTY_OBJECTS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPE_ICONS,
  shareLabel,
  type PropertyObject,
} from "@/config/propertyRegistryConfig";

// Document types that are property-related
const PROPERTY_DOC_TYPES = [
  "sale-agreement",   // Договір купівлі-продажу
];

// Keywords in document subjects/names that hint at property
const PROPERTY_KEYWORDS = [
  "квартир", "будин", "ділянк", "нерухом", "транспорт", "авто",
  "майно", "спадщин", "дарув", "купівлі-продажу", "оренд",
  "витяг з реєстру", "речових прав", "техпаспорт",
];

interface PropertyLinkBannerProps {
  documentType: string;
  subject?: string;
  contractorName?: string;
  onAddToRegistry: () => void;
  onLinkToExisting: (propertyId: string) => void;
  onDismiss: () => void;
}

export const isPropertyRelatedDocument = (
  documentType: string,
  subject?: string,
  contractorName?: string,
): boolean => {
  if (PROPERTY_DOC_TYPES.includes(documentType)) return true;
  
  const textToCheck = [subject, contractorName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
    
  return PROPERTY_KEYWORDS.some(kw => textToCheck.includes(kw));
};

export const PropertyLinkBanner = ({
  documentType,
  subject,
  contractorName,
  onAddToRegistry,
  onLinkToExisting,
  onDismiss,
}: PropertyLinkBannerProps) => {
  const [showExisting, setShowExisting] = useState(false);
  const existingProperties = DEMO_PROPERTY_OBJECTS.filter(p => p.status === "owned");

  if (showExisting) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Прив'язати до об'єкта</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowExisting(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {existingProperties.map((prop) => {
              const Icon = PROPERTY_TYPE_ICONS[prop.type];
              return (
                <button
                  key={prop.id}
                  onClick={() => onLinkToExisting(prop.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border bg-background hover:bg-accent transition-colors text-left"
                >
                  <div className="rounded-md p-1.5 bg-primary/10 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{prop.description}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {prop.address || PROPERTY_TYPE_LABELS[prop.type]} • {shareLabel(prop.ownershipShare)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={onAddToRegistry}>
            <Plus className="w-3.5 h-3.5" />
            Створити новий об'єкт
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-700/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Home className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 space-y-2.5">
            <div>
              <p className="font-medium text-sm">Документ стосується майна</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Додайте об'єкт до реєстру або прив'яжіть до існуючого
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="default" className="h-8 gap-1.5" onClick={onAddToRegistry}>
                <Plus className="w-3.5 h-3.5" />
                Додати в реєстр
              </Button>
              {existingProperties.length > 0 && (
                <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setShowExisting(true)}>
                  <Link2 className="w-3.5 h-3.5" />
                  Прив'язати до існуючого
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={onDismiss}>
                Пропустити
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
