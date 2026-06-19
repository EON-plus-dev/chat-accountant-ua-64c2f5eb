import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";
import {
  contractorRoleOptions,
} from "@/config/contractorFormSchema";

const searchSchema = z.object({
  code: z.string().min(8, "Мінімум 8 цифр").max(10, "Максимум 10 цифр").regex(/^\d+$/, "Тільки цифри"),
});

const contractorSchema = z.object({
  name: z.string().min(1, "Обов'язкове поле"),
  code: z.string().min(8).max(10),
  type: z.enum(["legal", "individual", "fop"]),
  role: z.enum(["supplier", "buyer", "both"]),
  address: z.string().optional(),
  director: z.string().optional(),
  taxStatus: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;
type ContractorFormData = z.infer<typeof contractorSchema>;

interface RegistrySearchFormProps {
  cabinet: Cabinet;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RegistryResult {
  status: "verified" | "not_found" | "suspended";
  data?: {
    name: string;
    code: string;
    type: "legal" | "individual" | "fop";
    address?: string;
    director?: string;
    taxStatus?: string;
  };
}

// Mock registry search
const searchRegistry = async (code: string): Promise<RegistryResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  // Mock responses based on code
  if (code === "12345678") {
    return {
      status: "verified",
      data: {
        name: 'ТОВ "Технопром Груп"',
        code: "12345678",
        type: "legal",
        address: "м. Київ, вул. Хрещатик, 22",
        director: "Петренко Олександр Васильович",
        taxStatus: "Платник ПДВ",
      },
    };
  }
  
  if (code === "87654321") {
    return {
      status: "suspended",
      data: {
        name: 'ТОВ "Закрита компанія"',
        code: "87654321",
        type: "legal",
        address: "м. Одеса, вул. Дерибасівська, 1",
        director: "Іваненко І.І.",
        taxStatus: "Анульовано",
      },
    };
  }
  
  if (code.length === 10) {
    return {
      status: "verified",
      data: {
        name: "ФОП Шевченко Марія Іванівна",
        code,
        type: "fop",
        address: "м. Львів, вул. Личаківська, 45",
        taxStatus: "Єдиний податок, 3 група",
      },
    };
  }
  
  return { status: "not_found" };
};

export const RegistrySearchForm = ({
  cabinet,
  onSuccess,
  onCancel,
}: RegistrySearchFormProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<RegistryResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { code: "" },
  });

  const contractorForm = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "legal",
      role: "buyer",
      address: "",
      director: "",
      taxStatus: "",
    },
  });

  const handleSearch = async (data: SearchFormData) => {
    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const result = await searchRegistry(data.code);
      setSearchResult(result);
      
      if (result.status === "verified" && result.data) {
        contractorForm.reset({
          name: result.data.name,
          code: result.data.code,
          type: result.data.type,
          role: "buyer",
          address: result.data.address || "",
          director: result.data.director || "",
          taxStatus: result.data.taxStatus || "",
        });
        toast.success("Контрагента знайдено в реєстрі");
      } else if (result.status === "suspended") {
        toast.warning("Контрагент призупинений", {
          description: "Перевірте статус у ЄДР",
        });
        if (result.data) {
          contractorForm.reset({
            name: result.data.name,
            code: result.data.code,
            type: result.data.type,
            role: "buyer",
            address: result.data.address || "",
            director: result.data.director || "",
            taxStatus: result.data.taxStatus || "",
          });
        }
      } else {
        toast.error("Не знайдено", {
          description: "Контрагента не знайдено в реєстрах ЄДР/ДРФО",
        });
      }
    } catch {
      toast.error("Помилка пошуку");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (data: ContractorFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.success("Контрагента додано", {
      description: data.name,
    });
    
    setIsSubmitting(false);
    onSuccess?.();
  };

  const statusIcons = {
    verified: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
    suspended: <AlertCircle className="h-5 w-5 text-amber-500" />,
    not_found: <XCircle className="h-5 w-5 text-destructive" />,
  };

  const statusLabels = {
    verified: "Верифіковано",
    suspended: "Призупинено",
    not_found: "Не знайдено",
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4 sm:px-6">
        <div className="space-y-6 py-4">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Пошук за кодом</span>
            </div>
            
            <Form {...searchForm}>
              <form onSubmit={searchForm.handleSubmit(handleSearch)} className="flex gap-2">
                <FormField
                  control={searchForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Введіть ЄДРПОУ або ІПН"
                          maxLength={10}
                          className="font-mono"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value.replace(/\D/g, ""));
                            setSearchResult(null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-xs text-muted-foreground">
              Пошук у реєстрах ЄДР, ДРФО та податкових баз
            </p>
          </div>

          {/* Search Result Status */}
          {searchResult && (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              searchResult.status === "verified" 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : searchResult.status === "suspended"
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-destructive/10 border-destructive/20"
            }`}>
              {statusIcons[searchResult.status]}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {statusLabels[searchResult.status]}
                </p>
                {searchResult.data && (
                  <p className="text-xs text-muted-foreground">
                    {searchResult.data.name}
                  </p>
                )}
              </div>
              {searchResult.status === "verified" && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  ЄДР
                </Badge>
              )}
            </div>
          )}

          {/* Contractor Form - shown after successful search */}
          {searchResult && searchResult.data && (
            <>
              <Separator />
              
              <Form {...contractorForm}>
                <form 
                  id="contractor-form"
                  onSubmit={contractorForm.handleSubmit(handleSubmit)} 
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Дані контрагента</span>
                  </div>

                  <FormField
                    control={contractorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Назва *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={contractorForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ЄДРПОУ / ІПН</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="font-mono bg-muted" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contractorForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Роль</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
                        </FormItem>
                      )}
                    />
                  </div>

                  {contractorForm.watch("address") && (
                    <FormField
                      control={contractorForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Адреса</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {contractorForm.watch("director") && (
                    <FormField
                      control={contractorForm.control}
                      name="director"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Керівник</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  {contractorForm.watch("taxStatus") && (
                    <FormField
                      control={contractorForm.control}
                      name="taxStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Податковий статус</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="bg-muted" />
                          </FormControl>
                          <FormDescription>
                            Дані з реєстру
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                </form>
              </Form>
            </>
          )}

          {/* Empty state for not found */}
          {searchResult?.status === "not_found" && (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Не знайдено в державних реєстрах
              </p>
              <p className="text-xs text-muted-foreground">
                Спробуйте запросити контрагента через вкладку "Запросити до системи"
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="shrink-0 border-t p-4 sm:px-6 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Скасувати
        </Button>
        <Button
          className="flex-1"
          form="contractor-form"
          type="submit"
          disabled={!searchResult?.data || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Збереження...
            </>
          ) : (
            "Додати"
          )}
        </Button>
      </div>
    </div>
  );
};
