import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

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

const nodeColors = {
  object: '#6366f1',
  array: '#10b981',
  primitive: '#f59e0b',
  highlighted: '#ef4444'
};

const JSONTreeVisualizer = () => {
  const [jsonInput, setJsonInput] = useState(sampleJSON);
  const [searchPath, setSearchPath] = useState('');
  const [error, setError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  const getNodeType = (value) => {
    if (value === null) return 'primitive';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'primitive';
  };

  const buildTree = useCallback((data, parentId = null, key = 'root', path = '$', level = 0) => {
    const nodeId = `${parentId ? parentId + '-' : ''}${key}`;
    const nodeType = getNodeType(data);
    
    const nodes = [];
    const edges = [];

    let label = key;
    let fullPath = path;

    if (key !== 'root') {
      if (parentId && parentId.includes('array')) {
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
      path: fullPath
    };

    nodes.push({
      id: nodeId,
      data: nodeData,
      position: { x: 0, y: 0 },
      style: {
        background: nodeColors[nodeType],
        color: 'white',
        border: '2px solid #fff',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: '500',
        minWidth: '80px',
        textAlign: 'center'
      }
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: darkMode ? '#666' : '#b1b1b7' }
      });
    }

    if (nodeType === 'object') {
      Object.entries(data).forEach(([childKey, childValue]) => {
        const childResult = buildTree(childValue, nodeId, childKey, fullPath, level + 1);
        nodes.push(...childResult.nodes);
        edges.push(...childResult.edges);
      });
    } else if (nodeType === 'array') {
      data.forEach((item, index) => {
        const childResult = buildTree(item, nodeId, index.toString(), fullPath, level + 1);
        nodes.push(...childResult.nodes);
        edges.push(...childResult.edges);
      });
    }

    return { nodes, edges };
  }, [darkMode]);

  const layoutNodes = (nodes, edges) => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const childrenMap = new Map();
    
    edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source).push(edge.target);
    });

    const levelWidth = 180;
    const levelHeight = 100;
    const levels = new Map();

    const calculateLevels = (nodeId, level = 0) => {
      if (!levels.has(level)) {
        levels.set(level, []);
      }
      levels.get(level).push(nodeId);
      
      const children = childrenMap.get(nodeId) || [];
      children.forEach(childId => calculateLevels(childId, level + 1));
    };

    const rootNode = nodes.find(n => !edges.some(e => e.target === n.id));
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
            y: level * levelHeight
          };
        }
      });
    });

    return nodes;
  };

  const generateTree = () => {
    try {
      setError('');
      setSearchMessage('');
      const parsed = JSON.parse(jsonInput);
      setParsedData(parsed);
      
      const { nodes: treeNodes, edges: treeEdges } = buildTree(parsed);
      const layoutedNodes = layoutNodes(treeNodes, treeEdges);
      
      setNodes(layoutedNodes);
      setEdges(treeEdges);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setNodes([]);
      setEdges([]);
    }
  };

  const handleSearch = () => {
    if (!searchPath.trim()) {
      setSearchMessage('Please enter a search path');
      return;
    }

    const searchNormalized = searchPath.trim().replace(/^\$\.?/, '');
    let found = false;

    const updatedNodes = nodes.map(node => {
      const nodePath = node.data.path.replace(/^\$\.?/, '');
      const isMatch = nodePath === searchNormalized;
      
      if (isMatch) {
        found = true;
      }

      return {
        ...node,
        style: {
          ...node.style,
          background: isMatch ? nodeColors.highlighted : nodeColors[node.data.type],
          border: isMatch ? '3px solid #dc2626' : '2px solid #fff',
          transform: isMatch ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }
      };
    });

    setNodes(updatedNodes);
    setSearchMessage(found ? '✓ Match found' : '✗ No match found');

    if (found) {
      const matchedNode = updatedNodes.find(node => 
        node.data.path.replace(/^\$\.?/, '') === searchNormalized
      );
      if (matchedNode) {
        setTimeout(() => {
          const element = document.querySelector(`[data-id="${matchedNode.id}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  useEffect(() => {
    generateTree();
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            JSON Tree Visualizer
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Paste or type JSON data
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className={`w-full h-64 p-4 rounded-lg border font-mono text-sm ${
                darkMode 
                  ? 'bg-gray-800 text-gray-100 border-gray-700' 
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
              placeholder="Enter JSON here..."
            />
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              onClick={generateTree}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
            >
              Generate Tree
            </button>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Search by JSON path
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="$.user.address.city or user.address.city"
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-800 text-gray-100 border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Search
              </button>
            </div>
            {searchMessage && (
              <div className={`mt-2 p-3 rounded-lg text-sm font-medium ${
                searchMessage.includes('✓') 
                  ? 'bg-green-100 text-green-700 border border-green-400' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-400'
              }`}>
                {searchMessage}
              </div>
            )}

            <div className="mt-6">
              <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Node Types
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: nodeColors.object }}></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Objects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: nodeColors.array }}></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Arrays</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: nodeColors.primitive }}></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Primitives</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: nodeColors.highlighted }}></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Highlighted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`} style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
            className={darkMode ? 'dark-theme' : ''}
          >
            <Background color={darkMode ? '#444' : '#aaa'} gap={16} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => node.style.background}
              maskColor={darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default JSONTreeVisualizer;