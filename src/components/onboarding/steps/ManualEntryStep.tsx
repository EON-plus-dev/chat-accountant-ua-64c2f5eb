import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, User, MapPin, CreditCard, Phone, Mail, 
  ArrowLeft, ArrowRight, Shield, FileText, Search,
  CheckCircle, XCircle, Loader2, AlertTriangle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RegistryData } from "@/lib/registryIntegration";
import { 
  validateEdrpou, validateIpn, validateIban, validatePhone, 
  validateEmail, validateFullName, validateVatNumber, validateCompanyName,
  getCodeValidationError, getIbanValidationError, getVatValidationError, getFullNameValidationError
} from "@/lib/validators";
import { verifyInEDR, VerificationStatus } from "@/lib/registryVerification";
import { searchKved, KvedCode } from "@/data/kvedCodes";
import { 
  validateKvedForTaxGroup, 
  validateVatAndTaxGroup,
  FOP_INCOME_LIMITS,
  formatCurrency as formatBusinessCurrency,
  type KvedValidationResult,
} from "@/lib/businessRules";
import { KvedValidationBadge } from "@/components/shared/KvedValidationBadge";

type EntityType = 'tov' | 'fop-3' | 'fop-2' | 'fop-1';

interface ManualEntryStepProps {
  onComplete: (data: RegistryData) => void;
  onBack: () => void;
}

interface FormData {
  entityType: EntityType;
  name: string;
  shortName: string;
  code: string;
  address: string;
  director: string;
  directorPosition: string;
  taxGroup: 1 | 2 | 3;
  taxRate: number;
  isVatPayer: boolean;
  vatNumber: string;
  iban: string;
  bankName: string;
  phone: string;
  email: string;
  mainKved: KvedCode | null;
}

interface FieldError {
  field: string;
  error: string;
}

const TAX_RATES: Record<number, number[]> = {
  1: [0], // Фіксований платіж (МЗП)
  2: [20], // 20% від мінімалки
  3: [5, 3], // 5% або 3% (платник ПДВ)
};

const ENTITY_TYPES = [
  { value: 'tov', label: 'ТОВ', description: 'Товариство з обмеженою відповідальністю' },
  { value: 'fop-3', label: 'ФОП 3 група', description: 'Єдиний податок 5%' },
  { value: 'fop-2', label: 'ФОП 2 група', description: 'Фіксований податок' },
  { value: 'fop-1', label: 'ФОП 1 група', description: 'Роздрібна торгівля' },
];

export const ManualEntryStep = ({ onComplete, onBack }: ManualEntryStepProps) => {
  const [formData, setFormData] = useState<FormData>({
    entityType: 'fop-3',
    name: '',
    shortName: '',
    code: '',
    address: '',
    director: '',
    directorPosition: '',
    taxGroup: 3,
    taxRate: 5,
    isVatPayer: false,
    vatNumber: '',
    iban: '',
    bankName: '',
    phone: '',
    email: '',
    mainKved: null,
  });
  
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [codeVerification, setCodeVerification] = useState<VerificationStatus>('idle');
  const [kvedOpen, setKvedOpen] = useState(false);
  const [kvedSearch, setKvedSearch] = useState('');
  
  const isTov = formData.entityType === 'tov';
  const isFop = formData.entityType.startsWith('fop');
  
  // Update tax settings based on entity type
  useEffect(() => {
    if (formData.entityType === 'fop-1') {
      setFormData(prev => ({ ...prev, taxGroup: 1, taxRate: 0, directorPosition: 'ФОП' }));
    } else if (formData.entityType === 'fop-2') {
      setFormData(prev => ({ ...prev, taxGroup: 2, taxRate: 20, directorPosition: 'ФОП' }));
    } else if (formData.entityType === 'fop-3') {
      setFormData(prev => ({ ...prev, taxGroup: 3, taxRate: 5, directorPosition: 'ФОП' }));
    } else {
      setFormData(prev => ({ ...prev, directorPosition: 'Директор' }));
    }
  }, [formData.entityType]);
  
  // Debounced code verification
  useEffect(() => {
    const code = formData.code;
    const expectedLength = isTov ? 8 : 10;
    
    if (code.length < expectedLength) {
      setCodeVerification('idle');
      return;
    }
    
    const timer = setTimeout(async () => {
      setCodeVerification('checking');
      const entityType = isTov ? 'tov' : 'fop';
      const result = await verifyInEDR(code, entityType);
      setCodeVerification(result.status);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.code, isTov]);
  
  // Автокорекція ПДВ/ставки для FOP
  useEffect(() => {
    if (!isFop) return;
    
    // Групи 1-2 не можуть бути платниками ПДВ
    if ((formData.taxGroup === 1 || formData.taxGroup === 2) && formData.isVatPayer) {
      setFormData(prev => ({ ...prev, isVatPayer: false, vatNumber: '' }));
      toast.info('ПДВ доступний тільки для групи 3');
      return;
    }
    
    // Група 3: синхронізація ПДВ з обраною ставкою
    if (formData.taxGroup === 3) {
      // При ставці 3% — автоматично вмикаємо ПДВ
      if (formData.taxRate === 3 && !formData.isVatPayer) {
        setFormData(prev => ({ ...prev, isVatPayer: true }));
        toast.info('При ставці 3% ПДВ обов\'язковий');
        return;
      }
      
      // При ставці 5% — автоматично вимикаємо ПДВ
      if (formData.taxRate === 5 && formData.isVatPayer) {
        setFormData(prev => ({ ...prev, isVatPayer: false, vatNumber: '' }));
        toast.info('Ставка 5% не передбачає статус платника ПДВ');
        return;
      }
    }
  }, [formData.taxGroup, formData.taxRate, formData.isVatPayer, isFop]);
  
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => prev.filter(e => e.field !== field));
  };
  
  const validateForm = (): boolean => {
    const newErrors: FieldError[] = [];
    
    // Назва
    if (isTov) {
      if (!formData.name || formData.name.length < 3) {
        newErrors.push({ field: 'name', error: 'Мінімум 3 символи' });
      } else if (!validateCompanyName(formData.name)) {
        newErrors.push({ field: 'name', error: 'Недопустимі символи в назві' });
      }
    } else {
      // Для ФОП - валідація ПІБ
      const nameError = getFullNameValidationError(formData.name);
      if (nameError) {
        newErrors.push({ field: 'name', error: nameError });
      }
    }
    
    // Код (ЄДРПОУ/ІПН)
    const codeError = getCodeValidationError(formData.code, isTov ? 'tov' : 'fop');
    if (codeError) {
      newErrors.push({ field: 'code', error: codeError });
    }
    
    // Адреса
    if (!formData.address || formData.address.length < 10) {
      newErrors.push({ field: 'address', error: 'Вкажіть повну адресу' });
    }
    
    // Керівник/ФОП - валідація ПІБ
    const directorError = getFullNameValidationError(formData.director);
    if (directorError) {
      newErrors.push({ field: 'director', error: directorError });
    }
    
    // КВЕД + перевірка сумісності з групою ЄП
    if (!formData.mainKved) {
      newErrors.push({ field: 'mainKved', error: 'Оберіть основний вид діяльності' });
    } else if (isFop) {
      const kvedValidation = validateKvedForTaxGroup(formData.mainKved.code, formData.taxGroup);
      if (!kvedValidation.isAllowed) {
        newErrors.push({ field: 'mainKved', error: kvedValidation.reason || 'КВЕД заборонений для цієї групи' });
      }
    }
    
    // ПДВ - повна валідація номера
    if (formData.isVatPayer) {
      const vatError = getVatValidationError(formData.vatNumber);
      if (vatError) {
        newErrors.push({ field: 'vatNumber', error: vatError });
      }
    }
    
    // IBAN (опціонально, але якщо є — валідувати)
    if (formData.iban) {
      const ibanError = getIbanValidationError(formData.iban);
      if (ibanError) {
        newErrors.push({ field: 'iban', error: ibanError });
      }
    }
    
    // Телефон (опціонально)
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.push({ field: 'phone', error: 'Формат: +380XXXXXXXXX' });
    }
    
    // Email (опціонально)
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.push({ field: 'email', error: 'Невірний формат email' });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };
  
  const getFieldError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.error;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const registryData: RegistryData = {
      source: 'edr',
      entityType: isTov ? 'tov' : 'fop',
      basic: {
        name: formData.name,
        shortName: formData.shortName || undefined,
        code: formData.code,
        address: formData.address,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'active',
      },
      leadership: {
        director: formData.director,
        position: formData.directorPosition || (isTov ? 'Директор' : 'ФОП'),
      },
      activity: {
        kveds: formData.mainKved ? [{ 
          code: formData.mainKved.code, 
          name: formData.mainKved.name, 
          isPrimary: true 
        }] : [],
      },
      tax: {
        vatPayer: formData.isVatPayer,
        vatNumber: formData.isVatPayer ? formData.vatNumber : undefined,
        singleTax: isFop ? {
          group: formData.taxGroup as 1 | 2 | 3 | 4,
          rate: formData.taxRate,
        } : undefined,
        taxSystem: isFop ? 'simplified' : 'general',
      },
      banking: formData.iban ? {
        iban: formData.iban.replace(/\s/g, ''),
        bankName: formData.bankName || '',
        mfo: '',
      } : undefined,
      contacts: (formData.phone || formData.email) ? {
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      } : undefined,
    };
    
    onComplete(registryData);
  };
  
  const kvedResults = searchKved(kvedSearch, 15);
  
  const renderVerificationBadge = () => {
    switch (codeVerification) {
      case 'checking':
        return (
          <Badge variant="secondary" className="animate-pulse">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Перевірка...
          </Badge>
        );
      case 'valid':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Перевірено
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Невірний формат
          </Badge>
        );
      case 'not-found':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Не знайдено
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const renderFieldWithError = (
    label: string,
    field: keyof FormData,
    placeholder: string,
    icon?: React.ReactNode,
    hint?: string
  ) => {
    const error = getFieldError(field);
    const value = formData[field] as string;
    
    return (
      <div className="space-y-1.5">
        <Label className="text-sm flex items-center gap-1.5">
          {icon}
          {label}
        </Label>
        <Input
          value={value}
          onChange={(e) => updateField(field, e.target.value as any)}
          placeholder={placeholder}
          className={cn(
            "h-11",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-[60dvh] px-4 py-4 sm:py-6">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs mb-3">
            <Shield className="w-3 h-3" />
            Безпечний ввід даних
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Введіть реквізити</h2>
          <p className="text-sm text-muted-foreground">
            Всі дані перевіряються автоматично
          </p>
        </div>
        
        <ScrollArea className="h-[calc(100dvh-320px)] pr-4">
          <div className="space-y-4">
            {/* Entity Type Selection */}
            <Card>
              <CardHeader className="py-2.5 px-3 sm:px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Тип суб'єкта господарювання
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-4">
                <RadioGroup
                  value={formData.entityType}
                  onValueChange={(val) => updateField('entityType', val as EntityType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {ENTITY_TYPES.map((type) => (
                    <div key={type.value} className="relative">
                      <RadioGroupItem
                        value={type.value}
                        id={type.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={type.value}
                        className={cn(
                          "flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all",
                          "hover:border-primary/50 peer-data-[state=checked]:border-primary",
                          "peer-data-[state=checked]:bg-primary/5"
                        )}
                      >
                        <span className="font-medium text-sm">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
            
            {/* Basic Info */}
            <Card>
              <CardHeader className="py-2.5 px-3 sm:px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Основні реквізити
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-4 space-y-3">
                {renderFieldWithError(
                  isTov ? 'Повна назва підприємства *' : 'ПІБ (як в реєстрі) *',
                  'name',
                  isTov ? 'ТОВ "Назва компанії"' : 'Прізвище Ім\'я По-батькові'
                )}
                
                {isTov && renderFieldWithError(
                  'Скорочена назва',
                  'shortName',
                  'ТОВ "Назва"'
                )}
                
                {/* Code field with verification */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      {isTov ? 'ЄДРПОУ *' : 'ІПН (РНОКПП) *'}
                    </Label>
                    {renderVerificationBadge()}
                  </div>
                  <Input
                    value={formData.code}
                    onChange={(e) => updateField('code', e.target.value.replace(/\D/g, ''))}
                    placeholder={isTov ? '12345678' : '1234567890'}
                    maxLength={isTov ? 8 : 10}
                    className={cn(
                      "h-11 font-mono",
                      getFieldError('code') && "border-destructive"
                    )}
                  />
                  {getFieldError('code') ? (
                    <p className="text-xs text-destructive">{getFieldError('code')}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {isTov ? '8 цифр з контрольною сумою' : '10 цифр з контрольною сумою'}
                    </p>
                  )}
                </div>
                
                {renderFieldWithError(
                  'Юридична адреса *',
                  'address',
                  'м. Київ, вул. Хрещатик, 1, офіс 100',
                  <MapPin className="w-3.5 h-3.5" />
                )}
              </CardContent>
            </Card>
            
            {/* Leadership */}
            <Card>
              <CardHeader className="py-2.5 px-3 sm:px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {isTov ? 'Керівництво' : 'Підприємець'}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-4 space-y-3">
                {renderFieldWithError(
                  isTov ? 'ПІБ керівника *' : 'ПІБ *',
                  'director',
                  'Прізвище Ім\'я По-батькові'
                )}
                
                {isTov && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Посада</Label>
                    <Select
                      value={formData.directorPosition}
                      onValueChange={(val) => updateField('directorPosition', val)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Оберіть посаду" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Директор">Директор</SelectItem>
                        <SelectItem value="Генеральний директор">Генеральний директор</SelectItem>
                        <SelectItem value="Голова правління">Голова правління</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* KVED */}
            <Card>
              <CardHeader className="py-2.5 px-3 sm:px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Основний вид діяльності (КВЕД) *
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-4">
                <Popover open={kvedOpen} onOpenChange={setKvedOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full h-11 justify-between",
                        !formData.mainKved && "text-muted-foreground",
                        getFieldError('mainKved') && "border-destructive"
                      )}
                    >
                      {formData.mainKved ? (
                        <span className="truncate">
                          <span className="font-mono">{formData.mainKved.code}</span>
                          <span className="ml-2">{formData.mainKved.name}</span>
                        </span>
                      ) : (
                        "Оберіть КВЕД..."
                      )}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] sm:w-[450px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Пошук за кодом або назвою..." 
                        value={kvedSearch}
                        onValueChange={setKvedSearch}
                      />
                      <CommandList>
                        <CommandEmpty>КВЕД не знайдено</CommandEmpty>
                        <CommandGroup>
                          {kvedResults.map((kved) => {
                            const kvedValidation = isFop 
                              ? validateKvedForTaxGroup(kved.code, formData.taxGroup) 
                              : { isAllowed: true, severity: 'info' as const };
                            
                            return (
                              <CommandItem
                                key={kved.code}
                                value={kved.code}
                                onSelect={() => {
                                  if (!kvedValidation.isAllowed) {
                                    toast.error(kvedValidation.reason || 'КВЕД заборонений для цієї групи');
                                    if (kvedValidation.suggestion) {
                                      toast.info(kvedValidation.suggestion);
                                    }
                                    return;
                                  }
                                  updateField('mainKved', kved);
                                  setKvedOpen(false);
                                  setKvedSearch('');
                                  if (kvedValidation.severity === 'warning') {
                                    toast.warning(kvedValidation.reason);
                                  }
                                }}
                                className={cn(
                                  "flex items-start gap-2 py-2",
                                  !kvedValidation.isAllowed && "opacity-50"
                                )}
                              >
                                <span className={cn(
                                  "font-mono text-xs px-1.5 py-0.5 rounded shrink-0",
                                  kvedValidation.isAllowed 
                                    ? "bg-muted" 
                                    : "bg-destructive/10 text-destructive"
                                )}>
                                  {kved.code}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm">{kved.name}</span>
                                  {!kvedValidation.isAllowed && (
                                    <p className="text-xs text-destructive truncate">{kvedValidation.reason}</p>
                                  )}
                                </div>
                                {!kvedValidation.isAllowed && (
                                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* KVED validation badge */}
                {formData.mainKved && isFop && (
                  <div className="mt-2">
                    <KvedValidationBadge 
                      kvedCode={formData.mainKved.code} 
                      taxGroup={formData.taxGroup}
                    />
                  </div>
                )}
                
                {getFieldError('mainKved') && (
                  <p className="text-xs text-destructive mt-1.5">{getFieldError('mainKved')}</p>
                )}
              </CardContent>
            </Card>
            
            {/* Tax Info */}
            {isFop && (
              <Card>
                <CardHeader className="py-2.5 px-3 sm:px-4">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Система оподаткування
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3 sm:px-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-sm">Група ЄП</Label>
                      <div className="text-lg font-semibold mt-1">{formData.taxGroup} група</div>
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm">Ставка</Label>
                      <div className="text-lg font-semibold mt-1">
                        {formData.taxGroup === 3 ? `${formData.taxRate}%` : 'Фіксований'}
                      </div>
                    </div>
                  </div>
                  
                  {formData.taxGroup === 3 && (
                    <RadioGroup
                      value={formData.taxRate.toString()}
                      onValueChange={(val) => updateField('taxRate', parseInt(val))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="rate-5" />
                        <Label htmlFor="rate-5">5% (без ПДВ)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="rate-3" />
                        <Label htmlFor="rate-3">3% + ПДВ</Label>
                      </div>
                    </RadioGroup>
                  )}
                  
                  {/* Income limit info */}
                  <div className="mt-3 p-2.5 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Річний ліміт доходу:</span>
                      <span className="font-semibold">
                        {formatBusinessCurrency(FOP_INCOME_LIMITS[formData.taxGroup])}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* VAT */}
            <Card>
              <CardHeader className="py-2.5 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm sm:text-base">Платник ПДВ</CardTitle>
                    {isFop && formData.taxGroup === 3 && (
                      <Badge variant="secondary" className="text-xs">
                        {formData.taxRate === 3 ? 'Обов\'язково' : 'Недоступно'}
                      </Badge>
                    )}
                  </div>
                  <Checkbox
                    checked={formData.isVatPayer}
                    onCheckedChange={(checked) => updateField('isVatPayer', checked === true)}
                    disabled={isFop && formData.taxGroup === 3}
                  />
                </div>
              </CardHeader>
              {formData.isVatPayer && (
                <CardContent className="py-2 px-3 sm:px-4">
                  {renderFieldWithError(
                    'Індивідуальний податковий номер ПДВ *',
                    'vatNumber',
                    '123456789012',
                    undefined,
                    '12 цифр'
                  )}
                </CardContent>
              )}
            </Card>
            
            {/* Banking */}
            <Card>
              <CardHeader className="py-2.5 px-3 sm:px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Банківські реквізити
                  <Badge variant="secondary" className="text-xs">Опціонально</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-4 space-y-3">
                {renderFieldWithError(
                  'IBAN',
                  'iban',
                  'UA213223130000026007233566001',
                  undefined,
                  'UA + 27 цифр'
                )}
                {renderFieldWithError(
                  'Назва банку',
                  'bankName',
                  'АТ КБ "ПРИВАТБАНК"'
                )}
              </CardContent>
            </Card>
            
            {/* Contacts */}
            <Card>
              <CardHeader className="py-2.5 px-3 sm:px-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Контакти
                  <Badge variant="secondary" className="text-xs">Опціонально</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-3 sm:px-4 space-y-3">
                {renderFieldWithError(
                  'Телефон',
                  'phone',
                  '+380501234567',
                  <Phone className="w-3.5 h-3.5" />,
                  'Для сповіщень'
                )}
                {renderFieldWithError(
                  'Email',
                  'email',
                  'info@company.ua',
                  <Mail className="w-3.5 h-3.5" />,
                  'Для документів'
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        {/* Validation summary */}
        {errors.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              Виправте помилки ({errors.length})
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-4 gap-3">
          <Button variant="ghost" onClick={onBack} className="h-11 min-w-[48px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
          <Button
            size="lg"
            onClick={handleSubmit}
            className="min-h-[48px] flex-1 sm:flex-initial"
          >
            Продовжити
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
