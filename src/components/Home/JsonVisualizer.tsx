import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { DownloadChartButton } from "./DownloadChartButton";

interface JsonVisualizerProps {
  nodes: Node<any, string | undefined>[];
  edges: Edge<any>[];
  onEdgesChange: OnEdgesChange;
  onNodesChange: OnNodesChange;
}

export const JsonVisualizer = ({
  nodes,
  edges,
  onEdgesChange,
  onNodesChange,
}: JsonVisualizerProps) => {
  return (
    <div className="col-span-3">
      <div
        className="rounded-lg border border-gray-700 bg-gray-800"
        style={{ height: "600px" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
          className="dark-theme"
        >
          <Background color={"#444"} gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => node?.style?.background}
            maskColor={"rgba(0, 0, 0, 0.6)"}
          />
          <DownloadChartButton />
        </ReactFlow>
      </div>
    </div>
  );
};
