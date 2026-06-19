import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, User, MapPin, CreditCard, Phone, Mail, 
  Edit2, ArrowLeft, ArrowRight, Shield, FileText, Lock,
  CheckCircle, AlertTriangle
} from "lucide-react";
import { RegistryData, formatIBAN, getTaxSystemLabel } from "@/lib/registryIntegration";
import { cn } from "@/lib/utils";
import { 
  validateEdrpou, validateIpn, validateIban, validatePhone, validateEmail,
  getCodeValidationError, getIbanValidationError
} from "@/lib/validators";

interface VerifyDataStepProps {
  data: RegistryData;
  onConfirm: (data: RegistryData, agreements: { terms: boolean; dataProcessing: boolean }) => void;
  onBack: () => void;
}

interface FieldError {
  path: string;
  error: string;
}

// Поля, захищені від редагування коли дані з ЄДР
const REGISTRY_LOCKED_PATHS = new Set([
  'basic.name', 'basic.shortName', 'basic.code', 'basic.address', 'leadership.director'
]);

export const VerifyDataStep = ({ data, onConfirm, onBack }: VerifyDataStepProps) => {
  const [editedData, setEditedData] = useState<RegistryData>(data);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // Якщо код ЄДРПОУ/ІПН заповнений — дані з реєстру, захищаємо від редагування
  const isRegistrySynced = !!data.basic.code && data.basic.code.length > 0;
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDataProcessing, setAgreedToDataProcessing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  
  const validateField = useCallback((path: string, value: string): string | null => {
    switch (path) {
      case 'basic.code':
        return getCodeValidationError(value, editedData.entityType);
      case 'banking.iban':
        // Очищаємо IBAN від пробілів перед валідацією
        const cleanedIban = value?.replace(/\s/g, '') || '';
        return getIbanValidationError(cleanedIban);
      case 'contacts.phone':
        if (value && !validatePhone(value)) return 'Формат: +380XXXXXXXXX';
        return null;
      case 'contacts.email':
        if (value && !validateEmail(value)) return 'Невірний формат email';
        return null;
      case 'basic.name':
        if (!value || value.trim().length < 3) return 'Мінімум 3 символи';
        return null;
      case 'basic.shortName':
        if (value && value.length < 3) return 'Мінімум 3 символи';
        return null;
      case 'leadership.director':
        if (!value || value.trim().length < 5) return 'Вкажіть повне ПІБ';
        return null;
      case 'basic.address':
        if (!value || value.trim().length < 10) return 'Вкажіть повну адресу';
        return null;
      default:
        return null;
    }
  }, [editedData.entityType]);
  
  // Перевірка обов'язкових полів
  const validateRequiredFields = useCallback((): FieldError[] => {
    const requiredErrors: FieldError[] = [];
    
    if (!editedData.basic.name?.trim()) {
      requiredErrors.push({ path: 'basic.name', error: 'Обов\'язкове поле' });
    }
    if (!editedData.basic.code?.trim()) {
      requiredErrors.push({ path: 'basic.code', error: 'Обов\'язкове поле' });
    }
    if (!editedData.basic.address?.trim()) {
      requiredErrors.push({ path: 'basic.address', error: 'Обов\'язкове поле' });
    }
    if (!editedData.leadership?.director?.trim()) {
      requiredErrors.push({ path: 'leadership.director', error: 'Обов\'язкове поле' });
    }
    
    return requiredErrors;
  }, [editedData]);
  
  // Перевіряємо всі поля при завантаженні та зміні даних
  const isFormComplete = 
    editedData.basic.name?.trim() && 
    editedData.basic.code?.trim() && 
    editedData.basic.address?.trim() &&
    editedData.leadership?.director?.trim();
  
  const handleConfirm = () => {
    if (agreedToTerms && agreedToDataProcessing && fieldErrors.length === 0) {
      onConfirm(editedData, { terms: agreedToTerms, dataProcessing: agreedToDataProcessing });
    }
  };
  
  const updateField = (path: string, value: string) => {
    const keys = path.split('.');
    setEditedData(prev => {
      const updated = { ...prev };
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
    
    // Validate and update errors
    const error = validateField(path, value);
    setFieldErrors(prev => {
      const filtered = prev.filter(e => e.path !== path);
      if (error) {
        return [...filtered, { path, error }];
      }
      return filtered;
    });
  };
  
  const getFieldError = (path: string): string | undefined => {
    return fieldErrors.find(e => e.path === path)?.error;
  };
  
  const renderEditableField = (
    label: string,
    value: string,
    path: string,
    icon?: React.ReactNode
  ) => {
    const isLocked = isRegistrySynced && REGISTRY_LOCKED_PATHS.has(path);
    const isEditing = !isLocked && editingSection === path;
    const error = getFieldError(path);
    
    return (
      <div className="flex items-center justify-between py-2 min-h-[48px]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            {isEditing ? (
              <div className="space-y-1">
                <Input
                  value={value}
                  onChange={(e) => updateField(path, e.target.value)}
                  className={cn(
                    "h-9 sm:h-8 text-sm mt-1",
                    error && "border-destructive focus-visible:ring-destructive"
                  )}
                  autoFocus
                  onBlur={() => setEditingSection(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingSection(null)}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isLocked && "text-muted-foreground"
                )}>{value || '—'}</p>
                {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />}
                {error && <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />}
              </div>
            )}
          </div>
        </div>
        {!isEditing && !isLocked && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 sm:h-8 sm:w-8 shrink-0 ml-2"
            onClick={() => setEditingSection(path)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-[60dvh] px-4 py-4 sm:py-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header with trust indicator */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs mb-3">
            <Lock className="w-3 h-3" />
            Дані захищені шифруванням
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Перевірте дані</h2>
          <p className="text-sm text-muted-foreground">
            {isRegistrySynced 
              ? 'Дані з реєстру захищені від редагування'
              : 'За потреби можете відредагувати'}
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100dvh-400px)] sm:h-[calc(60vh-220px)] pr-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Basic info card */}
            <Card>
              <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Основні реквізити
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    {editedData.entityType === 'individual' ? 'ДРФО' : 'ЄДР'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-1 sm:py-2 px-3 sm:px-4 space-y-0">
                {renderEditableField(
                  'Найменування',
                  editedData.basic.shortName || editedData.basic.name,
                  'basic.shortName'
                )}
                {renderEditableField(
                  editedData.entityType === 'tov' ? 'ЄДРПОУ' : 'ІПН',
                  editedData.basic.code,
                  'basic.code'
                )}
                {renderEditableField(
                  'Адреса',
                  editedData.basic.address,
                  'basic.address',
                  <MapPin className="w-3.5 h-3.5" />
                )}
              </CardContent>
            </Card>
            
            {/* Leadership card — лише для юросіб */}
            {editedData.entityType === 'tov' && (
              <Card>
                <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Керівництво
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 sm:py-2 px-3 sm:px-4 space-y-0">
                  {renderEditableField(
                    editedData.leadership.position,
                    editedData.leadership.director,
                    'leadership.director'
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Tax info card — приховуємо для фізособи */}
            {editedData.entityType !== 'individual' && (
              <Card>
                <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Податкова інформація
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 sm:py-2 px-3 sm:px-4">
                  <div className="py-2 min-h-[48px] flex items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Система оподаткування</p>
                      <p className="text-sm font-medium">{getTaxSystemLabel(editedData.tax)}</p>
                    </div>
                  </div>
                  {editedData.tax.vatPayer && editedData.tax.vatNumber && (
                    <div className="py-2 min-h-[48px] flex items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Номер ПДВ</p>
                        <p className="text-sm font-medium">{editedData.tax.vatNumber}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Banking card */}
            {editedData.banking && (
              <Card>
                <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Банківські реквізити
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 sm:py-2 px-3 sm:px-4 space-y-0">
                  {renderEditableField(
                    'IBAN',
                    formatIBAN(editedData.banking.iban),
                    'banking.iban'
                  )}
                  {renderEditableField(
                    'Банк',
                    editedData.banking.bankName,
                    'banking.bankName'
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Contacts card */}
            {editedData.contacts && (
              <Card>
                <CardHeader className="py-2.5 sm:py-3 px-3 sm:px-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Контакти
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 sm:py-2 px-3 sm:px-4 space-y-0">
                  {editedData.contacts.phone && renderEditableField(
                    'Телефон',
                    editedData.contacts.phone,
                    'contacts.phone',
                    <Phone className="w-3.5 h-3.5" />
                  )}
                  {editedData.contacts.email && renderEditableField(
                    'Email',
                    editedData.contacts.email,
                    'contacts.email',
                    <Mail className="w-3.5 h-3.5" />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
        
        {/* Agreements - improved touch targets */}
        <div className="mt-4 sm:mt-5 space-y-2">
          {/* Terms checkbox - clickable area */}
          <div 
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              "hover:bg-muted/50 active:bg-muted/70",
              agreedToTerms && "bg-primary/5"
            )}
            onClick={() => setAgreedToTerms(!agreedToTerms)}
          >
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              className="mt-0.5"
              onClick={(e) => e.stopPropagation()}
            />
            <Label htmlFor="terms" className="text-xs sm:text-sm leading-relaxed cursor-pointer">
              Погоджуюсь з{' '}
              <a href="#" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>
                Умовами
              </a>{' '}
              та{' '}
              <a href="#" className="text-primary hover:underline" onClick={e => e.stopPropagation()}>
                Політикою конфіденційності
              </a>
            </Label>
          </div>
          
          {/* Data processing checkbox - clickable area */}
          <div 
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              "hover:bg-muted/50 active:bg-muted/70",
              agreedToDataProcessing && "bg-primary/5"
            )}
            onClick={() => setAgreedToDataProcessing(!agreedToDataProcessing)}
          >
            <Checkbox
              id="data-processing"
              checked={agreedToDataProcessing}
              onCheckedChange={(checked) => setAgreedToDataProcessing(checked === true)}
              className="mt-0.5"
              onClick={(e) => e.stopPropagation()}
            />
            <Label htmlFor="data-processing" className="text-xs sm:text-sm leading-relaxed cursor-pointer">
              Надаю згоду на обробку персональних даних
            </Label>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-4 sm:mt-5 gap-3">
          <Button variant="ghost" onClick={onBack} className="h-11 sm:h-10 min-w-[48px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
          <Button
            size="lg"
            disabled={!agreedToTerms || !agreedToDataProcessing || fieldErrors.length > 0 || !isFormComplete}
            onClick={handleConfirm}
            className="min-h-[48px] sm:min-h-[44px] flex-1 sm:flex-initial"
          >
            {fieldErrors.length > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Є помилки ({fieldErrors.length})
              </>
            ) : (
              <>
                <span>Підтвердити</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};