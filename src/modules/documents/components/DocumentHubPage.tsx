/**
 * DocumentHubPage — реєстр документів кабінету.
 * Універсальний для бізнес/фіз. кабінетів через filter audience.
 */
import { useMemo, useState } from "react";
import { useDocuments } from "../store/useDocumentsStore";
import type { DocumentFilter, DocumentKind, DocumentStatus } from "../types";
import { getDocumentKindMeta, listKindsForAudience } from "../registry/documentKinds";
import { latestVersion, isSigned } from "../types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Filter as FilterIcon, ShieldCheck } from "lucide-react";
import { DocumentDetailSheet } from "./DocumentDetailSheet";

interface Props {
  cabinetId: string;
  audience?: "business" | "personal";
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: "Чернетка",
  review: "На розгляді",
  signed: "Підписано",
  archived: "В архіві",
  rejected: "Відхилено",
};

export function DocumentHubPage({ cabinetId, audience = "business" }: Props) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<DocumentKind | "all">("all");
  const [status, setStatus] = useState<DocumentStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filter = useMemo<DocumentFilter>(
    () => ({ search: search || undefined, kind, status }),
    [search, kind, status],
  );

  const { list } = useDocuments(cabinetId, filter);
  const kinds = listKindsForAudience(audience);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Документи
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Єдиний реєстр документів — версії, підписи, звʼязки з іншими сутностями.
          </p>
        </div>
        <Button size="sm">Додати документ</Button>
      </header>

      <Card className="p-3 md:p-4 flex flex-wrap items-center gap-2">
        <FilterIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою або тегом…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={kind} onValueChange={(v) => setKind(v as DocumentKind | "all")}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Тип" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Усі типи</SelectItem>
            {kinds.map((k) => (
              <SelectItem key={k.id} value={k.id}>{k.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus | "all")}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Усі статуси</SelectItem>
            {Object.entries(STATUS_LABEL).map(([id, lbl]) => (
              <SelectItem key={id} value={id}>{lbl}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {list.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          Документів не знайдено.
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map((doc) => {
            const meta = getDocumentKindMeta(doc.kind);
            const v = latestVersion(doc);
            const Icon = meta.icon;
            return (
              <Card
                key={doc.id}
                className="p-3 md:p-4 hover:bg-accent/40 cursor-pointer transition-colors"
                onClick={() => setOpenId(doc.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{doc.title}</h3>
                      <Badge variant="outline" className="text-xs">{meta.shortLabel}</Badge>
                      <Badge
                        variant={doc.status === "signed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {STATUS_LABEL[doc.status]}
                      </Badge>
                      {isSigned(doc) && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {v?.signatures.length} підпис(ів)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      v{v?.versionNumber ?? 1} • {v?.fileName ?? "—"} • Оновлено{" "}
                      {new Date(doc.updatedAt).toLocaleDateString("uk-UA")}
                    </p>
                    {doc.links.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.links.slice(0, 4).map((l, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {l.label ?? `${l.kind} #${l.entityId.slice(0, 6)}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DocumentDetailSheet
        cabinetId={cabinetId}
        documentId={openId}
        open={!!openId}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </div>
  );
}
