import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fixedAssetCategories,
  generateNextInventoryNumber,
  categoryDefaults,
  categoryToAccountMapping,
  accountingAccountLabels,
  taxGroupLabels,
  depreciationMethodLabels,
  vehicleBodyTypeLabels,
  vehicleFuelTypeLabels,
  vehicleInsuranceTypeLabels,
  equipmentEnergyClassLabels,
  intangibleAssetTypeLabels,
  intangibleTerritoryLabels,
  type FixedAsset,
  type FixedAssetCategory,
  type DepreciationMethod,
  type VehicleBodyType,
  type VehicleFuelType,
  type VehicleInsuranceType,
  type EquipmentEnergyClass,
  type IntangibleAssetType,
  type IntangibleTerritory,
} from "@/config/fixedAssetsConfig";

const schema = z.object({
  name: z.string().trim().min(1, "Назва обов'язкова").max(200),
  inventoryNumber: z.string().trim().min(1, "Інвентарний номер обов'язковий").max(50),
  category: z.enum(["equipment", "transport", "furniture", "intangible", "other"] as const),
  purchaseDate: z.date({ required_error: "Оберіть дату" }),
  originalCost: z.coerce.number().min(0, "Мін. 0"),
  salvageValue: z.coerce.number().min(0, "Мін. 0"),
  depreciationRate: z.coerce.number().min(0).max(100),
  usefulLifeMonths: z.coerce.number().int().min(1, "Мін. 1"),
  accountingAccount: z.string().optional(),
  taxGroup: z.string().optional(),
  depreciationMethod: z.enum(["straight-line", "reducing-balance", "production"] as const).optional(),
  commissioningActNumber: z.string().trim().max(50).optional(),
  commissioningActDate: z.date().optional().nullable(),
  location: z.string().trim().max(200).optional(),
  responsiblePerson: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
  serialNumber: z.string().trim().max(100).optional(),
  plateNumber: z.string().trim().max(20).optional(),
  licenseNumber: z.string().trim().max(100).optional(),
  // Vehicle fields
  vehicleBrand: z.string().trim().max(50).optional(),
  vehicleModel: z.string().trim().max(50).optional(),
  vehicleYear: z.coerce.number().min(1900).max(2100).optional(),
  vehicleVIN: z.string().trim().max(17).optional().refine(v => !v || /^[A-HJ-NPR-Z0-9]{17}$/i.test(v), { message: "VIN: 17 символів (латиниця + цифри)" }),
  vehicleBodyType: z.string().optional(),
  vehicleFuelType: z.string().optional(),
  vehicleEngineVolume: z.coerce.number().min(0).optional(),
  vehicleMileage: z.coerce.number().min(0).optional(),
  vehicleColor: z.string().trim().max(50).optional(),
  vehicleInsuranceType: z.string().optional(),
  vehicleInsurancePolicyNumber: z.string().trim().max(50).optional(),
  vehicleInsuranceExpiry: z.date().optional().nullable(),
  vehicleLastServiceDate: z.date().optional().nullable(),
  vehicleNextServiceDate: z.date().optional().nullable(),
  vehicleNextServiceMileage: z.coerce.number().min(0).optional(),
  // Equipment fields
  equipmentBrand: z.string().trim().max(100).optional(),
  equipmentModel: z.string().trim().max(100).optional(),
  equipmentManufactureYear: z.coerce.number().min(1900).max(2100).optional(),
  equipmentPassportNumber: z.string().trim().max(100).optional(),
  equipmentPowerKw: z.coerce.number().min(0).optional(),
  equipmentVoltage: z.coerce.number().min(0).optional(),
  equipmentEnergyClass: z.string().optional(),
  equipmentOperatingHours: z.coerce.number().min(0).optional(),
  equipmentCalibrationDate: z.date().optional().nullable(),
  equipmentNextCalibrationDate: z.date().optional().nullable(),
  equipmentCalibrationInterval: z.coerce.number().min(0).optional(),
  equipmentWarrantyExpiry: z.date().optional().nullable(),
  // Intangible fields
  intangibleType: z.string().optional(),
  intangibleCertificateNumber: z.string().trim().max(100).optional(),
  intangibleRegistrationDate: z.date().optional().nullable(),
  intangibleExpiryDate: z.date().optional().nullable(),
  intangibleTerritory: z.string().optional(),
  intangibleAuthor: z.string().trim().max(200).optional(),
  intangibleRightsHolder: z.string().trim().max(200).optional(),
  intangibleRegistrationAuthority: z.string().trim().max(200).optional(),
  intangibleClassification: z.string().trim().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddFixedAssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (asset: FixedAsset) => void;
  existingAssets: FixedAsset[];
}

export const AddFixedAssetSheet = ({
  open, onOpenChange, onSuccess, existingAssets,
}: AddFixedAssetSheetProps) => {
  const nextInvNum = generateNextInventoryNumber(existingAssets);
  const defaultMapping = categoryToAccountMapping["equipment"];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      inventoryNumber: nextInvNum,
      category: "equipment",
      originalCost: 0,
      salvageValue: 0,
      depreciationRate: 20,
      usefulLifeMonths: 60,
      accountingAccount: defaultMapping.account,
      taxGroup: defaultMapping.taxGroup,
      depreciationMethod: "straight-line",
      commissioningActNumber: "",
      commissioningActDate: null,
      location: "",
      responsiblePerson: "",
      notes: "",
      serialNumber: "",
      plateNumber: "",
      licenseNumber: "",
      vehicleBrand: "",
      vehicleModel: "",
      vehicleYear: undefined,
      vehicleVIN: "",
      vehicleBodyType: "",
      vehicleFuelType: "",
      vehicleEngineVolume: undefined,
      vehicleMileage: undefined,
      vehicleColor: "",
      vehicleInsuranceType: "",
      vehicleInsurancePolicyNumber: "",
      vehicleInsuranceExpiry: null,
      vehicleLastServiceDate: null,
      vehicleNextServiceDate: null,
      vehicleNextServiceMileage: undefined,
      equipmentBrand: "",
      equipmentModel: "",
      equipmentManufactureYear: undefined,
      equipmentPassportNumber: "",
      equipmentPowerKw: undefined,
      equipmentVoltage: undefined,
      equipmentEnergyClass: "",
      equipmentOperatingHours: undefined,
      equipmentCalibrationDate: null,
      equipmentNextCalibrationDate: null,
      equipmentCalibrationInterval: undefined,
      equipmentWarrantyExpiry: null,
      intangibleType: "",
      intangibleCertificateNumber: "",
      intangibleRegistrationDate: null,
      intangibleExpiryDate: null,
      intangibleTerritory: "",
      intangibleAuthor: "",
      intangibleRightsHolder: "",
      intangibleRegistrationAuthority: "",
      intangibleClassification: "",
    },
  });

  const selectedCategory = form.watch("category") as FixedAssetCategory;

  // Update defaults when category changes
  useEffect(() => {
    const defaults = categoryDefaults[selectedCategory];
    const mapping = categoryToAccountMapping[selectedCategory];
    if (defaults) {
      form.setValue("depreciationRate", defaults.depreciationRate);
      form.setValue("usefulLifeMonths", defaults.usefulLifeMonths);
    }
    if (mapping) {
      form.setValue("accountingAccount", mapping.account);
      form.setValue("taxGroup", mapping.taxGroup);
    }
  }, [selectedCategory, form]);

  const showLocation = selectedCategory !== "intangible";
  const showSerialNumber = selectedCategory === "equipment";
  const showPlateNumber = selectedCategory === "transport";
  const showLicenseNumber = selectedCategory === "intangible";
  const showEquipment = selectedCategory === "equipment";
  const showIntangible = selectedCategory === "intangible";

  const onSubmit = (data: FormValues) => {
    const newAsset: FixedAsset = {
      id: `fa-new-${Date.now()}`,
      name: data.name,
      inventoryNumber: data.inventoryNumber,
      category: data.category as FixedAssetCategory,
      purchaseDate: data.purchaseDate.toISOString().split("T")[0],
      originalCost: data.originalCost,
      residualValue: data.originalCost, // initial = original cost
      salvageValue: data.salvageValue,
      depreciationRate: data.depreciationRate,
      usefulLifeMonths: data.usefulLifeMonths,
      status: "active",
      accountingAccount: data.accountingAccount || undefined,
      taxGroup: data.taxGroup || undefined,
      depreciationMethod: data.depreciationMethod as DepreciationMethod | undefined,
      commissioningActNumber: data.commissioningActNumber || undefined,
      commissioningActDate: data.commissioningActDate ? data.commissioningActDate.toISOString().split("T")[0] : undefined,
      location: data.location || (data.category === "intangible" ? "—" : ""),
      responsiblePerson: data.responsiblePerson || "",
      notes: data.notes || undefined,
      serialNumber: data.serialNumber || undefined,
      plateNumber: data.plateNumber || undefined,
      licenseNumber: data.licenseNumber || undefined,
      vehicleBrand: data.vehicleBrand || undefined,
      vehicleModel: data.vehicleModel || undefined,
      vehicleYear: data.vehicleYear || undefined,
      vehicleVIN: data.vehicleVIN || undefined,
      vehicleBodyType: (data.vehicleBodyType as VehicleBodyType) || undefined,
      vehicleFuelType: (data.vehicleFuelType as VehicleFuelType) || undefined,
      vehicleEngineVolume: data.vehicleEngineVolume || undefined,
      vehicleMileage: data.vehicleMileage || undefined,
      vehicleColor: data.vehicleColor || undefined,
      vehicleInsuranceType: (data.vehicleInsuranceType as VehicleInsuranceType) || undefined,
      vehicleInsurancePolicyNumber: data.vehicleInsurancePolicyNumber || undefined,
      vehicleInsuranceExpiry: data.vehicleInsuranceExpiry ? data.vehicleInsuranceExpiry.toISOString().split("T")[0] : undefined,
      vehicleLastServiceDate: data.vehicleLastServiceDate ? data.vehicleLastServiceDate.toISOString().split("T")[0] : undefined,
      vehicleNextServiceDate: data.vehicleNextServiceDate ? data.vehicleNextServiceDate.toISOString().split("T")[0] : undefined,
      vehicleNextServiceMileage: data.vehicleNextServiceMileage || undefined,
      equipmentBrand: data.equipmentBrand || undefined,
      equipmentModel: data.equipmentModel || undefined,
      equipmentManufactureYear: data.equipmentManufactureYear || undefined,
      equipmentPassportNumber: data.equipmentPassportNumber || undefined,
      equipmentPowerKw: data.equipmentPowerKw || undefined,
      equipmentVoltage: data.equipmentVoltage || undefined,
      equipmentEnergyClass: (data.equipmentEnergyClass as EquipmentEnergyClass) || undefined,
      equipmentOperatingHours: data.equipmentOperatingHours || undefined,
      equipmentCalibrationDate: data.equipmentCalibrationDate ? data.equipmentCalibrationDate.toISOString().split("T")[0] : undefined,
      equipmentNextCalibrationDate: data.equipmentNextCalibrationDate ? data.equipmentNextCalibrationDate.toISOString().split("T")[0] : undefined,
      equipmentCalibrationInterval: data.equipmentCalibrationInterval || undefined,
      equipmentWarrantyExpiry: data.equipmentWarrantyExpiry ? data.equipmentWarrantyExpiry.toISOString().split("T")[0] : undefined,
      // Intangible fields
      intangibleType: (data.intangibleType as IntangibleAssetType) || undefined,
      intangibleCertificateNumber: data.intangibleCertificateNumber || undefined,
      intangibleRegistrationDate: data.intangibleRegistrationDate ? data.intangibleRegistrationDate.toISOString().split("T")[0] : undefined,
      intangibleExpiryDate: data.intangibleExpiryDate ? data.intangibleExpiryDate.toISOString().split("T")[0] : undefined,
      intangibleTerritory: (data.intangibleTerritory as IntangibleTerritory) || undefined,
      intangibleAuthor: data.intangibleAuthor || undefined,
      intangibleRightsHolder: data.intangibleRightsHolder || undefined,
      intangibleRegistrationAuthority: data.intangibleRegistrationAuthority || undefined,
      intangibleClassification: data.intangibleClassification || undefined,
    };
    onSuccess(newAsset);
    toast.success("Основний засіб додано");
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>Новий основний засіб</SheetTitle>
          <SheetDescription>Заповніть дані для створення ОЗ</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <form id="add-fa-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
            {/* Назва */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Назва *</Label>
              <Input id="name" placeholder='Напр. "Ноутбук MacBook Pro 16"' {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            {/* Інв. номер + Група */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inventoryNumber">Інв. номер *</Label>
                <Input id="inventoryNumber" className="font-mono" {...form.register("inventoryNumber")} />
                {form.formState.errors.inventoryNumber && <p className="text-xs text-destructive">{form.formState.errors.inventoryNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Група</Label>
                <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v as FixedAssetCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fixedAssetCategories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Accounting fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Рахунок обліку</Label>
                <Select value={form.watch("accountingAccount") || ""} onValueChange={(v) => form.setValue("accountingAccount", v)}>
                  <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(accountingAccountLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{k} — {v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Податкова група</Label>
                <Select value={form.watch("taxGroup") || ""} onValueChange={(v) => form.setValue("taxGroup", v)}>
                  <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(taxGroupLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Depreciation method */}
            <div className="space-y-1.5">
              <Label>Метод амортизації</Label>
              <Select value={form.watch("depreciationMethod") || "straight-line"} onValueChange={(v) => form.setValue("depreciationMethod", v as DepreciationMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(depreciationMethodLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Дата */}
            <div className="space-y-1.5">
              <Label>Дата введення *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("purchaseDate") && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("purchaseDate") ? format(form.watch("purchaseDate"), "dd.MM.yyyy") : "Оберіть дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.watch("purchaseDate")} onSelect={(d) => d && form.setValue("purchaseDate", d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {form.formState.errors.purchaseDate && <p className="text-xs text-destructive">{form.formState.errors.purchaseDate.message}</p>}
            </div>

            {/* Commissioning act */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="actNumber">Номер акту введення</Label>
                <Input id="actNumber" {...form.register("commissioningActNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label>Дата акту</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("commissioningActDate") && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("commissioningActDate") ? format(form.watch("commissioningActDate")!, "dd.MM.yyyy") : "—"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.watch("commissioningActDate") ?? undefined} onSelect={(d) => form.setValue("commissioningActDate", d ?? null)} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Вартість */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="originalCost">Первісна вартість, ₴</Label>
                <Input id="originalCost" type="number" min={0} {...form.register("originalCost")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salvageValue">Ліквідаційна вартість, ₴</Label>
                <Input id="salvageValue" type="number" min={0} {...form.register("salvageValue")} />
              </div>
            </div>

            {/* Амортизація */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="depreciationRate">Амортизація, %/рік</Label>
                <Input id="depreciationRate" type="number" min={0} max={100} {...form.register("depreciationRate")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usefulLifeMonths">Строк, міс.</Label>
                <Input id="usefulLifeMonths" type="number" min={1} {...form.register("usefulLifeMonths")} />
              </div>
            </div>

            {/* Category-specific fields */}
            {showSerialNumber && (
              <div className="space-y-1.5">
                <Label htmlFor="serialNumber">Серійний номер</Label>
                <Input id="serialNumber" className="font-mono" placeholder="S/N" {...form.register("serialNumber")} />
              </div>
            )}
            {showPlateNumber && (
              <div className="space-y-1.5">
                <Label htmlFor="plateNumber">Державний номер</Label>
                <Input id="plateNumber" className="font-mono" placeholder="АА 0000 ВВ" {...form.register("plateNumber")} />
              </div>
            )}
            {showLicenseNumber && (
              <div className="space-y-1.5">
                <Label htmlFor="licenseNumber">Номер ліцензії / патенту</Label>
                <Input id="licenseNumber" className="font-mono" placeholder="LIC-XXXX" {...form.register("licenseNumber")} />
              </div>
            )}

            {/* Vehicle-specific fields */}
            {showPlateNumber && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Транспортний засіб</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleBrand">Марка</Label>
                    <Input id="vehicleBrand" placeholder="Ford" {...form.register("vehicleBrand")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleModel">Модель</Label>
                    <Input id="vehicleModel" placeholder="Transit" {...form.register("vehicleModel")} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleYear">Рік</Label>
                    <Input id="vehicleYear" type="number" min={1900} max={2100} {...form.register("vehicleYear")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleColor">Колір</Label>
                    <Input id="vehicleColor" {...form.register("vehicleColor")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleEngineVolume">Об'єм, л</Label>
                    <Input id="vehicleEngineVolume" type="number" step="0.1" min={0} {...form.register("vehicleEngineVolume")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleVIN">VIN-код</Label>
                  <Input id="vehicleVIN" className="font-mono" placeholder="17 символів" maxLength={17} {...form.register("vehicleVIN")} />
                  {form.formState.errors.vehicleVIN && <p className="text-xs text-destructive">{form.formState.errors.vehicleVIN.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Тип кузова</Label>
                    <Select value={form.watch("vehicleBodyType") || ""} onValueChange={(v) => form.setValue("vehicleBodyType", v)}>
                      <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(vehicleBodyTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Тип пального</Label>
                    <Select value={form.watch("vehicleFuelType") || ""} onValueChange={(v) => form.setValue("vehicleFuelType", v)}>
                      <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(vehicleFuelTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleMileage">Пробіг, км</Label>
                  <Input id="vehicleMileage" type="number" min={0} {...form.register("vehicleMileage")} />
                </div>

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">Страхування</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Тип страхування</Label>
                    <Select value={form.watch("vehicleInsuranceType") || ""} onValueChange={(v) => form.setValue("vehicleInsuranceType", v)}>
                      <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(vehicleInsuranceTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicleInsurancePolicyNumber">Номер полісу</Label>
                    <Input id="vehicleInsurancePolicyNumber" className="font-mono" {...form.register("vehicleInsurancePolicyNumber")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Дата закінчення страховки</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("vehicleInsuranceExpiry") && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("vehicleInsuranceExpiry") ? format(form.watch("vehicleInsuranceExpiry")!, "dd.MM.yyyy") : "—"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={form.watch("vehicleInsuranceExpiry") ?? undefined} onSelect={(d) => form.setValue("vehicleInsuranceExpiry", d ?? null)} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">Технічне обслуговування</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Останнє ТО</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("vehicleLastServiceDate") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("vehicleLastServiceDate") ? format(form.watch("vehicleLastServiceDate")!, "dd.MM.yyyy") : "—"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.watch("vehicleLastServiceDate") ?? undefined} onSelect={(d) => form.setValue("vehicleLastServiceDate", d ?? null)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Наступне ТО</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("vehicleNextServiceDate") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("vehicleNextServiceDate") ? format(form.watch("vehicleNextServiceDate")!, "dd.MM.yyyy") : "—"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.watch("vehicleNextServiceDate") ?? undefined} onSelect={(d) => form.setValue("vehicleNextServiceDate", d ?? null)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleNextServiceMileage">Пробіг наступного ТО, км</Label>
                  <Input id="vehicleNextServiceMileage" type="number" min={0} {...form.register("vehicleNextServiceMileage")} />
                </div>
              </div>
            )}

            {/* Equipment-specific fields */}
            {showEquipment && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Обладнання</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="equipmentBrand">Виробник</Label>
                    <Input id="equipmentBrand" placeholder="Bosch" {...form.register("equipmentBrand")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="equipmentModel">Модель</Label>
                    <Input id="equipmentModel" {...form.register("equipmentModel")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="equipmentManufactureYear">Рік виробництва</Label>
                    <Input id="equipmentManufactureYear" type="number" min={1900} max={2100} {...form.register("equipmentManufactureYear")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="equipmentPassportNumber">Номер техпаспорту</Label>
                    <Input id="equipmentPassportNumber" className="font-mono" {...form.register("equipmentPassportNumber")} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="equipmentPowerKw">Потужність, кВт</Label>
                    <Input id="equipmentPowerKw" type="number" step="0.01" min={0} {...form.register("equipmentPowerKw")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="equipmentVoltage">Напруга, В</Label>
                    <Input id="equipmentVoltage" type="number" min={0} {...form.register("equipmentVoltage")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Клас енергоеф.</Label>
                    <Select value={form.watch("equipmentEnergyClass") || ""} onValueChange={(v) => form.setValue("equipmentEnergyClass", v)}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(equipmentEnergyClassLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="equipmentOperatingHours">Напрацювання, мотогодин</Label>
                  <Input id="equipmentOperatingHours" type="number" min={0} {...form.register("equipmentOperatingHours")} />
                </div>

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">Повірка та гарантія</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Остання повірка</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("equipmentCalibrationDate") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("equipmentCalibrationDate") ? format(form.watch("equipmentCalibrationDate")!, "dd.MM.yyyy") : "—"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.watch("equipmentCalibrationDate") ?? undefined} onSelect={(d) => form.setValue("equipmentCalibrationDate", d ?? null)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Наступна повірка</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("equipmentNextCalibrationDate") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("equipmentNextCalibrationDate") ? format(form.watch("equipmentNextCalibrationDate")!, "dd.MM.yyyy") : "—"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.watch("equipmentNextCalibrationDate") ?? undefined} onSelect={(d) => form.setValue("equipmentNextCalibrationDate", d ?? null)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="equipmentCalibrationInterval">Інтервал повірки, міс.</Label>
                    <Input id="equipmentCalibrationInterval" type="number" min={0} {...form.register("equipmentCalibrationInterval")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Дата закінчення гарантії</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("equipmentWarrantyExpiry") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("equipmentWarrantyExpiry") ? format(form.watch("equipmentWarrantyExpiry")!, "dd.MM.yyyy") : "—"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.watch("equipmentWarrantyExpiry") ?? undefined} onSelect={(d) => form.setValue("equipmentWarrantyExpiry", d ?? null)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Intangible-specific fields */}
            {showIntangible && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Нематеріальний актив</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Тип НМА</Label>
                    <Select value={form.watch("intangibleType") || ""} onValueChange={(v) => form.setValue("intangibleType", v)}>
                      <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(intangibleAssetTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="intangibleCertificateNumber">Номер свідоцтва / патенту</Label>
                    <Input id="intangibleCertificateNumber" className="font-mono" {...form.register("intangibleCertificateNumber")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Дата реєстрації</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("intangibleRegistrationDate") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("intangibleRegistrationDate") ? format(form.watch("intangibleRegistrationDate")!, "dd.MM.yyyy") : "—"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.watch("intangibleRegistrationDate") ?? undefined} onSelect={(d) => form.setValue("intangibleRegistrationDate", d ?? null)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Дата закінчення дії</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch("intangibleExpiryDate") && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch("intangibleExpiryDate") ? format(form.watch("intangibleExpiryDate")!, "dd.MM.yyyy") : "—"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.watch("intangibleExpiryDate") ?? undefined} onSelect={(d) => form.setValue("intangibleExpiryDate", d ?? null)} className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Територія дії</Label>
                    <Select value={form.watch("intangibleTerritory") || ""} onValueChange={(v) => form.setValue("intangibleTerritory", v)}>
                      <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(intangibleTerritoryLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="intangibleRegistrationAuthority">Орган реєстрації</Label>
                    <Input id="intangibleRegistrationAuthority" placeholder="НОІВ, Мін'юст..." {...form.register("intangibleRegistrationAuthority")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="intangibleClassification">Клас МКПТ / МПК</Label>
                  <Input id="intangibleClassification" className="font-mono" placeholder="G06F 16/00" {...form.register("intangibleClassification")} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="intangibleAuthor">Автор / винахідник</Label>
                    <Input id="intangibleAuthor" {...form.register("intangibleAuthor")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="intangibleRightsHolder">Правовласник</Label>
                    <Input id="intangibleRightsHolder" {...form.register("intangibleRightsHolder")} />
                  </div>
                </div>
              </div>
            )}

            {/* Місце / Відповідальний */}
            <div className={cn("grid gap-3", showLocation ? "grid-cols-2" : "grid-cols-1")}>
              {showLocation && (
                <div className="space-y-1.5">
                  <Label htmlFor="location">Місцезнаходження</Label>
                  <Input id="location" {...form.register("location")} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="responsiblePerson">Відповідальна особа</Label>
                <Input id="responsiblePerson" {...form.register("responsiblePerson")} />
              </div>
            </div>

            {/* Примітки */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Примітки</Label>
              <Textarea id="notes" rows={3} {...form.register("notes")} />
            </div>
          </form>
        </ScrollArea>

        {/* Sticky footer */}
        <div className="border-t px-6 py-4 flex gap-2 justify-end bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button type="submit" form="add-fa-form">Зберегти</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
