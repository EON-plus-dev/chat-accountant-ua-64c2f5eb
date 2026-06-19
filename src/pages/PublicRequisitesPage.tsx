import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { Building2, Copy, Download, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockCabinets } from "@/config/cabinetsData";
import { getCabinetRequisites } from "@/config/cabinetRequisitesDemo";
import { decodeShareId, incrementViewCount, buildShareUrl, isPlaceholderShareId, DEMO_SHARE_CABINET_ID, DEMO_SHARE_ID } from "@/lib/share/shareLinks";
import { buildRequisitesText } from "@/lib/share/buildRequisitesText";
import { buildVCard, downloadVCard } from "@/lib/share/buildVCard";
import { PublicRequisitesView } from "@/components/cabinets/share/PublicRequisitesView";
import { LeadCaptureForm } from "@/components/cabinets/share/LeadCaptureForm";
import { getEntityStyle } from "@/config/entityStyles";
import { cn } from "@/lib/utils";

const PUBLIC_BASE = "https://fintodo.com.ua";

function getShortTaxLabel(type: string, fopGroup?: number, isVat?: boolean): string | null {
  if (type === "fop") {
    const vat = isVat ? " · ПДВ" : "";
    if (fopGroup === 3) return `3 гр. · ${isVat ? "3% ЄП" : "5% ЄП"}${vat}`;
    if (fopGroup === 2) return `2 гр.${vat}`;
    if (fopGroup === 1) return `1 гр.${vat}`;
    return `ФОП${vat}`;
  }
  if (type === "tov") return isVat ? "Загальна · ПДВ" : "Загальна";
  return null;
}

export default function PublicRequisitesPage() {
  const { shareId = "" } = useParams<{ shareId: string }>();
  const { toast } = useToast();

  const cabinet = useMemo(() => {
    if (isPlaceholderShareId(shareId)) {
      return mockCabinets.find((c) => c.id === DEMO_SHARE_CABINET_ID) ?? mockCabinets[0] ?? null;
    }
    const id = decodeShareId(shareId, mockCabinets.map((c) => c.id));
    return id ? mockCabinets.find((c) => c.id === id) ?? null : null;
  }, [shareId]);

  const requisites = useMemo(() => (cabinet ? getCabinetRequisites(cabinet) : null), [cabinet]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (cabinet) incrementViewCount(cabinet.id);
  }, [cabinet]);

  useEffect(() => {
    if (cabinet && requisites) {
      document.title = `Реквізити: ${requisites.name || cabinet.name} · Fintodo`;
    }
  }, [cabinet, requisites]);

  if (!cabinet || !requisites) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-3">
            <h1 className="text-xl font-semibold">Посилання недійсне</h1>
            <p className="text-sm text-muted-foreground">
              Реквізити за цим посиланням більше недоступні. Зверніться до власника картки за актуальним лінком.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
              <Button asChild variant="outline">
                <Link to={`/r/${DEMO_SHARE_ID}`}>Відкрити демо-приклад</Link>
              </Button>
              <Button asChild>
                <Link to="/">На головну Fintodo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const style = getEntityStyle(cabinet.type);
  const Icon = style.icon;
  const code = requisites.edrpou || requisites.ipn;
  const codeLabel = requisites.edrpou ? "ЄДРПОУ" : "ІПН";
  const shortTax = getShortTaxLabel(cabinet.type, cabinet.fopGroup, requisites.isVatPayer);
  const fullTax =
    cabinet.type === "fop"
      ? `ФОП${cabinet.fopGroup ? ` · ${cabinet.fopGroup} група` : ""}${requisites.isVatPayer ? " · платник ПДВ" : ""}`
      : cabinet.type === "tov"
        ? `ТОВ · загальна система${requisites.isVatPayer ? " · платник ПДВ" : ""}`
        : null;

  const shareUrl = buildShareUrl(cabinet.id);
  const text = buildRequisitesText(cabinet, requisites, { shareUrl, taxSystemLabel: fullTax });

  const copyText = () => {
    navigator.clipboard.writeText(text).then(
      () => toast({ title: "Скопійовано", description: "Реквізити в буфері обміну" }),
      () => toast({ title: "Не вдалося скопіювати", variant: "destructive" }),
    );
  };




  return (
    <div className="min-h-screen bg-muted/20">

      {/* Demo banner */}
      {typeof window !== "undefined" &&
        !window.location.hostname.includes("fintodo.com.ua") && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200">
            <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Демо · приклад того, що побачить контрагент за вашим посиланням
              </span>
              <Link to="/dashboard" className="font-medium hover:underline shrink-0">
                ← Повернутись у кабінет
              </Link>
            </div>
          </div>
        )}

      {/* Top bar */}
      <header className="border-b border-border/60 bg-background">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            Fintodo<span className="text-muted-foreground font-normal"> · реквізити контрагента</span>
          </Link>
          <Badge variant="outline" className="text-[10px]">
            <ShieldCheck className="w-3 h-3 mr-1" /> Дані з ЄДР
          </Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Hero card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={cn("rounded-lg flex items-center justify-center shrink-0 w-12 h-12", style.bgColor)}>
                <Icon className={cn("w-6 h-6", style.color)} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <h1 className="text-xl font-semibold tracking-tight">
                  {requisites.name || cabinet.name}
                </h1>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={style.badgeClass} variant="secondary">{style.label}</Badge>
                  {shortTax && <Badge variant="outline">{shortTax}</Badge>}
                  {cabinet.status === "active" && <Badge variant="success">Активний</Badge>}
                </div>
                {code && (
                  <div className="text-sm text-muted-foreground font-mono tabular-nums">
                    {codeLabel}: {code}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!revealed ? (
          <>
            {/* Lead capture */}
            <Card>
              <CardContent className="p-5">
                <LeadCaptureForm
                  cabinetId={cabinet.id}
                  cabinetName={requisites.name || cabinet.name}
                  onSuccess={() => setRevealed(true)}
                  onSkip={() => setRevealed(true)}
                />
              </CardContent>
            </Card>

            {/* Preview of redacted requisites for transparency */}
            <Card>
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2">
                  Що ви отримаєте після представлення
                </div>
                <PublicRequisitesView
                  cabinet={cabinet}
                  requisites={requisites}
                  taxSystemLabel={fullTax}
                  redacted
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Full requisites */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <PublicRequisitesView
                  cabinet={cabinet}
                  requisites={requisites}
                  taxSystemLabel={fullTax}
                />
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                  <Button onClick={copyText} size="sm">
                    <Copy className="w-4 h-4 mr-1.5" /> Скопіювати реквізити
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadVCard(
                        `requisites-${cabinet.id}`,
                        buildVCard(cabinet, requisites, shareUrl),
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Зберегти .vcf
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Marketing CTA */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="font-semibold">Хочете таку ж картку для своїх контрагентів?</div>
                  <p className="text-sm text-muted-foreground">
                    Fintodo автоматично формує реквізити з ЄДР, відстежує платників ПДВ та надсилає
                    повідомлення про зміни. Безкоштовний тариф Start — 300 кредитів/міс, без картки.
                  </p>
                  <Button asChild size="sm">
                    <Link to="/checkout?plan=start">
                      Створити свій кабінет →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <footer className="border-t border-border/60 bg-background mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <Building2 className="w-3.5 h-3.5" /> Powered by Fintodo
          </Link>
          <Link to="/privacy" className="hover:text-foreground">Політика конфіденційності</Link>
        </div>
      </footer>
    </div>
  );
}
