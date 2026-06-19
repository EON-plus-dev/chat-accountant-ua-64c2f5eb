import { useState, useMemo } from "react";
import { Link2, CheckCircle, AlertCircle, ArrowRight, FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  findMatchingDocuments,
  findMatchingPayments,
  calculateSyncAnalytics,
  generateSyncSuggestions,
  type MatchCandidate,
  type PaymentMatchCandidate,
  type SyncAnalytics,
} from "@/lib/documentPaymentSync";
import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import { formatDocumentAmount } from "@/config/documentFlowConfig";

interface SyncStatusWidgetProps {
  documents: Document[];
  payments: IncomeBookRecord[];
  onChatPromptInsert?: (prompt: string) => void;
  onLinkPayment?: (paymentId: string, documentId: string) => void;
}

// Format date helper
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

export const SyncStatusWidget = ({
  documents,
  payments,
  onChatPromptInsert,
  onLinkPayment,
}: SyncStatusWidgetProps) => {
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<IncomeBookRecord | null>(null);
  const [matchCandidates, setMatchCandidates] = useState<MatchCandidate[]>([]);

  // Calculate analytics
  const analytics = useMemo(
    () => calculateSyncAnalytics(documents, payments),
    [documents, payments]
  );

  const suggestions = useMemo(
    () => generateSyncSuggestions(analytics),
    [analytics]
  );

  // Find unlinked payments with potential matches
  const unlinkedWithMatches = useMemo(() => {
    const unlinked = payments.filter(
      (p) => p.status === "income" && !p.relatedDocument && p.amount > 0
    );
    return unlinked
      .map((payment) => ({
        payment,
        matches: findMatchingDocuments(payment, documents),
      }))
      .filter((item) => item.matches.length > 0)
      .slice(0, 5); // Show top 5
  }, [payments, documents]);

  const handleShowMatches = (payment: IncomeBookRecord) => {
    const matches = findMatchingDocuments(payment, documents);
    setSelectedPayment(payment);
    setMatchCandidates(matches);
    setShowMatchDialog(true);
  };

  const handleLink = (documentId: string) => {
    if (selectedPayment) {
      onLinkPayment?.(selectedPayment.id, documentId);
      toast({
        title: "Зв'язок створено",
        description: "Документ успішно зв'язано з операцією",
      });
      setShowMatchDialog(false);
    }
  };

  const handleAISync = () => {
    onChatPromptInsert?.(
      `Проаналізуй ${analytics.unlinkedPayments} незв'язаних операцій та запропонуй зв'язки з документами`
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Синхронізація
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                analytics.syncRate >= 80
                  ? "text-green-600 border-green-300"
                  : analytics.syncRate >= 50
                  ? "text-amber-600 border-amber-300"
                  : "text-red-600 border-red-300"
              )}
            >
              {analytics.syncRate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Зв'язаних документів</span>
              <span>
                {analytics.linkedDocuments} / {analytics.totalDocuments}
              </span>
            </div>
            <Progress value={analytics.syncRate} className="h-2" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Зв'язано:</span>
              <span className="font-medium">{analytics.linkedPayments}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Очікують:</span>
              <span className="font-medium">{analytics.unlinkedPayments}</span>
            </div>
          </div>

          {/* Potential matches */}
          {unlinkedWithMatches.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase">
                Потенційні зв'язки
              </div>
              <div className="space-y-1.5">
                {unlinkedWithMatches.slice(0, 3).map(({ payment, matches }) => (
                  <button
                    key={payment.id}
                    onClick={() => handleShowMatches(payment)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {formatDocumentAmount(payment.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {payment.contractor || payment.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {matches.length} збіг
                      </Badge>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="pt-2 border-t">
              <button
                onClick={handleAISync}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  AI: Автоматичне зіставлення
                </span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match selection dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Зв'язати з документом</DialogTitle>
            <DialogDescription>
              Оберіть документ для зв'язування з операцією
              {selectedPayment && (
                <span className="block mt-1 font-medium text-foreground">
                  {formatDocumentAmount(selectedPayment.amount)} •{" "}
                  {selectedPayment.contractor || selectedPayment.description}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2 pr-4">
              {matchCandidates.map((candidate) => (
                <button
                  key={candidate.documentId}
                  onClick={() => handleLink(candidate.documentId)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{candidate.documentNumber}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          candidate.matchScore >= 70
                            ? "text-green-600 border-green-300"
                            : "text-amber-600 border-amber-300"
                        )}
                      >
                        {candidate.matchScore}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDocumentAmount(candidate.amount)} •{" "}
                      {formatDate(candidate.date)}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.matchReasons.map((reason, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                </button>
              ))}

              {matchCandidates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Не знайдено відповідних документів</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
              Скасувати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
