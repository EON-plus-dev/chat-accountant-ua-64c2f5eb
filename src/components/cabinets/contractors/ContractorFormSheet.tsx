import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  User,
  Briefcase,
  CreditCard,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Shield,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Contractor } from "@/config/settingsConfig";
import {
  contractorFormSchema,
  type ContractorFormData,
  taxStatusOptions,
  contractorTypeOptions,
  contractorRoleOptions,
  contractorStatusOptions,
} from "@/config/contractorFormSchema";

interface ContractorFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: Contractor | null;
  onSuccess?: (data: ContractorFormData) => void;
}

interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FormSection = ({ icon, title, children }: FormSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

export const ContractorFormSheet = ({
  open,
  onOpenChange,
  contractor,
  onSuccess,
}: ContractorFormSheetProps) => {
  const isMobile = useIsMobile();
  const isEditMode = !!contractor;
  const [tags, setTags] = useState<string[]>(contractor?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<ContractorFormData>({
    resolver: zodResolver(contractorFormSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "legal",
      relationshipType: "buyer",
      status: "active",
      iban: "",
      bankName: "",
      email: "",
      phone: "",
      address: "",
      director: "",
      directorPosition: "",
      taxStatus: "",
      isEdrsVerified: false,
      paymentTermsDays: null,
      creditLimit: null,
      tags: [],
      notes: "",
    },
  });

  // Reset form when contractor changes
  useEffect(() => {
    if (contractor) {
      form.reset({
        name: contractor.name || "",
        code: contractor.code || "",
        type: contractor.type || "legal",
        relationshipType: (contractor.role === "master" ? "supplier" : contractor.role) || "buyer",
        status: contractor.status || "active",
        iban: contractor.iban || "",
        bankName: contractor.bankName || "",
        email: contractor.email || "",
        phone: contractor.phone || "",
        address: contractor.address || "",
        director: contractor.director || "",
        directorPosition: contractor.directorPosition || "",
        taxStatus: contractor.taxStatus || "",
        isEdrsVerified: contractor.isEdrsVerified || false,
        paymentTermsDays: contractor.paymentTermsDays || null,
        creditLimit: contractor.creditLimit || null,
        tags: contractor.tags || [],
        notes: contractor.notes || "",
      });
      setTags(contractor.tags || []);
    } else {
      form.reset({
        name: "",
        code: "",
        type: "legal",
        relationshipType: "buyer",
        status: "active",
        iban: "",
        bankName: "",
        email: "",
        phone: "",
        address: "",
        director: "",
        directorPosition: "",
        taxStatus: "",
        isEdrsVerified: false,
        paymentTermsDays: null,
        creditLimit: null,
        tags: [],
        notes: "",
      });
      setTags([]);
    }
  }, [contractor, form, open]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const onSubmit = (data: ContractorFormData) => {
    const formData = { ...data, tags };
    onSuccess?.(formData);
    toast.success(isEditMode ? "Контрагента оновлено" : "Контрагента створено");
    onOpenChange(false);
  };

  const watchedCode = form.watch("code");
  const watchedType = form.watch("type");

  // Auto-detect code type based on length
  const codeLabel = watchedCode?.length === 10 ? "ІПН" : "ЄДРПОУ";
  const isCodeValid =
    (watchedCode?.length === 8 && /^\d{8}$/.test(watchedCode)) ||
    (watchedCode?.length === 10 && /^\d{10}$/.test(watchedCode));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-0",
          isMobile ? "h-[90dvh] rounded-t-2xl" : "w-full sm:max-w-lg"
        )}
      >
        <SheetHeader className="px-4 py-4 sm:px-6 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Building2 className="h-5 w-5" />
                Редагувати контрагента
              </>
            ) : (
              <>
                <Building2 className="h-5 w-5" />
                Додати контрагента
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 sm:px-6">
          <Form {...form}>
            <form
              id="contractor-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              {/* Basic Info */}
              <FormSection
                icon={<Building2 className="h-4 w-4" />}
                title="Базова інформація"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Назва контрагента *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='ТОВ "Назва компанії" або ФОП Прізвище І.Б.'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{codeLabel} *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={
                              watchedType === "legal" ? "12345678" : "1234567890"
                            }
                            maxLength={10}
                            {...field}
                          />
                          {watchedCode && watchedCode.length >= 8 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isCodeValid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        {watchedType === "legal"
                          ? "8 цифр для юридичних осіб"
                          : "10 цифр для ФОП/фізичних осіб"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть тип" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contractorTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="relationshipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип відносин</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Оберіть тип" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contractorRoleOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть статус" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractorStatusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <Separator />

              {/* Bank Details */}
              <FormSection
                icon={<CreditCard className="h-4 w-4" />}
                title="Банківські реквізити"
              >
                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="UA213223130000026007233566001"
                          maxLength={29}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>UA + 27 цифр</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Назва банку</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='АТ КБ "ПриватБанк"'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <Separator />

              {/* Contact Details */}
              <FormSection
                icon={<Phone className="h-4 w-4" />}
                title="Контактні дані"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="info@company.ua"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="+380501234567" {...field} />
                      </FormControl>
                      <FormDescription>Формат: +380XXXXXXXXX</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адреса</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="м. Київ, вул. Хрещатик, 1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <Separator />

              {/* Director and Tax */}
              <FormSection
                icon={<User className="h-4 w-4" />}
                title="Керівник та податки"
              >
                <FormField
                  control={form.control}
                  name="director"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ПІБ керівника</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Петренко Іван Васильович"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="directorPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Посада</FormLabel>
                      <FormControl>
                        <Input placeholder="Директор" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Податковий статус</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть статус" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taxStatusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
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
                  name="isEdrsVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          Верифікація ЄДРС
                        </FormLabel>
                        <FormDescription>
                          Дані перевірено в реєстрі
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormSection>

              <Separator />

              {/* Cooperation Terms */}
              <FormSection
                icon={<Briefcase className="h-4 w-4" />}
                title="Умови співпраці"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTermsDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Термін оплати</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min={1}
                              max={365}
                              placeholder="30"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : null
                                )
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              днів
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Кредитний ліміт</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0}
                              placeholder="50000"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : null
                                )
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              ₴
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <Separator />

              {/* Additional Info */}
              <FormSection
                icon={<FileText className="h-4 w-4" />}
                title="Додаткова інформація"
              >
                <FormItem>
                  <FormLabel>Теги</FormLabel>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Новий тег"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                    >
                      Додати
                    </Button>
                  </div>
                </FormItem>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Нотатки</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Додаткова інформація про контрагента..."
                          className="min-h-[80px] resize-none"
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {(field.value?.length || 0)}/500 символів
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              {/* Spacer for footer */}
              <div className="h-4" />
            </form>
          </Form>
        </ScrollArea>

        {/* Sticky Footer */}
        <div
          className={cn(
            "flex items-center justify-end gap-3 px-4 py-4 sm:px-6 border-t bg-background shrink-0",
            isMobile && "pb-safe"
          )}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button type="submit" form="contractor-form">
            {isEditMode ? "Зберегти" : "Додати"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
