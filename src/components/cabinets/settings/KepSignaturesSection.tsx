import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  KeyRound, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileCheck,
  Users,
  ArrowRight,
  Shield,
  Link,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { getKepCertificatesForCabinet, getSigningPoliciesForCabinet, type KepCertificate } from "@/config/settingsConfig";
import { format, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";

interface KepSignaturesSectionProps {
  cabinet: Cabinet;
}

const statusConfig: Record<KepCertificate["status"], { label: string; variant: "default" | "outline" | "destructive"; icon: typeof CheckCircle; className?: string }> = {
  valid: { label: "Дійсний", variant: "default", icon: CheckCircle, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  expiring: { label: "Закінчується", variant: "outline", icon: AlertTriangle, className: "border-yellow-500/50 text-yellow-700 dark:text-yellow-400" },
  expired: { label: "Прострочений", variant: "destructive", icon: XCircle },
};

export const KepSignaturesSection = ({ cabinet }: KepSignaturesSectionProps) => {
  const certificates = getKepCertificatesForCabinet(cabinet);
  const signingPolicies = getSigningPoliciesForCabinet(cabinet);

  // Approval chain for TOV
  const approvalChain = cabinet.type === "tov" ? [
    { role: "Юрист", action: "Перевірка" },
    { role: "Бухгалтер", action: "Візування" },
    { role: "Директор", action: "Підпис" },
  ] : null;

  return (
    <div className="space-y-5">
      {/* Certificates */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Сертифікати КЕП</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Додати сертифікат
            </Button>
          </div>
          <CardDescription>
            Електронні підписи для підписання документів та звітності
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <KeyRound className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Сертифікати не додано</p>
              <Button variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Додати перший сертифікат
              </Button>
            </div>
          ) : (
            certificates.map((cert) => {
              const status = statusConfig[cert.status];
              const StatusIcon = status.icon;
              const daysToExpiry = differenceInDays(new Date(cert.validTo), new Date());

              return (
                <div 
                  key={cert.id}
                  className={`rounded-lg border p-4 hover:shadow-md transition-all ${
                    cert.status === "expired" ? "border-destructive bg-destructive/5" :
                    cert.status === "expiring" ? "border-warning bg-warning/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${
                        cert.status === "valid" ? "bg-green-500/10" :
                        cert.status === "expiring" ? "bg-warning/10" : "bg-destructive/10"
                      }`}>
                        <KeyRound className={`h-5 w-5 ${
                          cert.status === "valid" ? "text-green-600" :
                          cert.status === "expiring" ? "text-warning" : "text-destructive"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cert.owner}</p>
                          <Badge variant={status.variant} className={status.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{cert.position}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Видавець: {cert.issuer}</span>
                          <span>
                            Дійсний до: {format(new Date(cert.validTo), "dd.MM.yyyy", { locale: uk })}
                          </span>
                        </div>
                        {cert.status === "expiring" && (
                          <p className="text-xs text-warning mt-1">
                            Залишилось {daysToExpiry} днів
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Оновити
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Signing Policies */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Політики підпису</CardTitle>
          </div>
          <CardDescription>
            Правила підписання документів за типами
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {signingPolicies.map((policy) => (
            <div 
              key={policy.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{policy.documentType}</Badge>
                <div className="flex items-center gap-2">
                  {policy.signers.map((signer, index) => (
                    <span key={signer} className="flex items-center gap-1 text-sm">
                      {index > 0 && <span className="text-muted-foreground">+</span>}
                      {signer}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{policy.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Approval Chain (for TOV) */}
      {approvalChain && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Ланцюжок погодження</CardTitle>
            </div>
            <CardDescription>
              Послідовність погодження документів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 py-4">
              {approvalChain.map((step, index) => (
                <div key={step.role} className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="rounded-full bg-primary/10 p-3 mx-auto">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium mt-2">{step.role}</p>
                    <p className="text-xs text-muted-foreground">{step.action}</p>
                  </div>
                  {index < approvalChain.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Links */}
      <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Інтеграції підпису</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {cabinet.type === "tov" && (
              <>
                <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">M.E.Doc</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Підключено</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Vchasno</span>
                  </div>
                  <Badge variant="outline">Очікує</Badge>
                </div>
              </>
            )}
            {cabinet.type === "fop" && (
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Vchasno</span>
                </div>
                <Badge variant="outline">Очікує</Badge>
              </div>
            )}
            {cabinet.type === "individual" && (
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Дія.Підпис</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Підключено</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
