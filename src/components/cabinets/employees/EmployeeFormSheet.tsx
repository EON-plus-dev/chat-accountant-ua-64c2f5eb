import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  User, Phone, Briefcase, FileText, Building2, MessageSquare,
  CalendarIcon, AlertCircle, CheckCircle2
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import {
  ContractType,
  EmploymentMode,
  WorkLocation,
  Employee,
  contractTypeConfig,
  employmentModeConfig,
  workLocationConfig,
} from "@/config/employeesConfig";

// ===== Валідація ІПН (РНОКПП) =====
const validateIPN = (ipn: string): boolean => {
  if (!/^\d{10}$/.test(ipn)) return false;
  const weights = [-1, 5, 7, 9, 4, 6, 10, 5, 7];
  const sum = weights.reduce((acc, w, i) => acc + w * parseInt(ipn[i]), 0);
  const control = (sum % 11) % 10;
  return control === parseInt(ipn[9]);
};

// ===== Zod-схема форми =====
const employeeFormSchema = z.object({
  // Ідентифікація
  lastName: z.string().min(2, "Мінімум 2 символи").max(50, "Максимум 50 символів"),
  firstName: z.string().min(2, "Мінімум 2 символи").max(50, "Максимум 50 символів"),
  middleName: z.string().max(50).optional(),
  ipn: z.string()
    .length(10, "ІПН має містити 10 цифр")
    .regex(/^\d{10}$/, "ІПН має містити тільки цифри")
    .refine(validateIPN, "Невірна контрольна сума ІПН"),
  passport: z.string()
    .min(8, "Введіть серію та номер паспорта")
    .refine((val) => {
      const bookPattern = /^[А-ЯІЇЄҐ]{2}\d{6}$/;
      const idPattern = /^\d{9}$/;
      return bookPattern.test(val) || idPattern.test(val);
    }, "Формат: АБ123456 (книжка) або 123456789 (ID-картка)"),
  birthDate: z.date({ required_error: "Вкажіть дату народження" }),

  // Контакти
  phone: z.string()
    .regex(/^\+380\d{9}$/, "Формат: +380XXXXXXXXX")
    .or(z.literal(""))
    .optional(),
  email: z.string().email("Невірний формат email").or(z.literal("")).optional(),
  address: z.string().max(200).optional(),

  // Робота
  position: z.string().min(2, "Вкажіть посаду").max(100),
  contractType: z.enum(["labor", "civil", "fop-contractor"] as const),
  startDate: z.date({ required_error: "Вкажіть дату початку" }),
  hasProbation: z.boolean().default(false),
  probationMonths: z.number().min(1).max(3).optional(),
  employmentMode: z.enum(["full-time", "part-time", "hourly"] as const),
  fte: z.number().min(0.1).max(1.0).default(1.0),
  schedule: z.string().max(100).optional(),
  location: z.enum(["office", "remote", "hybrid"] as const),

  // Договір
  contractNumber: z.string().optional(),
  contractDate: z.date().optional(),

  // Банк
  iban: z.string()
    .regex(/^UA\d{27}$/, "Формат: UA + 27 цифр")
    .or(z.literal(""))
    .optional(),

  // Коментарі
  comments: z.string().max(500).optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// ===== Секція форми =====
interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ icon, title, children }: FormSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </span>
    </div>
    {children}
  </div>
);

// ===== Генерація номера договору =====
const generateContractNumber = (
  contractType: ContractType,
  existingCount: number
): string => {
  const year = new Date().getFullYear();
  const prefix = contractType === "labor" ? "ТД" : contractType === "civil" ? "ЦПД" : "ФОП";
  const number = String(existingCount + 1).padStart(3, "0");
  return `${prefix}-${year}-${number}`;
};

// ===== Парсинг ПІБ =====
const parseFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    lastName: parts[0] || "",
    firstName: parts[1] || "",
    middleName: parts[2] || "",
  };
};

// ===== Props =====
interface EmployeeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinetId: string;
  existingEmployeesCount: number;
  employee?: Employee | null; // Для редагування
  onSuccess?: (data: EmployeeFormData) => void;
}

export function EmployeeFormSheet({
  open,
  onOpenChange,
  cabinetId,
  existingEmployeesCount,
  employee,
  onSuccess,
}: EmployeeFormSheetProps) {
  const { toast } = useToast();
  const [ipnValid, setIpnValid] = useState<boolean | null>(null);
  
  const isEditMode = !!employee;

  // Дефолтні значення для форми
  const getDefaultValues = (): Partial<EmployeeFormData> => {
    if (employee) {
      const { lastName, firstName, middleName } = parseFullName(employee.fullName);
      return {
        lastName,
        firstName,
        middleName,
        ipn: "", // ІПН не зберігається в демо-даних
        passport: "", // Паспорт не зберігається в демо-даних
        birthDate: undefined,
        phone: "",
        email: "",
        address: "",
        position: employee.position,
        contractType: employee.contractType,
        startDate: new Date(employee.startDate),
        hasProbation: employee.status === "probation",
        probationMonths: 3,
        employmentMode: employee.employmentMode,
        fte: employee.fte || 1.0,
        schedule: employee.schedule || "Пн-Пт 9:00-18:00",
        location: employee.location,
        contractNumber: employee.contractNumber || "",
        contractDate: employee.contractDate ? new Date(employee.contractDate) : undefined,
        iban: "",
        comments: employee.comments || "",
      };
    }
    
    return {
      lastName: "",
      firstName: "",
      middleName: "",
      ipn: "",
      passport: "",
      phone: "",
      email: "",
      address: "",
      position: "",
      contractType: "labor",
      hasProbation: false,
      probationMonths: 3,
      employmentMode: "full-time",
      fte: 1.0,
      schedule: "Пн-Пт 9:00-18:00",
      location: "office",
      contractNumber: "",
      iban: "",
      comments: "",
    };
  };

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Скидаємо форму при зміні employee
  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues());
    }
  }, [open, employee]);

  const watchContractType = form.watch("contractType");
  const watchHasProbation = form.watch("hasProbation");
  const watchEmploymentMode = form.watch("employmentMode");
  const watchStartDate = form.watch("startDate");
  const watchIpn = form.watch("ipn");

  // Валідація ІПН в реальному часі
  useEffect(() => {
    if (watchIpn && watchIpn.length === 10) {
      setIpnValid(validateIPN(watchIpn));
    } else {
      setIpnValid(null);
    }
  }, [watchIpn]);

  // Автогенерація номера договору (тільки для нового працівника)
  useEffect(() => {
    if (!isEditMode && watchContractType) {
      const number = generateContractNumber(watchContractType, existingEmployeesCount);
      form.setValue("contractNumber", number);
    }
  }, [watchContractType, existingEmployeesCount, form, isEditMode]);

  // Дата договору = дата початку (тільки для нового)
  useEffect(() => {
    if (!isEditMode && watchStartDate) {
      form.setValue("contractDate", watchStartDate);
    }
  }, [watchStartDate, form, isEditMode]);

  // FTE для повної зайнятості
  useEffect(() => {
    if (watchEmploymentMode === "full-time") {
      form.setValue("fte", 1.0);
    }
  }, [watchEmploymentMode, form]);

  const onSubmit = (data: EmployeeFormData) => {
    if (import.meta.env.DEV) console.log("Employee data:", data);
    toast({
      title: isEditMode ? "Зміни збережено (демо)" : "Працівника додано (демо)",
      description: `${data.lastName} ${data.firstName} — ${data.position}`,
    });
    onSuccess?.(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0">
          <SheetTitle>
            {isEditMode ? "Редагувати працівника" : "Додати працівника"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode 
              ? "Внесіть зміни до даних працівника"
              : "Заповніть обов'язкові поля для кадрового обліку"
            }
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
              {/* ===== СЕКЦІЯ 1: Ідентифікація ===== */}
              <FormSection icon={<User className="h-4 w-4" />} title="Ідентифікація особи">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Прізвище *</FormLabel>
                        <FormControl>
                          <Input placeholder="Петренко" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ім'я *</FormLabel>
                        <FormControl>
                          <Input placeholder="Олег" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>По батькові</FormLabel>
                        <FormControl>
                          <Input placeholder="Іванович" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ipn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ІПН (РНОКПП) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="1234567890" 
                              maxLength={10}
                              {...field} 
                            />
                            {ipnValid !== null && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                {ipnValid ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                )}
                              </span>
                            )}
                          </div>
                        </FormControl>
                        {ipnValid === true && (
                          <p className="text-xs text-emerald-600">Контрольна сума вірна</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата народження *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd.MM.yyyy", { locale: uk })
                                ) : (
                                  <span>Виберіть дату</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1940}
                              toYear={2010}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Паспорт *</FormLabel>
                      <FormControl>
                        <Input placeholder="АБ123456 або 123456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Формат: АБ123456 (книжка) або 123456789 (ID-картка)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <Separator />

              {/* ===== СЕКЦІЯ 2: Контакти ===== */}
              <FormSection icon={<Phone className="h-4 w-4" />} title="Контактні дані">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input placeholder="+380671234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="email@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адреса реєстрації</FormLabel>
                      <FormControl>
                        <Input placeholder="м. Київ, вул. Хрещатик, 1" {...field} />
                      </FormControl>
                      <FormDescription>Для офіційних документів</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <Separator />

              {/* ===== СЕКЦІЯ 3: Робота ===== */}
              <FormSection icon={<Briefcase className="h-4 w-4" />} title="Дані про роботу">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Посада *</FormLabel>
                      <FormControl>
                        <Input placeholder="Менеджер з продажу" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип договору *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Виберіть тип" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-50 bg-popover">
                            {(Object.keys(contractTypeConfig) as ContractType[]).map((type) => (
                              <SelectItem key={type} value={type}>
                                {contractTypeConfig[type].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата початку *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd.MM.yyyy", { locale: uk })
                                ) : (
                                  <span>Виберіть дату</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Випробувальний термін - тільки для трудового */}
                {watchContractType === "labor" && (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <FormField
                      control={form.control}
                      name="hasProbation"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Випробувальний термін
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    {watchHasProbation && (
                      <FormField
                        control={form.control}
                        name="probationMonths"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select 
                              onValueChange={(v) => field.onChange(parseInt(v))} 
                              value={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-50 bg-popover">
                                <SelectItem value="1">1 місяць</SelectItem>
                                <SelectItem value="2">2 місяці</SelectItem>
                                <SelectItem value="3">3 місяці</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employmentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Режим зайнятості</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-50 bg-popover">
                            {(Object.keys(employmentModeConfig) as EmploymentMode[]).map((mode) => (
                              <SelectItem key={mode} value={mode}>
                                {employmentModeConfig[mode].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fte"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Частка ставки</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="1.0"
                            disabled={watchEmploymentMode === "full-time"}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          1.0 = повна ставка, 0.5 = пів ставки
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Графік роботи</FormLabel>
                        <FormControl>
                          <Input placeholder="Пн-Пт 9:00-18:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Локація</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-50 bg-popover">
                            {(Object.keys(workLocationConfig) as WorkLocation[]).map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {workLocationConfig[loc].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <Separator />

              {/* ===== СЕКЦІЯ 4: Договір ===== */}
              <FormSection icon={<FileText className="h-4 w-4" />} title="Договір">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Номер договору</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly={!isEditMode}
                            className={cn(!isEditMode && "bg-muted/50")}
                          />
                        </FormControl>
                        {!isEditMode && (
                          <FormDescription>Автоматично згенеровано</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата договору</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd.MM.yyyy", { locale: uk })
                                ) : (
                                  <span>= дата початку</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <Separator />

              {/* ===== СЕКЦІЯ 5: Банк ===== */}
              <FormSection icon={<Building2 className="h-4 w-4" />} title="Банківські реквізити">
                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input placeholder="UA123456789012345678901234567" {...field} />
                      </FormControl>
                      <FormDescription>
                        Використовується для виплат у підрозділі «Платежі»
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <Separator />

              {/* ===== СЕКЦІЯ 6: Коментарі ===== */}
              <FormSection icon={<MessageSquare className="h-4 w-4" />} title="Коментарі">
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Додаткова інформація про працівника..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>
            </form>
          </Form>
        </ScrollArea>

        {/* ===== Footer ===== */}
        <div className="shrink-0 border-t px-6 py-4 flex items-center justify-end gap-3 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            {isEditMode ? "Зберегти зміни" : "Додати працівника"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Backward compatibility exports
export { EmployeeFormSheet as AddEmployeeSheet };
