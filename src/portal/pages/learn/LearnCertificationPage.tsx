import { useState } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Search } from "lucide-react";

const CERTIFICATIONS = [
  {
    id: 'accountant',
    title: 'FINTODO Certified Accountant',
    emoji: '🏆',
    description: 'Офіційна сертифікація для бухгалтерів що ведуть клієнтів у FINTODO. Після іспиту — badge у каталозі та пріоритет в пошуку.',
    benefits: [
      'Badge "FINTODO Certified" у каталозі бухгалтерів',
      'Пріоритет у пошуку клієнтів',
      'Доступ до закритого каналу підтримки',
      'Верифікований сертифікат з унікальним номером',
    ],
    courseLink: '/learn/accountants/fintodo-certified',
    courseName: 'FINTODO Certified Accountant',
  },
  {
    id: 'fop',
    title: 'FINTODO Certified ФОП',
    emoji: '📋',
    description: 'Підтвердіть знання з ведення ФОП — від обліку до декларування. Сертифікат підвищує довіру клієнтів і партнерів.',
    benefits: [
      'Сертифікат "Verified ФОП" для портфоліо',
      'Знижка на PRO тарифи FINTODO',
      'Ексклюзивні вебінари для сертифікованих',
      'Автоматичний перерозрахунок при зміні ставок',
    ],
    courseLink: '/learn/fop/fop-accounting-g3',
    courseName: 'Облік і звітність ФОП 3 групи',
  },
];

const LearnCertificationPage = () => {
  const [certInput, setCertInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const handleVerify = () => {
    if (!certInput.trim()) return;
    // Mock verification
    if (certInput.toUpperCase().startsWith("FT-")) {
      setVerifyResult("✓ Сертифікат дійсний. Видано: Оксана Коваленко, 15.02.2026. Тип: FINTODO Certified Accountant.");
    } else {
      setVerifyResult("✗ Сертифікат не знайдено. Перевірте номер і спробуйте ще.");
    }
  };

  return (
    <PortalLayout meta={{
      title: "Сертифікація — FINTODO Certified | FINTODO",
      description: "Отримайте офіційну сертифікацію FINTODO для бухгалтерів та підприємців. Безкоштовно.",
      canonical: "https://fintodo.com.ua/learn/certification",
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Навчання", url: `${SITE_URL}/learn` },
        { name: "Сертифікація", url: `${SITE_URL}/learn/certification` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Навчання", to: "/learn" },
          { label: "Сертифікація" },
        ]} />

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Сертифікація FINTODO</h1>
        <p className="text-muted-foreground mb-8">Підтвердіть свої знання та отримайте офіційний badge</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {CERTIFICATIONS.map(cert => (
            <Card key={cert.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cert.emoji}</span>
                  <div>
                    <h2 className="font-semibold text-foreground">{cert.title}</h2>
                    <Badge variant="secondary">Безкоштовно</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Що ви отримаєте:</p>
                  {cert.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {b}
                    </div>
                  ))}
                </div>
                <Button className="w-full" asChild>
                  <Link to={cert.courseLink}>
                    Розпочати безкоштовно <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verification */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Перевірити сертифікат</h2>
            <p className="text-sm text-muted-foreground">Введіть номер сертифікату для перевірки дійсності</p>
            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Напр. FT-2026-00123"
                value={certInput}
                onChange={e => setCertInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
              <Button onClick={handleVerify}>
                <Search className="h-4 w-4" /> Перевірити
              </Button>
            </div>
            {verifyResult && (
              <p className={`text-sm ${verifyResult.startsWith("✓") ? "text-primary" : "text-destructive"}`}>
                {verifyResult}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default LearnCertificationPage;
