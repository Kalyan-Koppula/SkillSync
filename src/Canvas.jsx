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
  MarkerType
} from '@xyflow/react';

import CustomNode from './CustomNode';
import './styles.css';
import '@xyflow/react/dist/style.css';


let id = 0;
const getId = () => `${id++}`;

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const viewport = useViewport();


  // --- 1. COPY/PASTE LOGIC ---
  const clipboard = useRef(null); // Ref to store the copied nodes

  const onCopy = useCallback(() => {
    const selectedNodes = reactFlowInstance.getNodes().filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      clipboard.current = selectedNodes;
    }
  }, [reactFlowInstance]);

  const onPaste = useCallback(() => {
    if (!clipboard.current || clipboard.current.length === 0) {
      return;
    }
    
    const newNodes = clipboard.current.map((node) => {
      const newNode = {
        ...node,
        id: getId(), // Generate a new unique ID
        selected: true, // Make the pasted node selected
        position: {   // Offset the position to avoid direct overlap
          x: node.position.x + 20,
          y: node.position.y + 20,
        },
      };
      return newNode;
    });

    // Add the new nodes to the existing ones
    setNodes((currentNodes) => [...currentNodes, ...newNodes]);
  }, [setNodes]);
  
  // --- 2. KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd && event.key === 'c') {
        event.preventDefault();
        onCopy();
      }
      if (isCtrlOrCmd && event.key === 'v') {
        event.preventDefault();
        onPaste();
      }
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
      data: { label: 'New Node' },
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
        fitView
        connectionMode={ConnectionMode.Loose}
        isValidConnection={()=>true}
      >
        <Controls>
          {/* Add the Copy and Paste buttons */}
          <button onClick={onAddNode} className="add-node-button" title="Add Node">+</button>
          <button onClick={onCopy} title="Copy (Ctrl+C)">📋</button>
          <button onClick={onPaste} title="Paste (Ctrl+V)">📄</button>
        </Controls>
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

// NOTE: You need to wrap your <Canvas /> component in <ReactFlowProvider> in your main App.js or equivalent file
// for useReactFlow() to work. Your repo already does this, which is great.

export default Canvas;