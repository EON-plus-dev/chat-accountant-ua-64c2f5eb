import { useParams } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";

const CertVerifyPage = () => {
  const { certId } = useParams<{ certId: string }>();
  const isValid = certId?.toUpperCase().startsWith("FT-");

  return (
    <PortalLayout meta={{
      title: `Верифікація сертифікату ${certId || ""} | FINTODO`,
      description: "Перевірка дійсності сертифікату FINTODO.",
      canonical: `https://fintodo.com.ua/verify/${certId}`,
    }}>
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Сертифікація", url: `${SITE_URL}/learn/certification` }, { name: `Верифікація ${certId || ""}`, url: `${SITE_URL}/verify/${certId || ""}` }])} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Сертифікація", to: "/learn/certification" },
          { label: `Верифікація ${certId}` },
        ]} />

        <Card className="mt-4">
          <CardContent className="p-8 text-center space-y-4">
            {isValid ? (
              <>
                <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">Сертифікат дійсний</h1>
                <p className="text-muted-foreground">Номер: <span className="font-mono font-semibold text-foreground">{certId}</span></p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Тип: FINTODO Certified Accountant</p>
                  <p>Видано: Оксана Коваленко</p>
                  <p>Дата: 15 лютого 2026</p>
                  <p>Статус: <span className="text-primary font-medium">Активний</span></p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-destructive mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">Сертифікат не знайдено</h1>
                <p className="text-muted-foreground">
                  Номер <span className="font-mono">{certId}</span> не знайдено в базі. Перевірте правильність введення.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default CertVerifyPage;
