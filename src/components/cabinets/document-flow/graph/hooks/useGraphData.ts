import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { TaxAudit } from "@/config/taxAuditsConfig";
import { documentTypeConfigs, documentStatusConfigs } from "@/config/documentFlowConfig";
import { auditTypeConfig, auditStatusConfig } from "@/config/taxAuditsConfig";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { getLayoutedElements } from "../utils/layoutGraph";
import type { EntityType } from "../nodes/EntityNode";

interface UseGraphDataProps {
  document: Document;
  linkedDocuments?: Document[];
  incomeBookRecords?: IncomeBookRecord[];
  audits?: TaxAudit[];
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToContractor?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToAudit?: (auditId: string) => void;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export const useGraphData = ({
  document,
  linkedDocuments = [],
  incomeBookRecords = [],
  audits = [],
  onNavigateToDocument,
  onNavigateToContractor,
  onNavigateToPayments,
  onNavigateToIncomeBook,
  onNavigateToAudit,
}: UseGraphDataProps): GraphData => {
  return useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const docTypeConfig = documentTypeConfigs[document.type];
    const docStatusConfig = documentStatusConfigs[document.status];

    // Central document node
    nodes.push({
      id: "central-doc",
      type: "document",
      position: { x: 0, y: 0 },
      data: {
        label: document.title || docTypeConfig?.label || "Документ",
        number: document.number,
        typeLabel: docTypeConfig?.label,
        status: docStatusConfig?.label,
        statusColor: docStatusConfig?.color,
        amount: document.amount ? formatCurrency(document.amount) : undefined,
      },
    });

    // Contractor node
    if (document.contractor) {
      nodes.push({
        id: "contractor",
        type: "entity",
        position: { x: 0, y: 0 },
        data: {
          label: document.contractor.name,
          entityType: "contractor" as EntityType,
          subtitle: document.contractor.code ? `ЄДРПОУ ${document.contractor.code}` : undefined,
          onClick: onNavigateToContractor,
        },
      });
      edges.push({
        id: "central-doc-contractor",
        source: "central-doc",
        target: "contractor",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5 },
      });
    }

    // Linked documents nodes
    linkedDocuments.forEach((linkedDoc, index) => {
      const config = documentTypeConfigs[linkedDoc.type];
      const statusConfig = documentStatusConfigs[linkedDoc.status];
      nodes.push({
        id: `linked-doc-${linkedDoc.id}`,
        type: "entity",
        position: { x: 0, y: 0 },
        data: {
          label: config?.label || linkedDoc.type,
          entityType: "document" as EntityType,
          subtitle: `${linkedDoc.number} · ${format(new Date(linkedDoc.date), "dd.MM.yy", { locale: uk })}`,
          status: statusConfig?.label,
          statusColor: statusConfig?.color,
          amount: linkedDoc.amount ? formatCurrency(linkedDoc.amount) : undefined,
          onClick: () => onNavigateToDocument?.(linkedDoc.id),
        },
      });
      edges.push({
        id: `central-doc-linked-${linkedDoc.id}`,
        source: "central-doc",
        target: `linked-doc-${linkedDoc.id}`,
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(217, 91%, 60%)", strokeWidth: 1.5, strokeDasharray: "5,5" },
      });
    });

    // Payments from document
    if (document.linkedPayments && document.linkedPayments.length > 0) {
      const totalPayments = document.linkedPayments.reduce((sum, p) => sum + p.amount, 0);
      nodes.push({
        id: "payments",
        type: "entity",
        position: { x: 0, y: 0 },
        data: {
          label: `Платежі (${document.linkedPayments.length})`,
          entityType: "payment" as EntityType,
          subtitle: document.linkedPayments.map(p => p.date).join(", "),
          amount: formatCurrency(totalPayments),
          status: "Виконано",
          statusColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
          onClick: onNavigateToPayments,
        },
      });
      edges.push({
        id: "central-doc-payments",
        source: "central-doc",
        target: "payments",
        type: "smoothstep",
        animated: true,
        style: { stroke: "hsl(142, 76%, 36%)", strokeWidth: 2 },
      });
    }

    // Income book records
    if (incomeBookRecords.length > 0) {
      const totalIncome = incomeBookRecords.reduce((sum, r) => 
        r.status === "return" ? sum - r.inIncomeBook : sum + r.inIncomeBook, 0
      );
      nodes.push({
        id: "income-book",
        type: "entity",
        position: { x: 0, y: 0 },
        data: {
          label: `Книга доходів (${incomeBookRecords.length})`,
          entityType: "income-book" as EntityType,
          subtitle: incomeBookRecords.map(r => r.documentNumber || r.txnId).join(", "),
          amount: formatCurrency(totalIncome),
          onClick: onNavigateToIncomeBook,
        },
      });
      edges.push({
        id: "central-doc-income-book",
        source: "central-doc",
        target: "income-book",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(45, 93%, 47%)", strokeWidth: 1.5 },
      });
    }

    // Tax audits
    audits.forEach((audit) => {
      const typeConf = auditTypeConfig[audit.type];
      const statusConf = auditStatusConfig[audit.status];
      nodes.push({
        id: `audit-${audit.id}`,
        type: "entity",
        position: { x: 0, y: 0 },
        data: {
          label: typeConf?.label || audit.type,
          entityType: "audit" as EntityType,
          subtitle: `№${audit.orderNumber}`,
          status: statusConf?.label,
          statusColor: statusConf?.color,
          onClick: () => onNavigateToAudit?.(audit.id),
        },
      });
      edges.push({
        id: `central-doc-audit-${audit.id}`,
        source: "central-doc",
        target: `audit-${audit.id}`,
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(271, 91%, 65%)", strokeWidth: 1.5, strokeDasharray: "3,3" },
      });
    });

    // Apply auto-layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes, 
      edges,
      { rankdir: "TB", ranksep: 100, nodesep: 40 }
    );

    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, [document, linkedDocuments, incomeBookRecords, audits, onNavigateToDocument, onNavigateToContractor, onNavigateToPayments, onNavigateToIncomeBook, onNavigateToAudit]);
};
