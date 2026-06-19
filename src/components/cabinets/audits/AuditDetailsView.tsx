import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
   
  Building2, 
  Calendar, 
  User, 
  Phone,
  FileText,
  FolderOpen,
  Scale,
  AlertTriangle,
  ExternalLink,
  Gavel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  TaxAudit, 
  AuditRequest,
  auditTypeConfig, 
  auditStatusConfig,
} from "@/config/taxAuditsConfig";
import { AuditRequestCard } from "./AuditRequestCard";
import { AuditResponseForm } from "./AuditResponseForm";
import { AuditResponseViewSheet } from "./AuditResponseViewSheet";
import { AuditProgressStepper } from "./AuditProgressStepper";
import { AuditEventJournal, useAuditJournalCount } from "./AuditEventJournal";
import { AuditReadinessCard } from "./AuditReadinessCard";
import { AuditRequestAnalysisSheet } from "./AuditRequestAnalysisSheet";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface AuditDetailsViewProps {
  audit: TaxAudit;
  onBack: () => void;
  onNavigateToDocuments?: () => void;
  onNavigateToDocument?: (docId: string) => void;
  /** Якщо передано — після монтування одразу відкриється AI-аналіз цього запиту */
  initialOpenAnalysisRequestId?: string;
  /** Якщо передано — після монтування одразу відкриється форма відповіді (з AI-чернеткою) */
  initialOpenResponseRequestId?: string;
}

export const AuditDetailsView = ({ audit, onBack, onNavigateToDocuments, onNavigateToDocument, initialOpenAnalysisRequestId, initialOpenResponseRequestId }: AuditDetailsViewProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"timeline" | "requests" | "documents" | "result">("timeline");
  const [responseFormOpen, setResponseFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AuditRequest | null>(null);
  const [viewedResponseRequest, setViewedResponseRequest] = useState<AuditRequest | null>(null);
  const [analysisRequest, setAnalysisRequest] = useState<AuditRequest | null>(null);
  const [draftForResponse, setDraftForResponse] = useState<string | undefined>(undefined);
  const [autoGenerate, setAutoGenerate] = useState<boolean>(false);

  const sortedRequests = useMemo(
    () =>
      [...audit.requests].sort(
        (a, b) =>
          new Date(b.date ?? b.deadline ?? 0).getTime() -
          new Date(a.date ?? a.deadline ?? 0).getTime(),
      ),
    [audit.requests],
  );

  /** Контекст кожного документа: до якого запиту прикріплено і коли. */
  const docContextMap = useMemo(() => {
    const map = new Map<string, { requestId: string; requestNumber: string; attachedDate: string; subject: string } | null>();
    for (const doc of audit.documents) {
      let ctx: { requestId: string; requestNumber: string; attachedDate: string; subject: string } | null = null;
      for (const req of audit.requests) {
        if (
          req.responseDocumentIds &&
          doc.documentFlowId &&
          req.responseDocumentIds.includes(doc.documentFlowId)
        ) {
          ctx = {
            requestId: req.id,
            requestNumber: req.number,
            attachedDate: req.responseDate ?? doc.date,
            subject: req.subject,
          };
          break;
        }
      }
      map.set(doc.id, ctx);
    }
    return map;
  }, [audit.documents, audit.requests]);


  const openResponseFor = (req: AuditRequest) => {
    setSelectedRequest(req);
    setDraftForResponse(undefined);
    setAutoGenerate(true);
    setResponseFormOpen(true);
  };

  // Auto-open analysis if requested by parent (quick action from AuditsPage)
  useEffect(() => {
    if (!initialOpenAnalysisRequestId) return;
    const req = audit.requests.find((r) => r.id === initialOpenAnalysisRequestId);
    if (req) {
      setAnalysisRequest(req);
      setActiveTab("requests");
    }
  }, [initialOpenAnalysisRequestId, audit.requests]);

  // Auto-open response form (with AI auto-generation) if requested by parent
  useEffect(() => {
    if (!initialOpenResponseRequestId) return;
    const req = audit.requests.find((r) => r.id === initialOpenResponseRequestId);
    if (req) {
      setActiveTab("requests");
      openResponseFor(req);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenResponseRequestId, audit.requests]);
  
  const typeConfig = auditTypeConfig[audit.type];
  const statusConfig = auditStatusConfig[audit.status];
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;
  
  const pendingRequests = audit.requests.filter(r => r.status === "pending");
  const overdueRequests = audit.requests.filter(r => r.status === "overdue");
  
  const handleResponseSubmit = (requestId: string, response: { text: string; documentIds: string[] }) => {
    toast({
      title: "Відповідь збережено",
      description: `Відповідь на запит буде відправлена до ДПС. Прикріплено ${response.documentIds.length} документів.`,
    });
  };

  const handleAppeal = () => {
    toast({
      title: "Демо-режим",
      description: "Функція оскарження буде доступна після запуску",
    });
  };

  const handleOpenDocument = (doc: { id: string; documentFlowId?: string; fromDocumentFlow?: boolean }) => {
    if (doc.fromDocumentFlow && doc.documentFlowId && onNavigateToDocument) {
      onNavigateToDocument(doc.documentFlowId);
    } else {
      toast({
        title: "Документ недоступний",
        description: "Цей документ не пов'язаний з документообігом",
      });
    }
  };

  const journalCount = useAuditJournalCount(audit);
  const tabs = [
    { id: "timeline", label: "Хронологія", count: journalCount },
    { id: "requests", label: "Запити", count: audit.requests.length, highlight: pendingRequests.length > 0 || overdueRequests.length > 0 },
    { id: "documents", label: "Документи", count: audit.documents.length },
    ...(audit.result ? [{ id: "result", label: "Результат" }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <TypeIcon className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{typeConfig.label}</h2>
          <Badge variant="outline" className={cn("gap-1", statusConfig.color)}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Період: {audit.period} • Наказ {audit.orderNumber}
        </p>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <AuditProgressStepper audit={audit} />
          {(audit.status === "appealed" || (audit.appealIds && audit.appealIds.length > 0)) && (
            <div className="pt-2 border-t flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-muted-foreground">
                ППР оскаржено в адміністративному/судовому порядку
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const url = buildUrlWithTrail(`/appeals/${audit.id}`, {
                    label: `Перевірка ${audit.orderNumber}`,
                    url: window.location.pathname + window.location.search,
                  });
                  navigate(url);
                }}
              >
                <Gavel className="h-3.5 w-3.5 mr-1.5" />
                Деталі оскарження
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI readiness */}
      {audit.status !== "completed" && (
        <AuditReadinessCard
          audit={audit}
          onOpenResponse={(requestId) => {
            const req = audit.requests.find((r) => r.id === requestId);
            if (req) openResponseFor(req);
          }}
          onOpenRequestsTab={() => setActiveTab("requests")}
          onAttachDocuments={() => {
            if (onNavigateToDocuments) {
              onNavigateToDocuments();
            } else {
              toast({
                title: "Документообіг",
                description: "Перейдіть до розділу документообігу, щоб прикріпити файли.",
              });
            }
          }}
          onOpenAppealOrPpr={() => {
            const url = buildUrlWithTrail(`/appeals/${audit.id}`, {
              label: `Перевірка ${audit.orderNumber}`,
              url: window.location.pathname + window.location.search,
            });
            navigate(url);
          }}
        />
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Орган ДПС:</span>
            </div>
            <p className="text-sm font-medium pl-6">{audit.taxOffice}</p>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Дати:</span>
              <span className="font-medium">
                {format(parseISO(audit.startDate), "dd.MM.yyyy", { locale: uk })}
                {audit.endDate && ` — ${format(parseISO(audit.endDate), "dd.MM.yyyy", { locale: uk })}`}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {audit.inspectorName && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Інспектор:</span>
                <span className="font-medium">{audit.inspectorName}</span>
              </div>
              {audit.inspectorPhone && (
                <div className="flex items-center gap-2 text-sm pl-6">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{audit.inspectorPhone}</span>
                </div>
              )}
              {audit.responseDeadline && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-muted-foreground">Дедлайн відповіді:</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {format(parseISO(audit.responseDeadline), "dd.MM.yyyy", { locale: uk })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overdue actionable bar */}
      {overdueRequests.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium flex-1 min-w-0 truncate">
            {overdueRequests.length === 1
              ? "1 запит прострочено"
              : `${overdueRequests.length} запитів прострочено`}
          </span>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 shrink-0"
            onClick={() => {
              if (overdueRequests.length === 1) {
                openResponseFor(overdueRequests[0]);
              } else {
                setActiveTab("requests");
              }
            }}
          >
            {overdueRequests.length === 1 ? "Відповісти" : "Переглянути запити"}
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "flex items-center gap-1.5",
              activeTab === tab.id 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "h-5 min-w-5 text-xs",
                  tab.highlight && "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                )}
              >
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "timeline" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Хронологія перевірки</CardTitle>
              <p className="text-xs text-muted-foreground">
                Усі події перевірки, акта, ППР та оскаржень в одній стрічці.
                Натисніть на запит або документ — щоб перейти у відповідну робочу вкладку.
              </p>
            </CardHeader>
            <CardContent>
              <AuditEventJournal
                audit={audit}
                onRequestClick={() => setActiveTab("requests")}
                onDocumentsClick={() => setActiveTab("documents")}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "requests" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">
              Інтерактивні картки запитів інспектора з діями. Часову стрічку — у вкладці «Хронологія».
            </p>
            {audit.requests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Запитів від інспектора немає
                </CardContent>
              </Card>
            ) : (
              sortedRequests.map((request) => (
                <AuditRequestCard 
                  key={request.id} 
                  request={request}
                  onRespond={(id) => {
                    const r = audit.requests.find((rq) => rq.id === id);
                    if (r) openResponseFor(r);
                  }}
                  onAnalyze={(id) => {
                    const r = audit.requests.find((rq) => rq.id === id);
                    if (r) setAnalysisRequest(r);
                  }}
                  onViewResponse={(id) => {
                    const r = audit.requests.find((rq) => rq.id === id);
                    if (r) setViewedResponseRequest(r);
                  }}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base">Документи перевірки</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Файли, прикріплені до перевірки. Історію подій — у вкладці «Хронологія».
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={onNavigateToDocuments}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Додати з документообігу
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {audit.documents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Документи ще не додано
                </p>
              ) : (
                <div className="space-y-2">
                  {audit.documents.map((doc) => {
                    const ctx = docContextMap.get(doc.id);
                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          "flex items-start gap-3 p-2.5 rounded-lg transition-colors group",
                          doc.fromDocumentFlow
                            ? "hover:bg-muted/50 cursor-pointer"
                            : "opacity-70",
                        )}
                        onClick={() => handleOpenDocument(doc)}
                      >
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type} • {format(parseISO(doc.date), "dd.MM.yyyy", { locale: uk })}
                          </p>
                          {ctx ? (
                            <button
                              type="button"
                              className="mt-1 text-xs text-primary hover:underline text-left"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab("requests");
                              }}
                              title={ctx.subject}
                            >
                              До запиту {ctx.requestNumber} · Прикріплено{" "}
                              {format(parseISO(ctx.attachedDate), "dd.MM.yyyy", { locale: uk })}
                            </button>
                          ) : (
                            <p className="mt-1 text-xs text-muted-foreground/80">
                              У складі загального пакету документів
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ctx ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            >
                              Відповідь
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Пакет
                            </Badge>
                          )}
                          {doc.fromDocumentFlow && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Документообіг
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "result" && audit.result && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Результат перевірки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Act — лише якщо складено (за п. 86.2 ПКУ при перевірці без
                  порушень акт не оформлюється) */}
              {audit.result.actNumber && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Акт перевірки {audit.result.actNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      від {audit.result.actDate && format(parseISO(audit.result.actDate), "dd.MM.yyyy", { locale: uk })}
                    </p>
                  </div>
                </div>
              )}
              {/* Violations */}
              {audit.result.hasViolations ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Виявлено порушення</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Донарахування</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {audit.result.additionalTax?.toLocaleString("uk-UA")} ₴
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Штрафи</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {audit.result.penalties?.toLocaleString("uk-UA")} ₴
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Всього</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {audit.result.totalAmount?.toLocaleString("uk-UA")} ₴
                      </p>
                    </div>
                  </div>
                  
                  {audit.result.appealDeadline && audit.status !== "appealed" && (
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-amber-600" />
                        <span className="text-sm">
                          Оскарження до {format(parseISO(audit.result.appealDeadline), "dd.MM.yyyy", { locale: uk })}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleAppeal}>
                        Оскаржити
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Порушень не виявлено</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Response Form Sheet */}
      <AuditResponseForm
        open={responseFormOpen}
        onOpenChange={(open) => {
          setResponseFormOpen(open);
          if (!open) setAutoGenerate(false);
        }}
        request={selectedRequest}
        initialResponseText={draftForResponse}
        autoGenerate={autoGenerate}
        onSubmit={handleResponseSubmit}
      />

      {/* Response View Sheet (read-only) */}
      <AuditResponseViewSheet
        open={!!viewedResponseRequest}
        onOpenChange={(open) => {
          if (!open) setViewedResponseRequest(null);
        }}
        request={viewedResponseRequest}
      />

      {/* AI Request Analysis Sheet */}
      <AuditRequestAnalysisSheet
        open={!!analysisRequest}
        onOpenChange={(open) => {
          if (!open) setAnalysisRequest(null);
        }}
        request={analysisRequest}
        onUseDraft={(draft) => {
          if (analysisRequest) {
            setSelectedRequest(analysisRequest);
            setDraftForResponse(draft);
            setAutoGenerate(false);
            setAnalysisRequest(null);
            setResponseFormOpen(true);
          }
        }}
      />
    </div>
  );
};
