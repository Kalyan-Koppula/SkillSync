import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  useViewport,
  ConnectionMode,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import './styles.css';

const initialNodes = [];
const initialEdges = [];

const isValidConnection = () => true;
let id = 1;
const getId = () => `${id++}`;

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const viewport = useViewport();


  // --- 1. COPY/PASTE LOGIC ---
  const clipboard = useRef(null); // Ref to store the copied nodes
  // 1. Function to update a node's label in the state
  const updateNodeLabel = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // This effect ensures all nodes have the update function, even initial ones
  useEffect(() => {
    setNodes((nds) => 
      nds.map(node => ({
        ...node,
        data: { ...node.data, updateNodeLabel }
      }))
    );
  }, [updateNodeLabel, setNodes]);
  // 2. Upgraded onCopy function
  const onCopy = useCallback(() => {
    const selectedNodes = reactFlowInstance.getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      const selectedNodeIds = new Set(selectedNodes.map(n => n.id));
      const internalEdges = reactFlowInstance.getEdges().filter(
        edge => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
      );
      clipboard.current = { nodes: selectedNodes, edges: internalEdges };
    }
  }, [reactFlowInstance]);

  // 3. Upgraded onPaste function
  const onPaste = useCallback(() => {
    if (!clipboard.current) return;
    const { nodes: copiedNodes, edges: copiedEdges } = clipboard.current;
    const idMapping = new Map();

    const newNodes = copiedNodes.map((node) => {
      const newId = getId();
      idMapping.set(node.id, newId);
      return {
        ...node,
        id: newId,
        selected: true,
        position: { x: node.position.x + 20, y: node.position.y + 20 },
        data: { ...node.data, updateNodeLabel },
      };
    });

    const newEdges = copiedEdges.map((edge) => {
      return {
        ...edge,
        id: `e${idMapping.get(edge.source)}-${idMapping.get(edge.target)}`,
        source: idMapping.get(edge.source),
        target: idMapping.get(edge.target),
      };
    });

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
  }, [setNodes, setEdges, updateNodeLabel]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
      if (isCtrlOrCmd && event.key === 'c') { event.preventDefault(); onCopy(); }
      if (isCtrlOrCmd && event.key === 'v') { event.preventDefault(); onPaste(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCopy, onPaste]);


  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onConnect = useCallback((params) => {
    // Create the new edge with the markerEnd property
    const newEdge = { ...params, markerEnd: { type: MarkerType.ArrowClosed } };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onAddNode = useCallback(() => {
    if (!reactFlowWrapper.current) {
      return;
    }
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

    // Manually calculate the position in the flow plane
    const position = {
      x: (reactFlowBounds.width / 2 - viewport.x) / viewport.zoom,
      y: (reactFlowBounds.height / 2 - viewport.y) / viewport.zoom,
    };
    
    const newNode = {
      id: getId(),
      type: 'custom',
      position,
      data: { label: 'New Node', updateNodeLabel },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [viewport, setNodes]); // The dependency is now the viewport

  return (
    <div style={{ width: '100vw', height: '100vh' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        isValidConnection={isValidConnection}
        fitView
        connectionMode={ConnectionMode.Loose}
      >
        <Controls>
          <button onClick={onAddNode} className="add-node-button" title="Add Node">+</button>
          <button onClick={onCopy} title="Copy (Ctrl+C)">📋</button>
          <button onClick={onPaste} title="Paste (Ctrl+V)">📄</button>
        </Controls>
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Canvas;