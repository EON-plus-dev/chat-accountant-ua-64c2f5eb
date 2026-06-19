import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type FixedAsset,
  fixedAssetCategoryLabels,
  fixedAssetCategoryColors,
  fixedAssetStatusLabels,
  fixedAssetStatusColors,
  calculateWearPercent,
  formatCurrency,
  calculateResidualValue,
  calculateMonthlyDepreciation,
  calculateRemainingMonths,
  calculateDepreciationEndDate,
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
  type EquipmentEnergyClass,
  type IntangibleAssetType,
  type IntangibleTerritory,
} from "@/config/fixedAssetsConfig";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  MapPin, User, Calendar, Hash, FileText, Car, KeyRound, Barcode,
  BookOpen, Landmark, Calculator, Clock, TrendingDown,
  Gauge, Shield, Wrench, Fuel, Palette, AlertTriangle,
  Zap, Plug, Factory, ClipboardCheck, Globe, UserCheck, Award,
  Ban, ShoppingCart, DollarSign,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FixedAssetInfoTabProps {
  asset: FixedAsset;
}

const AutoBadge = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-1">
          <Calculator className="h-3 w-3" />авто
        </span>
      </TooltipTrigger>
      <TooltipContent><p>Розраховується автоматично</p></TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const InfoRow = ({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <span className="text-muted-foreground">{label}:</span>
    <span className={cn(mono && "font-mono", "font-medium")}>{value}</span>
  </div>
);

function isDateExpiredOrSoon(dateStr: string | undefined, daysWarning = 30): "expired" | "soon" | "ok" {
  if (!dateStr) return "ok";
  const d = new Date(dateStr);
  const now = new Date();
  if (d < now) return "expired";
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff <= daysWarning) return "soon";
  return "ok";
}

export const FixedAssetInfoTab = ({ asset }: FixedAssetInfoTabProps) => {
  const wear = calculateWearPercent(asset);
  const computedResidual = calculateResidualValue(asset);
  const monthlyDepr = calculateMonthlyDepreciation(asset);
  const remainingMonths = calculateRemainingMonths(asset);
  const endDate = calculateDepreciationEndDate(asset);
  const salvage = asset.salvageValue ?? 0;
  const depreciableAmount = Math.max(0, asset.originalCost - salvage);
  const accountLabel = asset.accountingAccount ? `${asset.accountingAccount} — ${accountingAccountLabels[asset.accountingAccount] || ""}` : "—";
  const taxLabel = asset.taxGroup ? taxGroupLabels[asset.taxGroup] || `Група ${asset.taxGroup}` : "—";
  const methodLabel = asset.depreciationMethod ? depreciationMethodLabels[asset.depreciationMethod] : "Прямолінійний";

  const insuranceStatus = isDateExpiredOrSoon(asset.vehicleInsuranceExpiry);
  const serviceStatus = isDateExpiredOrSoon(asset.vehicleNextServiceDate);
  const calibrationStatus = isDateExpiredOrSoon(asset.equipmentNextCalibrationDate);
  const warrantyStatus = isDateExpiredOrSoon(asset.equipmentWarrantyExpiry);
  const intangibleExpiryStatus = isDateExpiredOrSoon(asset.intangibleExpiryDate);

  return (
    <div className="space-y-4">
      {/* Card 1 — General info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Загальні відомості</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow icon={Hash} label="Інв. номер" value={asset.inventoryNumber} mono />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Група:</span>
              <Badge variant="status" className={cn("text-xs", fixedAssetCategoryColors[asset.category])}>
                {fixedAssetCategoryLabels[asset.category]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Статус:</span>
              <Badge variant="status" className={cn("text-xs", fixedAssetStatusColors[asset.status])}>
                {fixedAssetStatusLabels[asset.status]}
              </Badge>
            </div>
            <InfoRow icon={Landmark} label="Рахунок обліку" value={accountLabel} />
            <InfoRow icon={BookOpen} label="Податкова група" value={taxLabel} />
            <InfoRow icon={Calendar} label="Дата введення" value={new Date(asset.purchaseDate).toLocaleDateString("uk-UA")} />

            {asset.commissioningActNumber && (
              <InfoRow icon={FileText} label="Акт введення" value={`№${asset.commissioningActNumber}${asset.commissioningActDate ? ` від ${new Date(asset.commissioningActDate).toLocaleDateString("uk-UA")}` : ""}`} />
            )}

            {asset.category !== "intangible" && (
              <InfoRow icon={MapPin} label="Місце" value={asset.location} />
            )}
            <InfoRow icon={User} label="Відповідальний" value={asset.responsiblePerson} />

            {asset.category === "equipment" && asset.serialNumber && (
              <InfoRow icon={Barcode} label="Серійний №" value={asset.serialNumber} mono />
            )}
            {asset.category === "transport" && asset.plateNumber && (
              <InfoRow icon={Car} label="Держ. номер" value={asset.plateNumber} mono />
            )}
            {asset.category === "intangible" && asset.licenseNumber && (
              <InfoRow icon={KeyRound} label="№ ліцензії" value={asset.licenseNumber} mono />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card — Disposal info (written-off or sold) */}
      {(asset.status === "written-off" || asset.status === "sold") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {asset.status === "written-off" ? <Ban className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              Вибуття
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.status === "written-off" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.writeOffDate && <InfoRow icon={Calendar} label="Дата списання" value={new Date(asset.writeOffDate).toLocaleDateString("uk-UA")} />}
                {asset.writeOffReason && <InfoRow icon={Ban} label="Причина" value={writeOffReasonLabels[asset.writeOffReason]} />}
                {asset.writeOffActNumber && <InfoRow icon={FileText} label="Акт списання №" value={asset.writeOffActNumber} mono />}
                {asset.writeOffCommission && (
                  <div className="sm:col-span-2">
                    <div className="flex items-start gap-2 text-sm rounded-lg bg-muted/50 p-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Висновок комісії</p>
                        <p className="text-sm">{asset.writeOffCommission}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {asset.status === "sold" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.saleDate && <InfoRow icon={Calendar} label="Дата продажу" value={new Date(asset.saleDate).toLocaleDateString("uk-UA")} />}
                {asset.salePrice != null && <InfoRow icon={DollarSign} label="Ціна продажу" value={formatCurrency(asset.salePrice)} />}
                {asset.saleBuyer && <InfoRow icon={User} label="Покупець" value={asset.saleBuyer} />}
                {asset.saleContractNumber && <InfoRow icon={FileText} label="Договір №" value={asset.saleContractNumber} mono />}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card — Intangible asset (intangible only) */}
      {asset.category === "intangible" && (asset.intangibleType || asset.intangibleCertificateNumber || asset.intangibleAuthor || asset.intangibleRightsHolder) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4" /> Нематеріальний актив
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Expiry alerts */}
            {intangibleExpiryStatus === "expired" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Строк дії закінчився! Дата: {new Date(asset.intangibleExpiryDate!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}
            {intangibleExpiryStatus === "soon" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Строк дії закінчується незабаром: {new Date(asset.intangibleExpiryDate!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}

            {/* Registration */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Реєстрація</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.intangibleType && <InfoRow icon={Award} label="Тип НМА" value={intangibleAssetTypeLabels[asset.intangibleType]} />}
                {asset.intangibleCertificateNumber && <InfoRow icon={FileText} label="Номер свідоцтва / патенту" value={asset.intangibleCertificateNumber} mono />}
                {asset.intangibleRegistrationDate && <InfoRow icon={Calendar} label="Дата реєстрації" value={new Date(asset.intangibleRegistrationDate).toLocaleDateString("uk-UA")} />}
                {asset.intangibleRegistrationAuthority && <InfoRow icon={Landmark} label="Орган реєстрації" value={asset.intangibleRegistrationAuthority} />}
                {asset.intangibleClassification && <InfoRow icon={Hash} label="Клас МКПТ / МПК" value={asset.intangibleClassification} mono />}
              </div>
            </div>

            {/* Rights */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Права</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.intangibleAuthor && <InfoRow icon={UserCheck} label="Автор / винахідник" value={asset.intangibleAuthor} />}
                {asset.intangibleRightsHolder && <InfoRow icon={User} label="Правовласник" value={asset.intangibleRightsHolder} />}
                {asset.intangibleTerritory && <InfoRow icon={Globe} label="Територія дії" value={intangibleTerritoryLabels[asset.intangibleTerritory]} />}
                {asset.intangibleExpiryDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Дійсний до:</span>
                    <span className={cn("font-medium", intangibleExpiryStatus === "expired" && "text-destructive", intangibleExpiryStatus === "soon" && "text-amber-600")}>
                      {new Date(asset.intangibleExpiryDate).toLocaleDateString("uk-UA")}
                    </span>
                    {intangibleExpiryStatus === "expired" && <Badge variant="destructive" className="text-[10px]">Прострочений</Badge>}
                    {intangibleExpiryStatus === "soon" && <Badge className="text-[10px] bg-amber-100 text-amber-700">Закінчується</Badge>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card 2 — Vehicle (transport only) */}
      {asset.category === "transport" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" /> Транспортний засіб
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alerts */}
            {insuranceStatus === "expired" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Страховка прострочена! Дата закінчення: {new Date(asset.vehicleInsuranceExpiry!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}
            {insuranceStatus === "soon" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Страховка закінчується незабаром: {new Date(asset.vehicleInsuranceExpiry!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}
            {serviceStatus === "expired" && (
              <Alert variant="destructive">
                <Wrench className="h-4 w-4" />
                <AlertDescription>ТО прострочено! Запланована дата: {new Date(asset.vehicleNextServiceDate!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}

            {/* Identification */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ідентифікація</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.vehicleBrand && <InfoRow icon={Car} label="Марка / Модель" value={`${asset.vehicleBrand} ${asset.vehicleModel || ""}`} />}
                {asset.vehicleYear && <InfoRow icon={Calendar} label="Рік випуску" value={asset.vehicleYear} />}
                {asset.vehicleVIN && <InfoRow icon={Hash} label="VIN" value={asset.vehicleVIN} mono />}
                {asset.vehicleColor && <InfoRow icon={Palette} label="Колір" value={asset.vehicleColor} />}
                {asset.vehicleBodyType && <InfoRow icon={Car} label="Тип кузова" value={vehicleBodyTypeLabels[asset.vehicleBodyType]} />}
                {asset.vehicleFuelType && <InfoRow icon={Fuel} label="Пальне" value={vehicleFuelTypeLabels[asset.vehicleFuelType]} />}
                {asset.vehicleEngineVolume && <InfoRow icon={Gauge} label="Об'єм двигуна" value={`${asset.vehicleEngineVolume} л`} />}
              </div>
            </div>

            {/* Operation */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Експлуатація</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.vehicleMileage != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Пробіг:</span>
                    <span className="font-mono font-medium">{asset.vehicleMileage.toLocaleString("uk-UA")}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">км</Badge>
                  </div>
                )}
                {asset.vehicleLastServiceDate && <InfoRow icon={Wrench} label="Останнє ТО" value={new Date(asset.vehicleLastServiceDate).toLocaleDateString("uk-UA")} />}
                {asset.vehicleNextServiceDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Наступне ТО:</span>
                    <span className={cn("font-medium", serviceStatus === "expired" && "text-destructive")}>{new Date(asset.vehicleNextServiceDate).toLocaleDateString("uk-UA")}</span>
                  </div>
                )}
                {asset.vehicleNextServiceMileage && (
                  <InfoRow icon={Gauge} label="ТО при пробігу" value={`${asset.vehicleNextServiceMileage.toLocaleString("uk-UA")} км`} />
                )}
              </div>
            </div>

            {/* Insurance */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Страхування</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.vehicleInsuranceType && <InfoRow icon={Shield} label="Тип" value={vehicleInsuranceTypeLabels[asset.vehicleInsuranceType]} />}
                {asset.vehicleInsurancePolicyNumber && <InfoRow icon={FileText} label="Поліс №" value={asset.vehicleInsurancePolicyNumber} mono />}
                {asset.vehicleInsuranceExpiry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Дійсна до:</span>
                    <span className={cn("font-medium", insuranceStatus === "expired" && "text-destructive", insuranceStatus === "soon" && "text-amber-600")}>
                      {new Date(asset.vehicleInsuranceExpiry).toLocaleDateString("uk-UA")}
                    </span>
                    {insuranceStatus === "expired" && <Badge variant="destructive" className="text-[10px]">Прострочена</Badge>}
                    {insuranceStatus === "soon" && <Badge className="text-[10px] bg-amber-100 text-amber-700">Закінчується</Badge>}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card — Equipment (equipment only) */}
      {asset.category === "equipment" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4" /> Обладнання
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alerts */}
            {calibrationStatus === "expired" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Повірка прострочена! Дата: {new Date(asset.equipmentNextCalibrationDate!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}
            {calibrationStatus === "soon" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Повірка закінчується незабаром: {new Date(asset.equipmentNextCalibrationDate!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}
            {warrantyStatus === "expired" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Гарантія закінчилась! Дата: {new Date(asset.equipmentWarrantyExpiry!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}
            {warrantyStatus === "soon" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Гарантія закінчується незабаром: {new Date(asset.equipmentWarrantyExpiry!).toLocaleDateString("uk-UA")}</AlertDescription>
              </Alert>
            )}

            {/* Identification */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ідентифікація</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {asset.equipmentBrand && <InfoRow icon={Factory} label="Виробник / Модель" value={`${asset.equipmentBrand} ${asset.equipmentModel || ""}`} />}
                {asset.equipmentManufactureYear && <InfoRow icon={Calendar} label="Рік виробництва" value={asset.equipmentManufactureYear} />}
                {asset.equipmentPassportNumber && <InfoRow icon={FileText} label="Техпаспорт №" value={asset.equipmentPassportNumber} mono />}
                {asset.serialNumber && <InfoRow icon={Barcode} label="Серійний №" value={asset.serialNumber} mono />}
              </div>
            </div>

            {/* Technical specs */}
            {(asset.equipmentPowerKw || asset.equipmentVoltage || asset.equipmentEnergyClass || asset.equipmentOperatingHours) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Технічні характеристики</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {asset.equipmentPowerKw != null && <InfoRow icon={Zap} label="Потужність" value={`${asset.equipmentPowerKw} кВт`} />}
                  {asset.equipmentVoltage != null && <InfoRow icon={Plug} label="Напруга" value={`${asset.equipmentVoltage} В`} />}
                  {asset.equipmentEnergyClass && <InfoRow icon={Zap} label="Клас енергоефективності" value={equipmentEnergyClassLabels[asset.equipmentEnergyClass]} />}
                  {asset.equipmentOperatingHours != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Напрацювання:</span>
                      <span className="font-mono font-medium">{asset.equipmentOperatingHours.toLocaleString("uk-UA")}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">мотогодин</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Calibration & Warranty */}
            {(asset.equipmentCalibrationDate || asset.equipmentNextCalibrationDate || asset.equipmentWarrantyExpiry) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Повірка та гарантія</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {asset.equipmentCalibrationDate && <InfoRow icon={ClipboardCheck} label="Остання повірка" value={new Date(asset.equipmentCalibrationDate).toLocaleDateString("uk-UA")} />}
                  {asset.equipmentNextCalibrationDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Наступна повірка:</span>
                      <span className={cn("font-medium", calibrationStatus === "expired" && "text-destructive", calibrationStatus === "soon" && "text-amber-600")}>
                        {new Date(asset.equipmentNextCalibrationDate).toLocaleDateString("uk-UA")}
                      </span>
                      {calibrationStatus === "expired" && <Badge variant="destructive" className="text-[10px]">Прострочена</Badge>}
                      {calibrationStatus === "soon" && <Badge className="text-[10px] bg-amber-100 text-amber-700">Закінчується</Badge>}
                    </div>
                  )}
                  {asset.equipmentCalibrationInterval && <InfoRow icon={Clock} label="Інтервал повірки" value={`${asset.equipmentCalibrationInterval} міс.`} />}
                  {asset.equipmentWarrantyExpiry && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Гарантія до:</span>
                      <span className={cn("font-medium", warrantyStatus === "expired" && "text-destructive", warrantyStatus === "soon" && "text-amber-600")}>
                        {new Date(asset.equipmentWarrantyExpiry).toLocaleDateString("uk-UA")}
                      </span>
                      {warrantyStatus === "expired" && <Badge variant="destructive" className="text-[10px]">Закінчилась</Badge>}
                      {warrantyStatus === "soon" && <Badge className="text-[10px] bg-amber-100 text-amber-700">Закінчується</Badge>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card — Value & depreciation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Вартість та амортизація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Первісна вартість</p>
              <p className="text-lg font-mono font-semibold">{formatCurrency(asset.originalCost)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Ліквідаційна вартість</p>
              <p className="text-lg font-mono font-semibold">{formatCurrency(salvage)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground flex items-center">Вартість, що амортизується <AutoBadge /></p>
              <p className="text-lg font-mono font-semibold">{formatCurrency(depreciableAmount)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground flex items-center">Залишкова вартість <AutoBadge /></p>
              <p className="text-lg font-mono font-semibold">{formatCurrency(computedResidual)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Знос</span>
              <span className="font-medium">{wear}%</span>
            </div>
            <Progress value={wear} className="h-2" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> Метод:</span>
              <span>{methodLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Річна норма:</span>
              <span>{asset.depreciationRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Строк використання:</span>
              <span>{asset.usefulLifeMonths} міс.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Залишковий строк:</span>
              <span className="flex items-center">{remainingMonths} міс. <AutoBadge /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Закінчення амортизації:</span>
              <span className="flex items-center">{new Date(endDate).toLocaleDateString("uk-UA")} <AutoBadge /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Щомісячна амортизація:</span>
              <span className="flex items-center font-mono">{formatCurrency(monthlyDepr)} <AutoBadge /></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4 — Notes */}
      {asset.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Примітки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 text-sm rounded-lg bg-muted/50 p-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-muted-foreground">{asset.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
