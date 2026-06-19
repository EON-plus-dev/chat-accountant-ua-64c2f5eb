import { useState, useMemo } from "react";
import { RelatedPartnersBlock } from "@/portal/components/RelatedPartnersBlock";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COMPLEXITY_LABEL: Record<string, string> = {
  low: "Низька",
  medium: "Середня",
  high: "Висока",
};

const COMPLEXITY_VARIANT: Record<string, "secondary" | "outline" | "destructive"> = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
};

const BusinessFormsPage = () => {
  const [selectedForms, setSelectedForms] = useState<string[]>(["fop", "tov"]);

  const toggleForm = (slug: string) => {
    setSelectedForms((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const comparedForms = useMemo(
    () => BUSINESS_FORMS.filter((f) => selectedForms.includes(f.slug)),
    [selectedForms]
  );

  return (
    <PortalLayout
      meta={{
        title: "Форми бізнесу — ФОП vs ТОВ vs ФГ порівняння | FINTODO",
        description: "Порівняння організаційно-правових форм: ФОП, ТОВ, ФГ, Кооператив, ПП, ГО. Переваги, податки, відповідальність.",
        canonical: `${SITE_URL}/dovidnyky/formy-biznesu`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
          { name: "Форми бізнесу", url: `${SITE_URL}/dovidnyky/formy-biznesu` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <BreadcrumbNav
        items={[
          { label: "Головна", to: "/" },
          { label: "Довідники", to: "/dovidnyky" },
          { label: "Форми бізнесу" },
        ]}
      />

      <div className="space-y-6 mt-4">
        <div>
          <h1 className="text-2xl font-bold">🏢 Форми бізнесу</h1>
          <p className="text-muted-foreground mt-1">
            Порівняйте організаційно-правові форми та оберіть оптимальну
          </p>
        </div>

        {/* Form selector */}
        <div className="flex flex-wrap gap-2">
          {BUSINESS_FORMS.map((form) => (
            <Button
              key={form.slug}
              variant={selectedForms.includes(form.slug) ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleForm(form.slug)}
            >
              {form.emoji} {form.name}
            </Button>
          ))}
        </div>

        {/* Comparison table */}
        {comparedForms.length >= 2 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-sm">Порівняльна таблиця</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs min-w-[140px]">Критерій</TableHead>
                    {comparedForms.map((f) => (
                      <TableHead key={f.slug} className="text-xs min-w-[160px]">
                        {f.emoji} {f.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Повна назва</TableCell>
                    {comparedForms.map((f) => (
                      <TableCell key={f.slug} className="text-xs">{f.fullName}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Відповідальність</TableCell>
                    {comparedForms.map((f) => (
                      <TableCell key={f.slug} className="text-xs">{f.liability}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Мін. капітал</TableCell>
                    {comparedForms.map((f) => (
                      <TableCell key={f.slug} className="text-xs">{f.minCapital}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Час реєстрації</TableCell>
                    {comparedForms.map((f) => (
                      <TableCell key={f.slug} className="text-xs">{f.registrationTime}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Складність обліку</TableCell>
                    {comparedForms.map((f) => (
                      <TableCell key={f.slug} className="text-xs">
                        <Badge variant={COMPLEXITY_VARIANT[f.accountingComplexity]} className="text-[10px]">
                          {COMPLEXITY_LABEL[f.accountingComplexity]}
                        </Badge>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Оподаткування</TableCell>
                    {comparedForms.map((f) => (
                      <TableCell key={f.slug} className="text-xs">
                        {f.taxOptions.map((t, i) => (
                          <div key={i} className="mb-0.5">• {t}</div>
                        ))}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs font-medium">Працівники</TableCell>
                    {comparedForms.map((f) => (
                      <TableCell key={f.slug} className="text-xs">
                        {f.employeesAllowed ? (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Individual cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUSINESS_FORMS.map((form) => (
            <Link key={form.id} to={`/dovidnyky/formy-biznesu/${form.slug}`}>
            <Card className="p-5 hover:border-primary/40 transition-colors h-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{form.emoji}</span>
                <div>
                  <h3 className="font-semibold">{form.name}</h3>
                  <p className="text-xs text-muted-foreground">{form.fullName}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{form.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs font-medium text-primary mb-1">✅ Переваги</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {form.pros.slice(0, 3).map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-destructive mb-1">❌ Недоліки</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {form.cons.slice(0, 3).map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{form.registrationTime}</Badge>
                <Badge variant={COMPLEXITY_VARIANT[form.accountingComplexity]} className="text-[10px]">
                  Облік: {COMPLEXITY_LABEL[form.accountingComplexity]}
                </Badge>
              </div>

              <div className="mt-3">
                <p className="text-xs font-medium mb-1">Найкраще підходить для:</p>
                <div className="flex flex-wrap gap-1">
                  {form.bestFor.map((b) => (
                    <span key={b} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{b}</span>
                  ))}
                </div>
              </div>
            </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Не знаєте яку форму обрати?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                AI-консультант допоможе обрати оптимальну форму бізнесу під ваші потреби.
              </p>
              <Button size="sm" className="mt-3 h-8 text-xs" asChild>
                <a href={CTA_CHECKOUT_URL}>
                  Запитати AI <ArrowRight className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </div>
          <RelatedPartnersBlock directoryId="formy-biznesu" />
    </PortalLayout>
  );
};

export default BusinessFormsPage;
