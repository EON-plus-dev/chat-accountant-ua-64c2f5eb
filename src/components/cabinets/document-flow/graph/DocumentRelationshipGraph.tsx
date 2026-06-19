import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { TaxAudit } from "@/config/taxAuditsConfig";
import { DocumentNode } from "./nodes/DocumentNode";
import { EntityNode } from "./nodes/EntityNode";
import { useGraphData } from "./hooks/useGraphData";

interface DocumentRelationshipGraphProps {
  document: Document;
  linkedDocuments?: Document[];
  incomeBookRecords?: IncomeBookRecord[];
  audits?: TaxAudit[];
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToContractor?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToAudit?: (auditId: string) => void;
  className?: string;
}

const nodeTypes = {
  document: DocumentNode,
  entity: EntityNode,
} as const;

export const DocumentRelationshipGraph = ({
  document,
  linkedDocuments = [],
  incomeBookRecords = [],
  audits = [],
  onNavigateToDocument,
  onNavigateToContractor,
  onNavigateToPayments,
  onNavigateToIncomeBook,
  onNavigateToAudit,
  className,
}: DocumentRelationshipGraphProps) => {
  const { nodes: initialNodes, edges: initialEdges } = useGraphData({
    document,
    linkedDocuments,
    incomeBookRecords,
    audits,
    onNavigateToDocument,
    onNavigateToContractor,
    onNavigateToPayments,
    onNavigateToIncomeBook,
    onNavigateToAudit,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const proOptions = { hideAttribution: true };

  return (
    <div className={cn("h-[400px] w-full border rounded-lg overflow-hidden bg-muted/20", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={proOptions}
        minZoom={0.5}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll
        zoomOnScroll
      >
        <Background color="hsl(var(--muted-foreground))" gap={16} size={1} />
        <Controls 
          showInteractive={false}
          className="!bg-background !border-border !shadow-sm"
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === "document") return "hsl(var(--primary))";
            return "hsl(var(--muted-foreground))";
          }}
          maskColor="hsl(var(--background) / 0.8)"
          className="!bg-background !border-border"
        />
      </ReactFlow>
    </div>
  );
};
