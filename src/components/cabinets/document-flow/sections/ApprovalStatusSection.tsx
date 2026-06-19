/**
 * Approval Status Section
 * Displays approval workflow status for ТОВ documents only
 * 
 * Features:
 * - Visual chain of approval steps with role tooltips
 * - Action buttons for current approver
 * - Review buttons for lawyer/accountant roles ("Рекомендую до реєстрації", "Повернути з коментарями")
 * - Auto-approval badge for small amounts
 * 
 * Note: FOP documents don't show this section
 * FOP workflow: signing with QES = confirmation (no separate approval)
 */

import { useState } from "react";
import { 
  CheckCircle2, Clock, XCircle, User, ChevronRight,
  ThumbsUp, ThumbsDown, Sparkles, MessageSquare,
  FileCheck2, MessageSquareWarning, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  type ApprovalState,
  type ApprovalStep,
  roleLabels,
  roleDescriptions,
  getSlaInfo,
} from "@/config/approvalWorkflowConfig";
import { pluralizeDays } from "@/lib/ukrainian-pluralize";

interface ApprovalStatusSectionProps {
  approvalState: ApprovalState;
  documentId?: string;  // For SLA demo lookup
  currentUserId?: string;
  isDocumentAuthor?: boolean;
  onApprove?: (comment?: string) => void;
  onReject?: (comment: string) => void;
  onRecommend?: (comment: string) => void;               // М'яке погодження
  onRequestClarification?: (comment: string) => void;    // Повернути з коментарями
  onRespondToClarification?: (comment: string) => void;  // Відповідь на запит уточнення
  className?: string;
}

// Ролі, для яких показувати кнопки ревʼю
const REVIEW_ROLES = ["lawyer", "accountant", "chief-accountant"];

export const ApprovalStatusSection = ({
  approvalState,
  documentId,
  currentUserId = "user-1", // Default to accountant for testing
  isDocumentAuthor = true,  // Default to true for demo
  onApprove,
  onReject,
  onRecommend,
  onRequestClarification,
  onRespondToClarification,
  className,
}: ApprovalStatusSectionProps) => {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [clarificationDialogOpen, setClarificationDialogOpen] = useState(false);
  const [clarificationComment, setClarificationComment] = useState("");
  const [recommendDialogOpen, setRecommendDialogOpen] = useState(false);
  const [recommendComment, setRecommendComment] = useState("");
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseComment, setResponseComment] = useState("");

  // Auto-approved - show simple badge
  if (approvalState.autoApproved) {
    return (
      <Card className={cn("overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800", className)}>
        <CardContent className="py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Автоматично погоджено
            </span>
            {approvalState.autoApproveReason && (
              <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                {approvalState.autoApproveReason}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No approval required
  if (!approvalState.required || approvalState.chain.length === 0) {
    return null;
  }

  // Check if current user is the next approver
  const currentStep = approvalState.chain[approvalState.currentStepIndex];
  const isCurrentApprover = currentStep?.userId === currentUserId && 
    (currentStep?.status === "pending" || currentStep?.status === "needs-clarification");
  const isReviewRole = currentStep && REVIEW_ROLES.includes(currentStep.role);
  const hasClarificationRequest = currentStep?.clarificationRequested === true;
  
  // Overall status styling
  const getStatusBadge = () => {
    // Check for clarification request first
    if (hasClarificationRequest && approvalState.status === "in-progress") {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Потребує уточнення
        </Badge>
      );
    }
    
    switch (approvalState.status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Погоджено
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Відхилено
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            <Clock className="w-3 h-3 mr-1" />
            На погодженні
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Очікує
          </Badge>
        );
    }
  };

  const handleApprove = () => {
    onApprove?.();
  };

  const handleReject = () => {
    if (rejectComment.trim()) {
      onReject?.(rejectComment);
      setRejectDialogOpen(false);
      setRejectComment("");
    }
  };

  const handleRecommend = () => {
    if (recommendComment.trim()) {
      onRecommend?.(recommendComment);
      setRecommendDialogOpen(false);
      setRecommendComment("");
    }
  };

  const handleRequestClarification = () => {
    if (clarificationComment.trim()) {
      onRequestClarification?.(clarificationComment);
      setClarificationDialogOpen(false);
      setClarificationComment("");
    }
  };

  const handleRespondToClarification = () => {
    if (responseComment.trim()) {
      onRespondToClarification?.(responseComment);
      setResponseDialogOpen(false);
      setResponseComment("");
    }
  };

  return (
    <TooltipProvider>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Погодження
            </CardTitle>
            {getStatusBadge()}
          </div>
          
          {/* SLA info for current step */}
          {approvalState.status === "in-progress" && currentStep && currentStep.status === "pending" && (() => {
            const slaInfo = getSlaInfo(approvalState, undefined, documentId);
            if (slaInfo.daysInState > 0 && slaInfo.role) {
              return (
                <div className={cn(
                  "text-xs px-2 py-1 rounded mt-2",
                  slaInfo.severity === "critical" && "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                  slaInfo.severity === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                  slaInfo.severity === "ok" && "text-muted-foreground"
                )}>
                  На {roleLabels[slaInfo.role].toLowerCase()}і вже {slaInfo.daysInState} {pluralizeDays(slaInfo.daysInState)}
                  {slaInfo.severity === "critical" && " — протерміновано!"}
                </div>
              );
            }
            return null;
          })()}
        </CardHeader>
        <CardContent className="space-y-3 pb-3">
          {/* Approval chain visualization */}
          <div className="flex flex-wrap items-center gap-1">
            {approvalState.chain.map((step, index) => (
              <div key={index} className="flex items-center">
                <ApprovalStepBadge step={step} isActive={index === approvalState.currentStepIndex} />
                {index < approvalState.chain.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-0.5" />
                )}
              </div>
            ))}
          </div>

          {/* Clarification request banner with response option for author */}
          {hasClarificationRequest && currentStep?.clarificationReason && (
            <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="text-sm space-y-2 flex-1">
                  <p className="font-medium text-amber-700 dark:text-amber-300">
                    Запит на уточнення від {roleLabels[currentStep.role]}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400">
                    {currentStep.clarificationReason}
                  </p>
                  
                  {/* Response button for document author */}
                  {isDocumentAuthor && onRespondToClarification && (
                    <Button 
                      size="sm" 
                      className="mt-2 gap-1.5 bg-amber-600 hover:bg-amber-700"
                      onClick={() => setResponseDialogOpen(true)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Відповісти та повернути на погодження
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons for current approver */}
          {isCurrentApprover && (
            <div className="space-y-2 pt-2 border-t">
              {/* Review actions - for lawyer/accountant roles */}
              {isReviewRole && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
                    onClick={() => setRecommendDialogOpen(true)}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Рекомендую до реєстрації
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
                    onClick={() => setClarificationDialogOpen(true)}
                  >
                    <MessageSquareWarning className="w-4 h-4" />
                    Повернути з коментарями
                  </Button>
                </div>
              )}
              
              {/* Standard approval/reject */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleApprove}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Погодити
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Відхилити
                </Button>
              </div>
            </div>
          )}

          {/* Show rejected comment if any */}
          {approvalState.status === "rejected" && approvalState.chain.some(s => s.status === "rejected" && s.comment) && (
            <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-destructive mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">Причина відхилення:</p>
                  <p className="text-muted-foreground">
                    {approvalState.chain.find(s => s.status === "rejected")?.comment}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject dialog with required comment */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Відхилити документ</DialogTitle>
            <DialogDescription>
              Вкажіть причину відхилення документа. Ця інформація буде надіслана автору.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Причина відхилення..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Скасувати
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectComment.trim()}
            >
              Відхилити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recommend dialog */}
      <Dialog open={recommendDialogOpen} onOpenChange={setRecommendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Рекомендувати до реєстрації</DialogTitle>
            <DialogDescription>
              Документ буде передано на наступний етап погодження з вашою рекомендацією.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Коментар до рекомендації (обов'язково)..."
            value={recommendComment}
            onChange={(e) => setRecommendComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecommendDialogOpen(false)}>
              Скасувати
            </Button>
            <Button 
              onClick={handleRecommend}
              disabled={!recommendComment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileCheck2 className="w-4 h-4 mr-2" />
              Рекомендувати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clarification request dialog */}
      <Dialog open={clarificationDialogOpen} onOpenChange={setClarificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Повернути на доопрацювання</DialogTitle>
            <DialogDescription>
              Документ буде повернуто автору для уточнення. Вкажіть, що саме потребує корекції.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Опишіть, що потребує уточнення..."
            value={clarificationComment}
            onChange={(e) => setClarificationComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setClarificationDialogOpen(false)}>
              Скасувати
            </Button>
            <Button 
              onClick={handleRequestClarification}
              disabled={!clarificationComment.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <MessageSquareWarning className="w-4 h-4 mr-2" />
              Повернути
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response to clarification dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Відповідь на запит уточнення</DialogTitle>
            <DialogDescription>
              Опишіть внесені зміни або надайте пояснення. Документ буде повернуто на погодження.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ваша відповідь на запит уточнення..."
            value={responseComment}
            onChange={(e) => setResponseComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Скасувати
            </Button>
            <Button 
              onClick={handleRespondToClarification}
              disabled={!responseComment.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Надіслати та повернути
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

// Individual step badge component with tooltip
const ApprovalStepBadge = ({ 
  step, 
  isActive 
}: { 
  step: ApprovalStep; 
  isActive: boolean;
}) => {
  const getStepStyles = () => {
    switch (step.status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
      case "skipped":
        return "bg-muted text-muted-foreground border-border line-through";
      case "needs-clarification":
        return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700 ring-2 ring-amber-400 ring-offset-1";
      default:
        return isActive 
          ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700 ring-2 ring-amber-400 ring-offset-1" 
          : "bg-muted text-muted-foreground border-border";
    }
  };

  const getIcon = () => {
    switch (step.status) {
      case "approved":
        return <CheckCircle2 className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      case "needs-clarification":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return isActive ? <Clock className="w-3 h-3" /> : null;
    }
  };

  // Build tooltip content
  const tooltipContent = (
    <div className="text-xs space-y-1 max-w-[200px]">
      <p className="font-medium">{roleLabels[step.role]}</p>
      <p className="text-muted-foreground">{roleDescriptions[step.role]}</p>
      {step.userName && (
        <p className="text-muted-foreground">Виконавець: {step.userName}</p>
      )}
      {step.timestamp && (
        <p className="text-muted-foreground">
          {format(new Date(step.timestamp), "dd.MM.yyyy HH:mm", { locale: uk })}
        </p>
      )}
      {step.comment && (
        <p className="text-muted-foreground italic">"{step.comment}"</p>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium transition-all cursor-help",
            getStepStyles()
          )}
        >
          {getIcon()}
          <span>{roleLabels[step.role]}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
};
