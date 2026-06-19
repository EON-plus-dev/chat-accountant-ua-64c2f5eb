import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon, Calculator, Ban, ShoppingCart } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  fixedAssetCategoryLabels,
  fixedAssetStatusLabels,
  fixedAssetStatusColors,
  accountingAccountLabels,
  taxGroupLabels,
  depreciationMethodLabels,
  vehicleBodyTypeLabels,
  vehicleFuelTypeLabels,
  vehicleInsuranceTypeLabels,
  equipmentEnergyClassLabels,
  intangibleAssetTypeLabels,
  intangibleTerritoryLabels,
  writeOffReasonLabels,
  calculateResidualValue,
  formatCurrency,
  type FixedAsset,
  type FixedAssetStatus,
  type DepreciationMethod,
  type VehicleBodyType,
  type VehicleFuelType,
  type VehicleInsuranceType,
  type EquipmentEnergyClass,
  type IntangibleAssetType,
  type IntangibleTerritory,
} from "@/config/fixedAssetsConfig";
import { WriteOffDialog } from "./WriteOffDialog";
import { SaleDialog } from "./SaleDialog";

const statusOptions: { value: FixedAssetStatus; label: string }[] = [
  { value: "active", label: "Активний" },
  { value: "under-repair", label: "На ремонті" },
];

const schema = z.object({
  name: z.string().trim().min(1, "Назва обов'язкова").max(200),
  status: z.enum(["active", "written-off", "sold", "under-repair"] as const),
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
  salePrice: z.coerce.number().min(0).optional(),
  // Vehicle fields
  vehicleBrand: z.string().trim().max(50).optional(),
  vehicleModel: z.string().trim().max(50).optional(),
  vehicleYear: z.coerce.number().min(1900).max(2100).optional(),
  vehicleVIN: z.string().trim().max(17).optional().refine(v => !v || /^[A-HJ-NPR-Z0-9]{17}$/i.test(v), { message: "VIN має бути 17 символів (латиниця + цифри)" }),
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

interface EditFixedAssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: FixedAsset;
  onSuccess: (updated: FixedAsset) => void;
}

export const EditFixedAssetSheet = ({
  open, onOpenChange, asset, onSuccess,
}: EditFixedAssetSheetProps) => {
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const isDisposed = asset.status === "written-off" || asset.status === "sold";
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: asset.name,
      status: asset.status,
      purchaseDate: new Date(asset.purchaseDate),
      originalCost: asset.originalCost,
      salvageValue: asset.salvageValue ?? 0,
      depreciationRate: asset.depreciationRate,
      usefulLifeMonths: asset.usefulLifeMonths,
      accountingAccount: asset.accountingAccount || "",
      taxGroup: asset.taxGroup || "",
      depreciationMethod: asset.depreciationMethod || "straight-line",
      commissioningActNumber: asset.commissioningActNumber || "",
      commissioningActDate: asset.commissioningActDate ? new Date(asset.commissioningActDate) : null,
      location: asset.location || "",
      responsiblePerson: asset.responsiblePerson || "",
      notes: asset.notes || "",
      serialNumber: asset.serialNumber || "",
      plateNumber: asset.plateNumber || "",
      licenseNumber: asset.licenseNumber || "",
      salePrice: asset.salePrice ?? 0,
      vehicleBrand: asset.vehicleBrand || "",
      vehicleModel: asset.vehicleModel || "",
      vehicleYear: asset.vehicleYear || undefined,
      vehicleVIN: asset.vehicleVIN || "",
      vehicleBodyType: asset.vehicleBodyType || "",
      vehicleFuelType: asset.vehicleFuelType || "",
      vehicleEngineVolume: asset.vehicleEngineVolume || undefined,
      vehicleMileage: asset.vehicleMileage || undefined,
      vehicleColor: asset.vehicleColor || "",
      vehicleInsuranceType: asset.vehicleInsuranceType || "",
      vehicleInsurancePolicyNumber: asset.vehicleInsurancePolicyNumber || "",
      vehicleInsuranceExpiry: asset.vehicleInsuranceExpiry ? new Date(asset.vehicleInsuranceExpiry) : null,
      vehicleLastServiceDate: asset.vehicleLastServiceDate ? new Date(asset.vehicleLastServiceDate) : null,
      vehicleNextServiceDate: asset.vehicleNextServiceDate ? new Date(asset.vehicleNextServiceDate) : null,
      vehicleNextServiceMileage: asset.vehicleNextServiceMileage || undefined,
      equipmentBrand: asset.equipmentBrand || "",
      equipmentModel: asset.equipmentModel || "",
      equipmentManufactureYear: asset.equipmentManufactureYear || undefined,
      equipmentPassportNumber: asset.equipmentPassportNumber || "",
      equipmentPowerKw: asset.equipmentPowerKw || undefined,
      equipmentVoltage: asset.equipmentVoltage || undefined,
      equipmentEnergyClass: asset.equipmentEnergyClass || "",
      equipmentOperatingHours: asset.equipmentOperatingHours || undefined,
      equipmentCalibrationDate: asset.equipmentCalibrationDate ? new Date(asset.equipmentCalibrationDate) : null,
      equipmentNextCalibrationDate: asset.equipmentNextCalibrationDate ? new Date(asset.equipmentNextCalibrationDate) : null,
      equipmentCalibrationInterval: asset.equipmentCalibrationInterval || undefined,
      equipmentWarrantyExpiry: asset.equipmentWarrantyExpiry ? new Date(asset.equipmentWarrantyExpiry) : null,
      intangibleType: asset.intangibleType || "",
      intangibleCertificateNumber: asset.intangibleCertificateNumber || "",
      intangibleRegistrationDate: asset.intangibleRegistrationDate ? new Date(asset.intangibleRegistrationDate) : null,
      intangibleExpiryDate: asset.intangibleExpiryDate ? new Date(asset.intangibleExpiryDate) : null,
      intangibleTerritory: asset.intangibleTerritory || "",
      intangibleAuthor: asset.intangibleAuthor || "",
      intangibleRightsHolder: asset.intangibleRightsHolder || "",
      intangibleRegistrationAuthority: asset.intangibleRegistrationAuthority || "",
      intangibleClassification: asset.intangibleClassification || "",
    },
  });

  const watchedStatus = form.watch("status");
  const isFinancialDisabled = watchedStatus === "written-off" || watchedStatus === "sold";

  // Rule 2: Link depreciation rate and useful life
  const handleUsefulLifeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const months = parseInt(e.target.value, 10);
    if (months > 0) {
      form.setValue("usefulLifeMonths", months);
      const rate = parseFloat((100 / (months / 12)).toFixed(2));
      form.setValue("depreciationRate", rate);
    }
  };

  const handleDepreciationRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value);
    if (rate > 0) {
      form.setValue("depreciationRate", rate);
      const months = Math.round(1200 / rate);
      form.setValue("usefulLifeMonths", months);
    }
  };

  // Rule 3: When status changes to written-off, set residual to 0
  useEffect(() => {
    if (watchedStatus === "written-off") {
      form.setValue("salvageValue", 0);
    }
  }, [watchedStatus, form]);

  // Compute display residual value
  const computedResidual = calculateResidualValue({
    ...asset,
    originalCost: form.watch("originalCost"),
    salvageValue: form.watch("salvageValue"),
    usefulLifeMonths: form.watch("usefulLifeMonths"),
    depreciationRate: form.watch("depreciationRate"),
    purchaseDate: form.watch("purchaseDate")?.toISOString().split("T")[0] || asset.purchaseDate,
  });

  const showLocation = asset.category !== "intangible";
  const showSerialNumber = asset.category === "equipment";
  const showPlateNumber = asset.category === "transport";
  const showLicenseNumber = asset.category === "intangible";
  const showEquipment = asset.category === "equipment";
  const showIntangible = asset.category === "intangible";

  const onSubmit = (data: FormValues) => {
    const updated: FixedAsset = {
      ...asset,
      name: data.name,
      status: data.status,
      purchaseDate: data.purchaseDate.toISOString().split("T")[0],
      originalCost: data.originalCost,
      residualValue: data.status === "written-off" ? 0 : computedResidual,
      salvageValue: data.salvageValue,
      depreciationRate: data.depreciationRate,
      usefulLifeMonths: data.usefulLifeMonths,
      accountingAccount: data.accountingAccount || undefined,
      taxGroup: data.taxGroup || undefined,
      depreciationMethod: data.depreciationMethod as DepreciationMethod | undefined,
      commissioningActNumber: data.commissioningActNumber || undefined,
      commissioningActDate: data.commissioningActDate ? data.commissioningActDate.toISOString().split("T")[0] : undefined,
      location: data.location || asset.location,
      responsiblePerson: data.responsiblePerson || "",
      notes: data.notes || undefined,
      serialNumber: data.serialNumber || undefined,
      plateNumber: data.plateNumber || undefined,
      licenseNumber: data.licenseNumber || undefined,
      salePrice: data.status === "sold" ? data.salePrice : undefined,
      // Vehicle fields
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
      // Equipment fields
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
    onSuccess(updated);
    toast.success("Основний засіб оновлено");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>Редагування основного засобу</SheetTitle>
          <SheetDescription>Змініть дані та натисніть «Зберегти»</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <form id="edit-fa-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
            {/* Status warnings for disposed assets */}
            {isDisposed && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {asset.status === "written-off"
                    ? `Списаний ${asset.writeOffDate ? new Date(asset.writeOffDate).toLocaleDateString("uk-UA") : ""}. ${asset.writeOffReason ? writeOffReasonLabels[asset.writeOffReason] : ""}`
                    : `Проданий ${asset.saleDate ? new Date(asset.saleDate).toLocaleDateString("uk-UA") : ""}${asset.saleBuyer ? ` — ${asset.saleBuyer}` : ""}`
                  }. Статус незворотний.
                </AlertDescription>
              </Alert>
            )}

            {/* Назва */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Назва *</Label>
              <Input id="edit-name" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            {/* Інв. номер (readonly) + Група (readonly) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Інв. номер</Label>
                <Input value={asset.inventoryNumber} readOnly className="font-mono bg-muted cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <Label>Група</Label>
                <Input value={fixedAssetCategoryLabels[asset.category]} readOnly className="bg-muted cursor-not-allowed" />
              </div>
            </div>

            {/* Статус */}
            <div className="space-y-1.5">
              <Label>Статус</Label>
              {isDisposed ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={fixedAssetStatusLabels[asset.status]}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                  <Badge variant="status" className={cn("text-xs shrink-0", fixedAssetStatusColors[asset.status])}>
                    {fixedAssetStatusLabels[asset.status]}
                  </Badge>
                </div>
              ) : (
                <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as FixedAssetStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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

            {/* Дата введення (read-only) */}
            <div className="space-y-1.5">
              <Label>Дата введення *</Label>
              <Input
                value={form.watch("purchaseDate") ? format(form.watch("purchaseDate"), "dd.MM.yyyy") : "—"}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Фіксується актом введення в експлуатацію</p>
            </div>

            {/* Commissioning act (read-only) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-actNumber">Номер акту введення</Label>
                <Input id="edit-actNumber" value={form.watch("commissioningActNumber") || "—"} readOnly className="bg-muted cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <Label>Дата акту</Label>
                <Input
                  value={form.watch("commissioningActDate") ? format(form.watch("commissioningActDate")!, "dd.MM.yyyy") : "—"}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Фіксується первинним документом</p>

            {/* Вартість */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-originalCost">Первісна вартість, ₴</Label>
                <Input id="edit-originalCost" type="number" value={form.watch("originalCost")} readOnly className="bg-muted cursor-not-allowed font-mono" />
                <p className="text-xs text-muted-foreground">Змінюється лише через документ дооцінки/уцінки</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-salvageValue">Ліквідаційна вартість, ₴</Label>
                <Input id="edit-salvageValue" type="number" min={0} {...form.register("salvageValue")} disabled={isFinancialDisabled} />
              </div>
            </div>

            {/* Residual value (readonly, computed) */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                Залишкова вартість
                <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  <Calculator className="h-3 w-3" />авто
                </span>
              </Label>
              <Input value={formatCurrency(watchedStatus === "written-off" ? 0 : computedResidual)} readOnly className="bg-muted cursor-not-allowed font-mono" />
            </div>

            {/* Амортизація — linked fields */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Поля пов'язані: зміна одного автоматично перерахує інше</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-depreciationRate">Амортизація, %/рік</Label>
                  <Input
                    id="edit-depreciationRate"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={form.watch("depreciationRate")}
                    onChange={handleDepreciationRateChange}
                    disabled={isFinancialDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-usefulLifeMonths">Строк, міс.</Label>
                  <Input
                    id="edit-usefulLifeMonths"
                    type="number"
                    min={1}
                    value={form.watch("usefulLifeMonths")}
                    onChange={handleUsefulLifeChange}
                    disabled={isFinancialDisabled}
                  />
                </div>
              </div>
            </div>

            {/* Category-specific fields */}
            {/* Category-specific read-only identifiers */}
            {showSerialNumber && (
              <div className="space-y-1.5">
                <Label>Серійний номер</Label>
                <Input value={asset.serialNumber || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Фіксується документом прийому</p>
              </div>
            )}
            {showPlateNumber && (
              <div className="space-y-1.5">
                <Label>Державний номер</Label>
                <Input value={asset.plateNumber || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Дані зі свідоцтва про реєстрацію ТЗ</p>
              </div>
            )}
            {showLicenseNumber && (
              <div className="space-y-1.5">
                <Label>Номер ліцензії / патенту</Label>
                <Input value={asset.licenseNumber || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Фіксується ліцензійним договором</p>
              </div>
            )}

            {/* Vehicle-specific fields (all read-only — data from documents) */}
            {showPlateNumber && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Транспортний засіб</p>
                <p className="text-xs text-muted-foreground -mt-2">Дані зі свідоцтва про реєстрацію ТЗ</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Марка</Label>
                    <Input value={asset.vehicleBrand || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Модель</Label>
                    <Input value={asset.vehicleModel || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Рік</Label>
                    <Input value={asset.vehicleYear?.toString() || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Колір</Label>
                    <Input value={asset.vehicleColor || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Об'єм, л</Label>
                    <Input value={asset.vehicleEngineVolume?.toString() || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>VIN-код</Label>
                  <Input value={asset.vehicleVIN || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Тип кузова</Label>
                    <Input value={asset.vehicleBodyType ? vehicleBodyTypeLabels[asset.vehicleBodyType as VehicleBodyType] || asset.vehicleBodyType : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Тип пального</Label>
                    <Input value={asset.vehicleFuelType ? vehicleFuelTypeLabels[asset.vehicleFuelType as VehicleFuelType] || asset.vehicleFuelType : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Пробіг, км</Label>
                  <Input value={asset.vehicleMileage?.toLocaleString("uk-UA") || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Фіксується документами ТО</p>
                </div>

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">Страхування</p>
                <p className="text-xs text-muted-foreground">Дані зі страхового полісу</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Тип страхування</Label>
                    <Input value={asset.vehicleInsuranceType ? vehicleInsuranceTypeLabels[asset.vehicleInsuranceType as VehicleInsuranceType] || asset.vehicleInsuranceType : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Номер полісу</Label>
                    <Input value={asset.vehicleInsurancePolicyNumber || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Дата закінчення страховки</Label>
                  <Input value={asset.vehicleInsuranceExpiry ? format(new Date(asset.vehicleInsuranceExpiry), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                </div>

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">Технічне обслуговування</p>
                <p className="text-xs text-muted-foreground">Дані з документів технічного обслуговування</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Останнє ТО</Label>
                    <Input value={asset.vehicleLastServiceDate ? format(new Date(asset.vehicleLastServiceDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Наступне ТО</Label>
                    <Input value={asset.vehicleNextServiceDate ? format(new Date(asset.vehicleNextServiceDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Пробіг наступного ТО, км</Label>
                  <Input value={asset.vehicleNextServiceMileage?.toLocaleString("uk-UA") || "—"} readOnly className="bg-muted cursor-not-allowed" />
                </div>
              </div>
            )}

            {/* Equipment-specific fields (all read-only — data from documents) */}
            {showEquipment && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Обладнання</p>
                <p className="text-xs text-muted-foreground -mt-2">Дані з технічного паспорту</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Виробник</Label>
                    <Input value={asset.equipmentBrand || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Модель</Label>
                    <Input value={asset.equipmentModel || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Рік виробництва</Label>
                    <Input value={asset.equipmentManufactureYear?.toString() || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Номер техпаспорту</Label>
                    <Input value={asset.equipmentPassportNumber || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Потужність, кВт</Label>
                    <Input value={asset.equipmentPowerKw?.toString() || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Напруга, В</Label>
                    <Input value={asset.equipmentVoltage?.toString() || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Клас енергоефективності</Label>
                    <Input value={asset.equipmentEnergyClass ? equipmentEnergyClassLabels[asset.equipmentEnergyClass as EquipmentEnergyClass] || asset.equipmentEnergyClass : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Напрацювання, мотогодин</Label>
                  <Input value={asset.equipmentOperatingHours?.toLocaleString("uk-UA") || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Фіксується в журналі обліку роботи</p>
                </div>

                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-2">Повірка та гарантія</p>
                <p className="text-xs text-muted-foreground">Дані зі свідоцтва повірки / гарантійного талону</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Остання повірка</Label>
                    <Input value={asset.equipmentCalibrationDate ? format(new Date(asset.equipmentCalibrationDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Наступна повірка</Label>
                    <Input value={asset.equipmentNextCalibrationDate ? format(new Date(asset.equipmentNextCalibrationDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Інтервал повірки, міс.</Label>
                    <Input value={asset.equipmentCalibrationInterval?.toString() || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Дата закінчення гарантії</Label>
                    <Input value={asset.equipmentWarrantyExpiry ? format(new Date(asset.equipmentWarrantyExpiry), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            {/* Intangible-specific fields (all read-only — data from certificate/patent) */}
            {showIntangible && (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium">Нематеріальний актив</p>
                <p className="text-xs text-muted-foreground -mt-2">Дані зі свідоцтва / патенту</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Тип НМА</Label>
                    <Input value={asset.intangibleType ? intangibleAssetTypeLabels[asset.intangibleType as IntangibleAssetType] || asset.intangibleType : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Номер свідоцтва / патенту</Label>
                    <Input value={asset.intangibleCertificateNumber || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Дата реєстрації</Label>
                    <Input value={asset.intangibleRegistrationDate ? format(new Date(asset.intangibleRegistrationDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Дата закінчення дії</Label>
                    <Input value={asset.intangibleExpiryDate ? format(new Date(asset.intangibleExpiryDate), "dd.MM.yyyy") : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Територія дії</Label>
                    <Input value={asset.intangibleTerritory ? intangibleTerritoryLabels[asset.intangibleTerritory as IntangibleTerritory] || asset.intangibleTerritory : "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Орган реєстрації</Label>
                    <Input value={asset.intangibleRegistrationAuthority || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Клас МКПТ / МПК</Label>
                  <Input value={asset.intangibleClassification || "—"} readOnly className="font-mono bg-muted cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Автор / винахідник</Label>
                    <Input value={asset.intangibleAuthor || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Правовласник</Label>
                    <Input value={asset.intangibleRightsHolder || "—"} readOnly className="bg-muted cursor-not-allowed" />
                  </div>
                </div>
              </div>
            )}

            {/* Місце / Відповідальний */}
            <div className={cn("grid gap-3", showLocation ? "grid-cols-2" : "grid-cols-1")}>
              {showLocation && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-location">Місцезнаходження</Label>
                  <Input id="edit-location" {...form.register("location")} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="edit-responsiblePerson">Відповідальна особа</Label>
                <Input id="edit-responsiblePerson" {...form.register("responsiblePerson")} />
              </div>
            </div>

            {/* Примітки */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-notes">Примітки</Label>
              <Textarea id="edit-notes" rows={3} {...form.register("notes")} />
            </div>

            {/* Action buttons for disposal (only for active/under-repair) */}
            {!isDisposed && (
              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground">Вибуття</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setWriteOffOpen(true)}
                  >
                    <Ban className="h-4 w-4" />
                    Списати
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setSaleOpen(true)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Продати
                  </Button>
                </div>
              </div>
            )}
          </form>
        </ScrollArea>

        {/* Sticky footer */}
        <div className="border-t px-6 py-4 flex gap-2 justify-end bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button type="submit" form="edit-fa-form">Зберегти</Button>
        </div>

        {/* Disposal dialogs */}
        <WriteOffDialog
          open={writeOffOpen}
          onOpenChange={setWriteOffOpen}
          asset={asset}
          onConfirm={(data) => {
            const updated: FixedAsset = {
              ...asset,
              status: "written-off",
              residualValue: 0,
              salvageValue: 0,
              writeOffDate: data.writeOffDate,
              writeOffReason: data.writeOffReason,
              writeOffActNumber: data.writeOffActNumber,
              writeOffCommission: data.writeOffCommission,
            };
            onSuccess(updated);
            toast.success("Основний засіб списано");
            onOpenChange(false);
          }}
        />
        <SaleDialog
          open={saleOpen}
          onOpenChange={setSaleOpen}
          asset={asset}
          onConfirm={(data) => {
            const updated: FixedAsset = {
              ...asset,
              status: "sold",
              salePrice: data.salePrice,
              saleDate: data.saleDate,
              saleBuyer: data.saleBuyer,
              saleContractNumber: data.saleContractNumber,
            };
            onSuccess(updated);
            toast.success("Основний засіб продано");
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
