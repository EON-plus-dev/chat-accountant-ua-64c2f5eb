import { Fragment } from "react";
import { Building2, User, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type KikOwnerNode,
  JURISDICTION_LABELS,
} from "@/config/demoCabinets/kikRegistryConfig";

interface KikOwnershipTreeProps {
  root: KikOwnerNode;
}

/**
 * Compact recursive ownership tree.
 * Renders the КІК as the root, with each level of owners drawn below using
 * indented connectors. The "self" owner is highlighted.
 */
export function KikOwnershipTree({ root }: KikOwnershipTreeProps) {
  return (
    <div className="rounded-md border bg-muted/20 p-3 overflow-x-auto">
      <NodeRow node={root} depth={0} isLast />
    </div>
  );
}

function NodeRow({
  node,
  depth,
  isLast,
}: {
  node: KikOwnerNode;
  depth: number;
  isLast: boolean;
}) {
  const Icon = node.type === "individual" ? (node.isOwnerSelf ? Crown : User) : Building2;
  return (
    <div className="text-sm">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5",
          node.isOwnerSelf && "rounded bg-primary/10 px-2 -mx-2 border border-primary/30",
        )}
        style={{ paddingLeft: depth * 18 }}
      >
        {depth > 0 && (
          <span className="text-muted-foreground/60 font-mono text-xs select-none">
            {isLast ? "└─" : "├─"}
          </span>
        )}
        <Icon
          className={cn(
            "size-4 shrink-0",
            node.isOwnerSelf ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span className={cn("font-medium truncate", node.isOwnerSelf && "text-primary")}>
          {node.name}
        </span>
        {node.jurisdiction && (
          <Badge variant="outline" className="text-[10px] h-5">
            {JURISDICTION_LABELS[node.jurisdiction]}
          </Badge>
        )}
        {depth > 0 && (
          <Badge
            variant={node.isOwnerSelf ? "default" : "secondary"}
            className="text-[10px] h-5 ml-auto tabular-nums"
          >
            {node.share}%
          </Badge>
        )}
        {node.isOwnerSelf && (
          <Badge variant="outline" className="text-[10px] h-5 border-primary/40 text-primary">
            Ви
          </Badge>
        )}
      </div>
      {node.children?.map((child, i) => (
        <Fragment key={child.id}>
          <NodeRow
            node={child}
            depth={depth + 1}
            isLast={i === node.children!.length - 1}
          />
        </Fragment>
      ))}
    </div>
  );
}

export default KikOwnershipTree;
