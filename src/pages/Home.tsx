import { useState, useCallback, useEffect } from "react";
import { useNodesState, useEdgesState, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { JsonEditor, JsonVisualizer } from "../components";
import { SearchBar } from "../components/Home/SearchBar";
import { nodeColors } from "../constants";
import type { Node, Edge } from "reactflow";
import type { NodeType } from "../constants/nodes.constant";

const sampleJSON = `{
  "user": {
    "id": 1,
    "name": "John Doe",
    "address": {
      "city": "New York",
      "country": "USA"
    },
    "items": [
      {"name": "item1"},
      {"name": "item2"}
    ]
  }
}`;

export const Home = () => {
  const [jsonInput, setJsonInput] = useState(sampleJSON);
  const [searchPath, setSearchPath] = useState("");
  const [error, setError] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [_, setParsedData] = useState(null);

  const getNodeType = (value: unknown) => {
    if (value === null) return "primitive";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return "primitive";
  };

  const handleBuildTree = useCallback(
    (
      data: unknown,
      parentId: null | string = null,
      key = "root",
      path = "$",
      level = 0
    ) => {
      const nodeId = `${parentId ? parentId + "-" : ""}${key}`;
      const nodeType = getNodeType(data);

      const nodes = [];
      const edges = [];

      let label = key;
      let fullPath = path;

      if (key !== "root") {
        if (parentId && parentId?.includes("array")) {
          fullPath = `${path}[${key}]`;
          label = `[${key}]`;
        } else {
          fullPath = `${path}.${key}`;
        }
      }

      const nodeData = {
        label: label,
        value: data,
        type: nodeType,
        path: fullPath,
      };

      nodes.push({
        id: nodeId,
        data: nodeData,
        position: { x: 0, y: 0 },
        style: {
          background: nodeColors[nodeType],
          color: "white",
          border: "2px solid #fff",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "12px",
          fontWeight: "500",
          minWidth: "80px",
          textAlign: "center" as "center",
        },
      });

      if (parentId) {
        edges.push({
          id: `e-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { stroke: "#666" },
        });
      }

      if (nodeType === "object" && typeof data === "object" && data !== null) {
        Object.entries(data).forEach(([childKey, childValue]) => {
          const childResult = handleBuildTree(
            childValue,
            nodeId,
            childKey,
            fullPath,
            level + 1
          );
          nodes.push(...childResult.nodes);
          edges.push(...childResult.edges);
        });
      } else if (nodeType === "array" && Array.isArray(data)) {
        data.forEach((item, index) => {
          const childResult = handleBuildTree(
            item,
            nodeId,
            index.toString(),
            fullPath,
            level + 1
          );
          nodes.push(...childResult.nodes);
          edges.push(...childResult.edges);
        });
      }

      return { nodes, edges };
    },
    []
  );

  const layoutNodes = (nodes: Node[], edges: Edge[]) => {
    const nodeMap = new Map<string, Node>(nodes.map((n: any) => [n.id, n]));
    const childrenMap = new Map();

    edges.forEach((edge: any) => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source).push(edge.target);
    });

    const levelWidth = 180;
    const levelHeight = 100;
    const levels = new Map<number, string[]>();

    const calculateLevels = (nodeId: any, level = 0) => {
      if (!levels.has(level)) {
        levels.set(level, []);
      }
      levels.get(level)!.push(nodeId);

      const children = childrenMap.get(nodeId) || [];
      children.forEach((childId: any) => calculateLevels(childId, level + 1));
    };

    const rootNode = nodes.find((n) => !edges.some((e) => e.target === n.id));
    if (rootNode) {
      calculateLevels(rootNode.id);
    }

    levels.forEach((nodeIds, level) => {
      const levelNodeCount = nodeIds.length;
      nodeIds.forEach((nodeId, index) => {
        const node = nodeMap.get(nodeId);
        if (node) {
          node.position = {
            x: (index - (levelNodeCount - 1) / 2) * levelWidth,
            y: level * levelHeight,
          };
        }
      });
    });

    return nodes;
  };

  const handleGenerateTree = () => {
    try {
      setError("");
      setSearchMessage("");
      const parsed = JSON.parse(jsonInput);
      setParsedData(parsed);

      const { nodes: treeNodes, edges: treeEdges } = handleBuildTree(parsed);

      const layoutedNodes = layoutNodes(treeNodes, treeEdges);
      setNodes(layoutedNodes);
      setEdges(treeEdges);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Invalid JSON: ${err.message}`);
      }
      setNodes([]);
      setEdges([]);
    }
  };

  const handleSearch = () => {
    if (!searchPath.trim()) {
      setSearchMessage("Please enter a search path");
      return;
    }

    const searchNormalized = searchPath.trim().replace(/^\$\.?/, "");
    let found = false;

    const updatedNodes = nodes.map((node) => {
      const nodePath = node.data.path.replace(/^\$\.?/, "");
      const isMatch = nodePath === searchNormalized;

      if (isMatch) {
        found = true;
      }

      return {
        ...node,
        style: {
          ...node.style,
          background: isMatch
            ? nodeColors.highlighted
            : nodeColors[node.data.type as NodeType],
          border: isMatch ? "3px solid #dc2626" : "2px solid #fff",
        },
      };
    });

    setNodes(updatedNodes);
    setSearchMessage(found ? "✓ Match found" : "✗ No match found");

    if (found) {
      const matchedNode = updatedNodes.find(
        (node) => node.data.path.replace(/^\$\.?/, "") === searchNormalized
      );
      if (matchedNode) {
        setTimeout(() => {
          const element = document.querySelector(
            `[data-id="${matchedNode.id}"]`
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    }
  };

  const handleClearSearch = () => {
    const resetNodes = nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        background: nodeColors[node.data.type as NodeType], // restore default
        border: "2px solid #fff",
      },
    }));
    setNodes(resetNodes);
    setSearchPath("");
    setSearchMessage("");
  };

  const handleClearJson = () => {
    setJsonInput("");
    setNodes([]);
    setEdges([]);
    setParsedData(null);
    setSearchPath("");
    setSearchMessage("");
    setError("");
  };

  useEffect(() => {
    handleGenerateTree();
  }, []);

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-2">
        <div className="flex flex-col gap-4">
          <JsonEditor
            jsonInput={jsonInput}
            setJsonInput={setJsonInput}
            error={error}
            handleGenerateTree={handleGenerateTree}
            handleClearJson={handleClearJson}
          />
          <hr />
          <SearchBar
            handleSearch={handleSearch}
            searchMessage={searchMessage}
            searchPath={searchPath}
            setSearchPath={setSearchPath}
            handleClearSearch={handleClearSearch}
          />
        </div>
      </div>
      <JsonVisualizer
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
      />
    </div>
  );
};
