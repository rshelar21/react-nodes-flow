export type NodeType = "object" | "array" | "primitive" | "highlighted";

export const nodeColors: Record<NodeType, string> = {
  object: "#6366f1",
  array: "#10b981",
  primitive: "#f59e0b",
  highlighted: "#ef4444",
};
