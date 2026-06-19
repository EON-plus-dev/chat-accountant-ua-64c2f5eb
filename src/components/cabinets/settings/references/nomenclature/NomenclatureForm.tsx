/**
 * NomenclatureForm - Main form component with react-hook-form + zod validation
 * Progressive disclosure with collapsible sections
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Save, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { NomenclatureItemV2, VatRate, PriceTier, Dimensions, WarrantyType, ReturnPolicy } from "@/config/nomenclatureConfig";
import { calculatePriceWithVat, calculateStockStatus, validateEAN13 } from "@/config/nomenclatureConfig";
import { NomenclatureFormBasicSection } from "./NomenclatureFormBasicSection";
import { NomenclatureFormPricingSection } from "./NomenclatureFormPricingSection";
import { NomenclatureFormStockSection } from "./NomenclatureFormStockSection";
import { NomenclatureFormLogisticsSection } from "./NomenclatureFormLogisticsSection";
import { NomenclatureFormWarrantySection } from "./NomenclatureFormWarrantySection";
import { NomenclatureFormTagsSection } from "./NomenclatureFormTagsSection";

// ============ Zod Schema ============

const dimensionsSchema = z.object({
  length: z.coerce.number().min(0, "Мін. 0"),
  width: z.coerce.number().min(0, "Мін. 0"),
  height: z.coerce.number().min(0, "Мін. 0"),
}).optional();

const priceTierSchema = z.object({
  minQuantity: z.coerce.number().min(2, "Мін. 2").default(2),
  price: z.coerce.number().min(0.01, "Мін. 0.01").default(0.01),
  description: z.string().optional(),
});

export const nomenclatureFormSchema = z.object({
  // Type
  category: z.enum(["product", "service"]),
  
  // Identification
  name: z.string().min(2, "Мінімум 2 символи").max(200, "Максимум 200 символів"),
  shortName: z.string().max(50, "Максимум 50 символів").optional().or(z.literal("")),
  sku: z.string().min(3, "Мінімум 3 символи").max(30, "Максимум 30 символів"),
  barcode: z.string()
    .refine(val => !val || /^\d{13}$/.test(val), "EAN-13: 13 цифр")
    .refine(val => !val || validateEAN13(val), "Невірна контрольна сума EAN-13")
    .optional()
    .or(z.literal("")),
  uktzedCode: z.string()
    .refine(val => !val || /^\d{10}$/.test(val), "10 цифр")
    .optional()
    .or(z.literal("")),
  vendorCode: z.string().max(50, "Максимум 50 символів").optional().or(z.literal("")),
  description: z.string().max(1000, "Максимум 1000 символів").optional().or(z.literal("")),
  
  // Unit
  unitCode: z.string().min(1, "Оберіть одиницю виміру"),
  
  // Pricing
  basePrice: z.coerce.number().min(0.01, "Мінімум 0.01"),
  currency: z.string().default("UAH"),
  vatRate: z.coerce.number().refine(val => [0, 7, 20].includes(val), "Оберіть ставку ПДВ") as z.ZodType<VatRate>,
  
  // Purchase (optional, for products)
  purchasePrice: z.coerce.number().min(0).optional().or(z.nan().transform(() => undefined)),
  purchaseCurrency: z.string().optional(),
  purchaseVatRate: z.coerce.number().optional() as z.ZodType<VatRate | undefined>,
  
  // Price tiers
  priceTiers: z.array(priceTierSchema).optional(),
  
  // Stock (for products)
  initialStock: z.coerce.number().min(0).optional().or(z.nan().transform(() => undefined)),
  reorderPoint: z.coerce.number().min(0).optional().or(z.nan().transform(() => undefined)),
  
  // Logistics
  weight: z.coerce.number().min(0).optional().or(z.nan().transform(() => undefined)),
  dimensions: dimensionsSchema,
  packagingType: z.string().optional().or(z.literal("")),
  countryOfOrigin: z.string().optional().or(z.literal("")),
  
  // Warranty
  warrantyMonths: z.coerce.number().min(0).max(120).optional().or(z.nan().transform(() => undefined)),
  warrantyType: z.enum(["manufacturer", "seller", "extended"]).optional(),
  returnDays: z.coerce.number().min(0).max(365).optional().or(z.nan().transform(() => undefined)),
  returnPolicy: z.enum(["full", "exchange", "none"]).optional(),
  
  // Tags
  tags: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  
  // State
  isActive: z.boolean().default(true),
  isFavorite: z.boolean().default(false),
});

export type NomenclatureFormData = z.infer<typeof nomenclatureFormSchema>;

// ============ Helper: Generate SKU ============

export const generateSKU = (category: "product" | "service"): string => {
  const prefix = category === "product" ? "PROD" : "SRV";
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

// ============ Helper: Form Data to NomenclatureItemV2 ============

const formDataToNomenclatureItem = (
  data: NomenclatureFormData,
  cabinetId: string
): NomenclatureItemV2 => {
  const now = new Date().toISOString();
  const marginAmount = data.purchasePrice ? data.basePrice - data.purchasePrice : undefined;
  const marginPercent = data.purchasePrice && data.purchasePrice > 0
    ? (marginAmount! / data.purchasePrice) * 100
    : undefined;

  return {
    id: `nom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sku: data.sku,
    barcode: data.barcode || undefined,
    uktzedCode: data.uktzedCode || undefined,
    vendorCode: data.vendorCode || undefined,
    name: data.name,
    shortName: data.shortName || undefined,
    description: data.description || undefined,
    category: data.category,
    categoryId: data.categoryId || undefined,
    tags: data.tags || [],
    unitCode: data.unitCode,
    pricing: {
      basePrice: data.basePrice,
      currency: data.currency,
      vatRate: data.vatRate,
      priceWithVat: calculatePriceWithVat(data.basePrice, data.vatRate),
      purchasePrice: data.purchasePrice,
      purchaseCurrency: data.purchaseCurrency,
      purchaseVatRate: data.purchaseVatRate,
      marginAmount,
      marginPercent,
      priceTiers: data.priceTiers as PriceTier[] | undefined,
    },
    stock: data.category === "product" ? {
      quantity: data.initialStock || 0,
      reserved: 0,
      available: data.initialStock || 0,
      reorderPoint: data.reorderPoint || 5,
      status: calculateStockStatus(data.initialStock || 0, data.reorderPoint || 5),
      lastUpdated: now,
    } : undefined,
    logistics: data.category === "product" && (data.weight || data.dimensions) ? {
      weight: data.weight,
      dimensions: data.dimensions as Dimensions | undefined,
      packagingType: data.packagingType || undefined,
      countryOfOrigin: data.countryOfOrigin || undefined,
    } : undefined,
    productService: data.category === "product" && data.warrantyMonths ? {
      warrantyMonths: data.warrantyMonths,
      warrantyType: data.warrantyType as WarrantyType | undefined,
      returnDays: data.returnDays,
      returnPolicy: data.returnPolicy as ReturnPolicy | undefined,
    } : undefined,
    sync: {
      source: "manual",
      syncStatus: "synced",
    },
    isActive: data.isActive,
    isFavorite: data.isFavorite,
    createdAt: now,
    updatedAt: now,
  };
};

// ============ Helper: Map existing item to form defaults ============

const itemToFormDefaults = (item: NomenclatureItemV2): NomenclatureFormData => ({
  category: item.category,
  name: item.name,
  shortName: item.shortName || "",
  sku: item.sku,
  barcode: item.barcode || "",
  uktzedCode: item.uktzedCode || "",
  vendorCode: item.vendorCode || "",
  description: item.description || "",
  unitCode: item.unitCode,
  basePrice: item.pricing.basePrice,
  currency: item.pricing.currency,
  vatRate: item.pricing.vatRate,
  purchasePrice: item.pricing.purchasePrice,
  purchaseCurrency: item.pricing.purchaseCurrency || "UAH",
  purchaseVatRate: item.pricing.purchaseVatRate,
  priceTiers: item.pricing.priceTiers || [],
  initialStock: item.stock?.quantity,
  reorderPoint: item.stock?.reorderPoint || 5,
  weight: item.logistics?.weight,
  dimensions: item.logistics?.dimensions,
  packagingType: item.logistics?.packagingType || "",
  countryOfOrigin: item.logistics?.countryOfOrigin || "",
  warrantyMonths: item.productService?.warrantyMonths,
  warrantyType: item.productService?.warrantyType,
  returnDays: item.productService?.returnDays || 14,
  returnPolicy: item.productService?.returnPolicy || "full",
  tags: item.tags || [],
  categoryId: item.categoryId || "",
  isActive: item.isActive,
  isFavorite: item.isFavorite,
});

const emptyDefaults: NomenclatureFormData = {
  category: "product",
  name: "",
  shortName: "",
  sku: generateSKU("product"),
  barcode: "",
  uktzedCode: "",
  vendorCode: "",
  description: "",
  unitCode: "шт",
  basePrice: 0,
  currency: "UAH",
  vatRate: 20,
  purchasePrice: undefined,
  purchaseCurrency: "UAH",
  purchaseVatRate: 20,
  priceTiers: [],
  initialStock: undefined,
  reorderPoint: 5,
  weight: undefined,
  dimensions: undefined,
  packagingType: "",
  countryOfOrigin: "",
  warrantyMonths: undefined,
  warrantyType: undefined,
  returnDays: 14,
  returnPolicy: "full",
  tags: [],
  categoryId: "",
  isActive: true,
  isFavorite: false,
};

// ============ Component ============

interface NomenclatureFormProps {
  cabinetId: string;
  initialData?: NomenclatureItemV2;
  onSuccess: (item: NomenclatureItemV2) => void;
  onCancel: () => void;
}

export const NomenclatureForm = ({ cabinetId, initialData, onSuccess, onCancel }: NomenclatureFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<NomenclatureFormData>({
    resolver: zodResolver(nomenclatureFormSchema),
    defaultValues: initialData ? itemToFormDefaults(initialData) : emptyDefaults,
  });

  const category = form.watch("category");
  const basePrice = form.watch("basePrice");
  const purchasePrice = form.watch("purchasePrice");

  // Auto-regenerate SKU when category changes
  const handleCategoryChange = (newCategory: "product" | "service") => {
    form.setValue("category", newCategory);
    form.setValue("sku", generateSKU(newCategory));
    
    // Set default unit based on category
    if (newCategory === "service") {
      form.setValue("unitCode", "послуга");
      form.setValue("vatRate", 0);
    } else {
      form.setValue("unitCode", "шт");
      form.setValue("vatRate", 20);
    }
  };

  const handleRegenerateSku = () => {
    form.setValue("sku", generateSKU(category));
  };

  const onSubmit = async (data: NomenclatureFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resultItem = formDataToNomenclatureItem(data, cabinetId);
      
      // Preserve id and createdAt when editing
      if (isEditMode && initialData) {
        resultItem.id = initialData.id;
        resultItem.createdAt = initialData.createdAt;
      }
      
      toast.success(isEditMode ? "Зміни збережено" : "Позицію створено", {
        description: `${resultItem.name} (${resultItem.sku})`,
      });
      
      onSuccess(resultItem);
    } catch (error) {
      toast.error("Помилка створення", {
        description: "Не вдалося створити позицію. Спробуйте ще раз.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = () => {
    toast.info("Чернетку збережено", {
      description: "Форму збережено як чернетку (демо)",
    });
  };

  // Calculate margin for display
  const marginAmount = purchasePrice && basePrice ? basePrice - purchasePrice : null;
  const marginPercent = purchasePrice && purchasePrice > 0 && marginAmount !== null
    ? (marginAmount / purchasePrice) * 100
    : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20">
        {/* Basic Info Section */}
        <NomenclatureFormBasicSection
          form={form}
          category={category}
          onCategoryChange={handleCategoryChange}
          onRegenerateSku={handleRegenerateSku}
        />

        {/* Pricing Section */}
        <NomenclatureFormPricingSection
          form={form}
          category={category}
          marginAmount={marginAmount}
          marginPercent={marginPercent}
        />

        {/* Stock Section - Only for products */}
        {category === "product" && (
          <NomenclatureFormStockSection form={form} />
        )}

        {/* Logistics Section - Only for products */}
        {category === "product" && (
          <NomenclatureFormLogisticsSection form={form} />
        )}

        {/* Warranty Section - Only for products */}
        {category === "product" && (
          <NomenclatureFormWarrantySection form={form} />
        )}

        {/* Tags Section */}
        <NomenclatureFormTagsSection form={form} />

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-2xl p-4 bg-background border-t flex gap-2 justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Скасувати
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={isSubmitting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Чернетка
            </Button>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? "Зберегти зміни" : "Створити"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
