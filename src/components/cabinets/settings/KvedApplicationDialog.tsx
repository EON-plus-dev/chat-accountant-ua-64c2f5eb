import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowRight,
  FileText,
  Sparkles,
  Info,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { searchKved, type KvedCode } from "@/data/kvedCodes";
import { validateKvedForTaxGroup, type KvedValidationResult } from "@/lib/businessRules";

interface KvedApplicationDialogProps {
  cabinet: Cabinet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WizardStep = 'search' | 'validation' | 'confirmation';

export const KvedApplicationDialog = ({
  cabinet,
  open,
  onOpenChange,
}: KvedApplicationDialogProps) => {
  const [step, setStep] = useState<WizardStep>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKved, setSelectedKved] = useState<KvedCode | null>(null);
  const [validation, setValidation] = useState<KvedValidationResult | null>(null);
  
  const taxGroup = cabinet.fopGroup || 3;
  
  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchKved(searchQuery).slice(0, 10);
  }, [searchQuery]);
  
  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep('search');
      setSearchQuery('');
      setSelectedKved(null);
      setValidation(null);
    }
    onOpenChange(newOpen);
  };
  
  // Handle KVED selection
  const handleSelectKved = (kved: KvedCode) => {
    setSelectedKved(kved);
    const validationResult = validateKvedForTaxGroup(kved.code, taxGroup);
    setValidation(validationResult);
    setStep('validation');
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (step === 'validation') {
      setStep('search');
      setSelectedKved(null);
      setValidation(null);
    } else if (step === 'confirmation') {
      setStep('validation');
    }
  };
  
  // Handle continue to confirmation
  const handleContinue = () => {
    if (step === 'validation' && validation?.isAllowed) {
      setStep('confirmation');
    }
  };
  
  // Handle generate application
  const handleGenerateApplication = () => {
    // In real app: generate application document
    if (import.meta.env.DEV) console.log('Generating application for KVED:', selectedKved?.code);
    handleOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ініціювати додавання КВЕД
          </DialogTitle>
          <DialogDescription>
            {step === 'search' && 'Крок 1: Оберіть КВЕД з класифікатора'}
            {step === 'validation' && 'Крок 2: Перевірка сумісності з групою ЄП'}
            {step === 'confirmation' && 'Крок 3: Підтвердження та генерація заяви'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Step 1: Search */}
        {step === 'search' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kvedSearch">Пошук КВЕД</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="kvedSearch"
                  placeholder="Введіть код або назву діяльності..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Мінімум 2 символи для пошуку
              </p>
            </div>
            
            {searchResults.length > 0 && (
              <ScrollArea className="h-[300px] rounded-md border">
                <div className="p-2 space-y-1">
                  {searchResults.map((kved) => {
                    const preValidation = validateKvedForTaxGroup(kved.code, taxGroup);
                    return (
                      <button
                        key={kved.code}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        onClick={() => handleSelectKved(kved)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {kved.code}
                              </Badge>
                              {!preValidation.isAllowed && (
                                <XCircle className="h-3.5 w-3.5 text-destructive" />
                              )}
                              {preValidation.isAllowed && preValidation.severity === 'warning' && (
                                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                              )}
                            </div>
                            <p className="text-sm mt-1 truncate">{kved.name}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
            
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нічого не знайдено</p>
              </div>
            )}
          </div>
        )}
        
        {/* Step 2: Validation */}
        {step === 'validation' && selectedKved && validation && (
          <div className="space-y-4">
            {/* Selected KVED */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">
                  {selectedKved.code}
                </Badge>
              </div>
              <p className="font-medium">{selectedKved.name}</p>
            </div>
            
            {/* Validation result */}
            {validation.isAllowed ? (
              <Alert className="border-success/30 bg-success/5">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription>
                  <p className="font-medium text-foreground">
                    КВЕД дозволений для {taxGroup} групи ЄП
                  </p>
                  {validation.reason && (
                    <p className="text-sm text-muted-foreground mt-1">{validation.reason}</p>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">
                    КВЕД заборонений для {taxGroup} групи ЄП
                  </p>
                  {validation.reason && (
                    <p className="text-sm mt-1">{validation.reason}</p>
                  )}
                  {validation.suggestion && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      💡 {validation.suggestion}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {validation.isAllowed && validation.severity === 'warning' && (
              <Alert className="border-warning/30 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription>
                  <p className="font-medium text-foreground">Зверніть увагу</p>
                  <p className="text-sm text-muted-foreground mt-1">{validation.reason}</p>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Info about the process */}
            {validation.isAllowed && (
              <Alert className="border-muted bg-muted/30">
                <Info className="h-4 w-4 text-muted-foreground" />
                <AlertDescription className="text-sm text-muted-foreground">
                  Після підтвердження система згенерує заяву для подання до держреєстратора. 
                  КВЕД з'явиться у вашому кабінеті після реєстрації в ЄДР.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {/* Step 3: Confirmation */}
        {step === 'confirmation' && selectedKved && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm text-muted-foreground">Буде згенеровано заяву:</p>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Заява про внесення змін до ЄДР</p>
                  <p className="text-sm text-muted-foreground">
                    Додавання КВЕД {selectedKved.code}
                  </p>
                </div>
              </div>
            </div>
            
            <Alert className="border-muted bg-muted/30">
              <Info className="h-4 w-4 text-muted-foreground" />
              <AlertDescription className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Наступні кроки:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Завантажте згенеровану заяву</li>
                  <li>Підпишіть за допомогою КЕП</li>
                  <li>Подайте через портал Дія або держреєстратора</li>
                  <li>Дочекайтесь реєстрації (до 24 годин)</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          {step !== 'search' && (
            <Button variant="outline" onClick={handleBack}>
              Назад
            </Button>
          )}
          
          {step === 'validation' && validation?.isAllowed && (
            <Button onClick={handleContinue}>
              Продовжити
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === 'confirmation' && (
            <Button onClick={handleGenerateApplication}>
              <FileText className="h-4 w-4 mr-2" />
              Згенерувати заяву
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
