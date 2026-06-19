import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Landmark, 
  FileText, 
  Calculator, 
  Link2, 
  Users, 
  Shield,
  Edit,
  Copy,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Cabinet } from "@/types/cabinet";
import { useState } from "react";
import { toast } from "sonner";

interface CabinetProfilePageProps {
  cabinet: Cabinet;
}

// Extended mock data for cabinet profile
const getCabinetDetails = (cabinet: Cabinet) => {
  const baseDetails = {
    // Requisites
    edrpou: cabinet.type === "fop" ? "3456789012" : "12345678",
    ipn: cabinet.type === "fop" ? "3456789012" : "123456789012",
    legalAddress: "м. Київ, вул. Хрещатик, 1, офіс 101",
    actualAddress: "м. Київ, вул. Хрещатик, 1, офіс 101",
    phone: "+380 44 123 45 67",
    email: "info@company.ua",
    
    // Bank details
    bankName: "АТ «Приватбанк»",
    iban: "UA903052992990004149123456789",
    mfo: "305299",
    
    // Tax system
    taxSystem: cabinet.typeLabel,
    vatPayer: cabinet.type === "tov",
    singleTaxRate: cabinet.type === "fop" ? "5%" : null,
    singleTaxGroup: cabinet.type === "fop" ? "3" : null,
    
    // Registration
    registrationDate: "15.03.2020",
    registrationAuthority: "Печерська районна державна адміністрація м. Києва",
    
    // Integrations
    integrations: [
      { name: "Monobank", status: "connected", icon: "💳" },
      { name: "Приватбанк", status: "connected", icon: "🏦" },
      { name: "Checkbox", status: "connected", icon: "🧾" },
      { name: "Nova Poshta", status: "pending", icon: "📦" },
    ],
    
    // Team
    team: [
      { name: "Іван Іваненко", role: "Власник", email: "ivan@company.ua" },
      { name: "Марія Петренко", role: "Бухгалтер", email: "maria@company.ua" },
      { name: "Олег Сидоренко", role: "Менеджер", email: "oleg@company.ua" },
    ],
  };

  return baseDetails;
};

const CabinetProfilePage = ({ cabinet }: CabinetProfilePageProps) => {
  const details = getCabinetDetails(cabinet);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Скопійовано в буфер обміну");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={() => copyToClipboard(text, field)}
    >
      {copiedField === field ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </Button>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Профіль кабінету</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Детальна інформація про компанію та реквізити
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="w-4 h-4" />
          <span className="hidden sm:inline">Редагувати</span>
        </Button>
      </div>

      {/* Company Identity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{cabinet.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-0.5">
                <span>{cabinet.typeLabel}</span>
                <Badge 
                  variant={cabinet.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {cabinet.status === "active" ? "Активний" : "Архівний"}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3 group">
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">
                {cabinet.type === "fop" ? "РНОКПП:" : "ЄДРПОУ:"}
              </span>
              <span className="font-medium tabular-nums">{details.edrpou}</span>
              <CopyButton text={details.edrpou} field="edrpou" />
            </div>
            {cabinet.type !== "fop" && (
              <div className="flex items-center gap-3 group">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-24 flex-shrink-0">ІПН:</span>
                <span className="font-medium tabular-nums">{details.ipn}</span>
                <CopyButton text={details.ipn} field="ipn" />
              </div>
            )}
            <div className="flex items-start gap-3 group">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Юр. адреса:</span>
              <span className="font-medium">{details.legalAddress}</span>
              <CopyButton text={details.legalAddress} field="legalAddress" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Контактна інформація
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3 group">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Телефон:</span>
              <span className="font-medium">{details.phone}</span>
              <CopyButton text={details.phone} field="phone" />
            </div>
            <div className="flex items-center gap-3 group">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Email:</span>
              <span className="font-medium">{details.email}</span>
              <CopyButton text={details.email} field="email" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            Банківські реквізити
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3 group">
              <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">IBAN:</span>
              <span className="font-medium font-mono text-xs">{details.iban}</span>
              <CopyButton text={details.iban} field="iban" />
            </div>
            <div className="flex items-center gap-3 group">
              <Landmark className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Банк:</span>
              <span className="font-medium">{details.bankName}</span>
            </div>
            <div className="flex items-center gap-3 group">
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">МФО:</span>
              <span className="font-medium tabular-nums">{details.mfo}</span>
              <CopyButton text={details.mfo} field="mfo" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax System */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            Система оподаткування
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Calculator className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Система:</span>
              <span className="font-medium">{details.taxSystem}</span>
            </div>
            {details.singleTaxGroup && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-24 flex-shrink-0">Група ЄП:</span>
                <span className="font-medium">{details.singleTaxGroup} група</span>
              </div>
            )}
            {details.singleTaxRate && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground w-24 flex-shrink-0">Ставка ЄП:</span>
                <span className="font-medium">{details.singleTaxRate}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground w-24 flex-shrink-0">Платник ПДВ:</span>
              <Badge variant={details.vatPayer ? "default" : "secondary"} className="text-xs">
                {details.vatPayer ? "Так" : "Ні"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Інтеграції
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {details.integrations.map((integration) => (
              <div 
                key={integration.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{integration.icon}</span>
                  <span className="font-medium text-sm">{integration.name}</span>
                </div>
                <Badge 
                  variant={integration.status === "connected" ? "default" : "outline"}
                  className="text-xs"
                >
                  {integration.status === "connected" ? "Підключено" : "Очікує"}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
            <Link2 className="w-4 h-4" />
            Додати інтеграцію
          </Button>
        </CardContent>
      </Card>

      {/* Team Access */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Команда та доступи
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-primary">
              Керувати
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {details.team.map((member) => (
              <div 
                key={member.email}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registration Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Реєстраційні дані
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground flex-shrink-0">Дата реєстрації:</span>
              <span className="font-medium">{details.registrationDate}</span>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground flex-shrink-0">Орган реєстрації:</span>
              <span className="font-medium">{details.registrationAuthority}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CabinetProfilePage;
