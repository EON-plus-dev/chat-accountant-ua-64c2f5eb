/**
 * DocumentDetailSheet — drill-sheet з версіями, підписами, зв'язками.
 * Поки локальний Sheet (не через drill-stack). Інтеграція з drill-stack — наступна ітерація
 * після додавання "document-v2" у DrillKind.
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, FileText, Link as LinkIcon, History, Upload } from "lucide-react";
import { useDocumentById } from "../store/useDocumentsStore";
import { useApprovals } from "../store/useApprovalsStore";
import { requestKepSignature } from "../bridges/kepBridge";
import { getDocumentKindMeta } from "../registry/documentKinds";
import { describeLink } from "../registry/linkResolvers";
import { useToast } from "@/hooks/use-toast";

interface Props {
  cabinetId: string;
  documentId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function DocumentDetailSheet({ cabinetId, documentId, open, onOpenChange }: Props) {
  const doc = useDocumentById(cabinetId, documentId);
  const { byDocumentId } = useApprovals(cabinetId);
  const { toast } = useToast();

  if (!doc) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl" />
      </Sheet>
    );
  }

  const meta = getDocumentKindMeta(doc.kind);
  const Icon = meta.icon;
  const approvals = byDocumentId(doc.id);

  const handleSign = async () => {
    try {
      await requestKepSignature(cabinetId, doc, "Власник кабінету");
      toast({ title: "Документ підписано (ДЕМО)", description: "Mock-провайдер. Не має юридичної сили." });
    } catch (e) {
      toast({ title: "Помилка підпису", description: String(e), variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <SheetTitle className="text-left">{doc.title}</SheetTitle>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{meta.label}</Badge>
            <Badge>{doc.status}</Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview"><FileText className="h-4 w-4 mr-1" />Огляд</TabsTrigger>
            <TabsTrigger value="versions"><History className="h-4 w-4 mr-1" />Версії</TabsTrigger>
            <TabsTrigger value="links"><LinkIcon className="h-4 w-4 mr-1" />Зв'язки</TabsTrigger>
            <TabsTrigger value="signatures"><ShieldCheck className="h-4 w-4 mr-1" />Підписи</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-3">
            <Card className="p-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Створено:</span><span>{new Date(doc.createdAt).toLocaleString("uk-UA")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Оновлено:</span><span>{new Date(doc.updatedAt).toLocaleString("uk-UA")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Версій:</span><span>{doc.versions.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Підписів:</span><span>{doc.versions.reduce((acc, v) => acc + v.signatures.length, 0)}</span></div>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleSign}>
                <ShieldCheck className="h-4 w-4 mr-1" /> Підписати КЕП (ДЕМО)
              </Button>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-1" /> Нова версія
              </Button>
            </div>
            {approvals.length > 0 && (
              <Card className="p-3">
                <h4 className="font-medium text-sm mb-2">Активні маршрути погодження</h4>
                {approvals.map((a) => (
                  <div key={a.id} className="text-xs text-muted-foreground">
                    {a.status} • {a.steps.length} крок(ів)
                  </div>
                ))}
              </Card>
            )}
          </TabsContent>

          <TabsContent value="versions" className="space-y-2 mt-3">
            {doc.versions.slice().reverse().map((v) => (
              <Card key={v.id} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">v{v.versionNumber} — {v.fileName}</div>
                    <div className="text-xs text-muted-foreground">
                      {(v.fileSizeBytes / 1024).toFixed(1)} КБ • {new Date(v.uploadedAt).toLocaleDateString("uk-UA")}
                    </div>
                  </div>
                  {v.signatures.length > 0 && (
                    <Badge variant="default" className="text-xs">
                      <ShieldCheck className="h-3 w-3 mr-1" />{v.signatures.length}
                    </Badge>
                  )}
                </div>
                {v.changeNote && <p className="text-xs mt-2 italic">{v.changeNote}</p>}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="links" className="space-y-2 mt-3">
            {doc.links.length === 0 ? (
              <p className="text-sm text-muted-foreground">Документ ще не привʼязаний до сутностей.</p>
            ) : (
              doc.links.map((l, i) => (
                <Card key={i} className="p-3 text-sm flex items-center justify-between">
                  <span>{describeLink(l)}</span>
                  <Badge variant="outline" className="text-xs">{l.kind}</Badge>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="signatures" className="space-y-2 mt-3">
            {doc.versions.flatMap((v) => v.signatures.map((s) => ({ v, s }))).length === 0 ? (
              <p className="text-sm text-muted-foreground">Підписів ще немає.</p>
            ) : (
              doc.versions.flatMap((v) =>
                v.signatures.map((s) => (
                  <Card key={s.id} className="p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{s.signerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.provider.toUpperCase()} • v{v.versionNumber} • {new Date(s.signedAt).toLocaleString("uk-UA")}
                        </div>
                      </div>
                      {s.isDemo && <Badge variant="secondary" className="text-xs">ДЕМО</Badge>}
                    </div>
                  </Card>
                )),
              )
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
