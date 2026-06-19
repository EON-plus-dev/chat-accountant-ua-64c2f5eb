import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

export interface LayoutOptions {
  rankdir?: "TB" | "BT" | "LR" | "RL";
  ranksep?: number;
  nodesep?: number;
  nodeWidth?: number;
  nodeHeight?: number;
}

const defaultOptions: LayoutOptions = {
  rankdir: "TB",
  ranksep: 80,
  nodesep: 50,
  nodeWidth: 200,
  nodeHeight: 70,
};

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } => {
  const opts = { ...defaultOptions, ...options };
  const g = new dagre.graphlib.Graph();
  
  g.setGraph({ 
    rankdir: opts.rankdir, 
    ranksep: opts.ranksep, 
    nodesep: opts.nodesep 
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { 
      width: opts.nodeWidth, 
      height: opts.nodeHeight 
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (opts.nodeWidth! / 2),
        y: nodeWithPosition.y - (opts.nodeHeight! / 2),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
