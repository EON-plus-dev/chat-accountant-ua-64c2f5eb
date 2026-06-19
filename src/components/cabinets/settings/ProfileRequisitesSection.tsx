import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, User, MapPin, CreditCard, Phone, FileText, Stamp, ShieldCheck, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { getEntityStyle } from "@/config/entityStyles";
import { cn } from "@/lib/utils";
import { PartnerProgramOptInCard } from "./PartnerProgramOptInCard";

interface ProfileRequisitesSectionProps {
  cabinet: Cabinet;
}

// Fields that come from EDR registry and cannot be edited
const EDR_READONLY_FIELDS = ["fullName", "shortName", "edrpou", "taxId", "legalAddress", "registrationAddress"];

// Check if a field is read-only (from registry)
const isReadOnlyField = (fieldId: string, isVerified: boolean): boolean => {
  return isVerified && EDR_READONLY_FIELDS.includes(fieldId);
};

export const ProfileRequisitesSection = ({ cabinet }: ProfileRequisitesSectionProps) => {
  // Demo data based on cabinet type
  // In real app, this would come from API with isEdrsVerified flag
  const isEdrsVerified = true; // Assume verified from EDR for demo

  const getDemoData = () => {
    if (cabinet.type === "tov") {
      return {
        fullName: `Товариство з обмеженою відповідальністю "${cabinet.name.replace("ТОВ ", "").replace(/[«»"]/g, "")}"`,
        shortName: cabinet.name,
        edrpou: cabinet.taxId || "12345678",
        legalAddress: "м. Київ, вул. Хрещатик, 1, офіс 101",
        factualAddress: "м. Київ, вул. Хрещатик, 1, офіс 101",
        isVatPayer: true,
        vatNumber: "123456789012",
        iban: "UA213223130000026007233566001",
        bankName: "АТ КБ «ПриватБанк»",
        mfo: "305299",
        phone: "+380 44 123 45 67",
        email: "info@company.ua",
        website: "https://company.ua",
        representativeName: "Петренко Олександр Іванович",
        representativePosition: "Директор",
        usesStamp: true,
      };
    }

    if (cabinet.type === "fop") {
      const ownerName = cabinet.name.replace("ФОП ", "");
      return {
        fullName: ownerName,
        taxId: cabinet.taxId || "1234567890",
        registrationAddress: "м. Київ, вул. Шевченка, 10, кв. 5",
        businessAddress: "м. Київ, вул. Шевченка, 10, кв. 5",
        iban: "UA213223130000026007233566001",
        bankName: "АТ «Monobank»",
        phone: "+380 67 123 45 67",
        email: "fop@example.com",
      };
    }

    if (cabinet.type === "fop-group") {
      return {
        groupName: cabinet.name,
        adminName: "Адміністратор Консалтинг",
        fopList: ["ФОП Іваненко О.П.", "ФОП Петренко М.І.", "ФОП Сидоренко А.В."],
      };
    }

    // individual
    return {
      fullName: cabinet.name,
      taxId: cabinet.taxId || "1234567890",
      address: "м. Київ, вул. Незалежності, 25, кв. 10",
      phone: "+380 67 987 65 43",
      email: "person@example.com",
    };
  };

  const data = getDemoData();
  const entityStyle = getEntityStyle(cabinet.type);
  const EntityIcon = entityStyle.icon;

  // Helper component for read-only field with EDR badge
  const ReadOnlyField = ({ 
    id, 
    label, 
    value, 
    required = false, 
    mono = false 
  }: { 
    id: string; 
    label: string; 
    value: string; 
    required?: boolean;
    mono?: boolean;
  }) => {
    const readOnly = isReadOnlyField(id, isEdrsVerified);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {readOnly && (
            <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
              <ShieldCheck className="h-3 w-3" />
              ЄДР
            </Badge>
          )}
        </div>
        <div className="relative">
          <Input 
            id={id} 
            value={value}
            readOnly={readOnly}
            className={cn(
              mono && "font-mono tabular-nums tracking-wider",
              readOnly && "bg-muted/50 cursor-not-allowed pr-10"
            )}
          />
          {readOnly && (
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* EDR Verification Banner */}
      {isEdrsVerified && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Дані верифіковано через ЄДР</p>
            <p className="text-xs text-muted-foreground">
              Поля з реєстру захищені від редагування для забезпечення цілісності даних
            </p>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <Card className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <EntityIcon className={cn("h-5 w-5", entityStyle.color)} />
            <CardTitle className="text-base">Основна інформація</CardTitle>
            <Badge className={entityStyle.badgeClass}>{entityStyle.label}</Badge>
          </div>
          <CardDescription>Дані для ідентифікації та документів</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cabinet.type === "tov" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <ReadOnlyField 
                  id="fullName" 
                  label="Повна назва" 
                  value={data.fullName} 
                  required 
                />
                <ReadOnlyField 
                  id="shortName" 
                  label="Скорочена назва" 
                  value={data.shortName} 
                  required 
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ReadOnlyField 
                  id="edrpou" 
                  label="Код ЄДРПОУ" 
                  value={data.edrpou} 
                  required 
                  mono 
                />
                <div className="space-y-2 flex items-end gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="vatPayer" defaultChecked={data.isVatPayer} />
                    <Label htmlFor="vatPayer">Платник ПДВ</Label>
                  </div>
                  {data.isVatPayer && (
                    <div className="flex-1">
                      <Label htmlFor="vatNumber">ІПН платника ПДВ</Label>
                      <Input id="vatNumber" defaultValue={data.vatNumber} className="font-mono tabular-nums tracking-wider mt-1" />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {cabinet.type === "fop" && (
            <>
              <ReadOnlyField 
                id="fullName" 
                label="ПІБ" 
                value={data.fullName} 
                required 
              />
              <ReadOnlyField 
                id="taxId" 
                label="РНОКПП (ІПН)" 
                value={data.taxId} 
                required 
                mono 
              />
            </>
          )}

          {cabinet.type === "fop-group" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="groupName">Назва групи <span className="text-destructive">*</span></Label>
                <Input id="groupName" defaultValue={data.groupName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Адміністратор групи</Label>
                <Input id="adminName" defaultValue={data.adminName} />
              </div>
              <div className="space-y-2">
                <Label>ФОП у складі групи</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.fopList?.map((fop, i) => (
                    <Badge key={i} variant="secondary">{fop}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {cabinet.type === "individual" && (
            <>
              <ReadOnlyField 
                id="fullName" 
                label="ПІБ" 
                value={data.fullName} 
                required 
              />
              <ReadOnlyField 
                id="taxId" 
                label="РНОКПП" 
                value={data.taxId} 
                required 
                mono 
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Addresses */}
      {cabinet.type !== "fop-group" && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Адреси</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cabinet.type === "tov" && (
              <>
                <ReadOnlyField 
                  id="legalAddress" 
                  label="Юридична адреса" 
                  value={data.legalAddress} 
                  required 
                />
                <div className="space-y-2">
                  <Label htmlFor="factualAddress">Фактична адреса (опційно)</Label>
                  <Input id="factualAddress" defaultValue={data.factualAddress} />
                </div>
              </>
            )}
            {cabinet.type === "fop" && (
              <>
                <ReadOnlyField 
                  id="registrationAddress" 
                  label="Адреса реєстрації" 
                  value={data.registrationAddress} 
                  required 
                />
                <div className="space-y-2">
                  <Label htmlFor="busAddress">Адреса діяльності (опційно)</Label>
                  <Input id="busAddress" defaultValue={data.businessAddress} />
                </div>
              </>
            )}
            {cabinet.type === "individual" && (
              <div className="space-y-2">
                <Label htmlFor="address">Адреса <span className="text-destructive">*</span></Label>
                <Input id="address" defaultValue={data.address} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bank Details */}
      {cabinet.type !== "fop-group" && cabinet.type !== "individual" && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Банківські реквізити</CardTitle>
              </div>
              {/* Demo: show confirmed badge if IBAN is from bank transaction */}
              <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
                <CheckCircle className="h-3 w-3" />
                Підтверджено транзакцією
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN <span className="text-destructive">*</span></Label>
              <Input id="iban" defaultValue={data.iban} className="font-mono tabular-nums tracking-wider text-sm" />
              {/* Warning about IBAN change */}
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Зміна IBAN вплине на платіжні документи та виписки
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">Банк <span className="text-destructive">*</span></Label>
                <Input id="bankName" defaultValue={data.bankName} />
              </div>
              {cabinet.type === "tov" && (
                <div className="space-y-2">
                  <Label htmlFor="mfo">МФО</Label>
                  <Input id="mfo" defaultValue={data.mfo} className="font-mono tabular-nums tracking-wider" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Контактні дані</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон <span className="text-destructive">*</span></Label>
              <Input id="phone" type="tel" defaultValue={data.phone} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" defaultValue={data.email} />
            </div>
          </div>
          {cabinet.type === "tov" && data.website && (
            <div className="space-y-2">
              <Label htmlFor="website">Веб-сайт</Label>
              <Input id="website" type="url" defaultValue={data.website} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Representative / Signer */}
      {cabinet.type === "tov" && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Представник / Підписант</CardTitle>
            </div>
            <CardDescription>Особа, що підписує документи за замовчуванням</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="repName">ПІБ <span className="text-destructive">*</span></Label>
                <Input id="repName" defaultValue={data.representativeName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repPosition">Посада <span className="text-destructive">*</span></Label>
                <Input id="repPosition" defaultValue={data.representativePosition} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="usesStamp" defaultChecked={data.usesStamp} />
              <Label htmlFor="usesStamp" className="flex items-center gap-2">
                <Stamp className="h-4 w-4" />
                Використовує печатку
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Шаблон реквізитів у документах</CardTitle>
          </div>
          <CardDescription>Приклад, як реквізити відображатимуться в рахунках та актах</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/50 p-4 text-sm font-mono">
            {cabinet.type === "tov" && (
              <>
                <p className="font-semibold">{data.fullName}</p>
                <p>Код ЄДРПОУ: {data.edrpou}</p>
                {data.isVatPayer && <p>ІПН: {data.vatNumber}</p>}
                <p>{data.legalAddress}</p>
                <p>р/р {data.iban}</p>
                <p>в {data.bankName}, МФО {data.mfo}</p>
                <Separator className="my-2" />
                <p>{data.representativePosition} ________________ {data.representativeName}</p>
              </>
            )}
            {cabinet.type === "fop" && (
              <>
                <p className="font-semibold">ФОП {data.fullName}</p>
                <p>РНОКПП: {data.taxId}</p>
                <p>{data.registrationAddress}</p>
                <p>р/р {data.iban}</p>
                <p>в {data.bankName}</p>
                <Separator className="my-2" />
                <p>ФОП ________________ {data.fullName}</p>
              </>
            )}
            {cabinet.type === "individual" && (
              <>
                <p className="font-semibold">{data.fullName}</p>
                <p>РНОКПП: {data.taxId}</p>
                <p>{data.address}</p>
                <p>Тел: {data.phone}</p>
              </>
            )}
            {cabinet.type === "fop-group" && (
              <p className="text-muted-foreground">Для групи ФОП використовуються індивідуальні реквізити кожного ФОП</p>
            )}
          </div>
        </CardContent>
      </Card>

      <PartnerProgramOptInCard cabinet={cabinet} />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">Зберегти зміни</Button>
      </div>
    </div>
  );
};
