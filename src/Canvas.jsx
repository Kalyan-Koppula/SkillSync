import React, { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  useViewport,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import './styles.css';

const initialNodes = [
  { id: '1', type: 'custom', data: { label: 'Main Idea (Source)' }, position: { x: 250, y: 5 } },
  { id: '2', type: 'custom', data: { label: 'Sub-topic (Target)' }, position: { x: 100, y: 125 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: '1-bottom', targetHandle: '2-top' },
];

let id = 3;
const getId = () => `${id++}`;

function Canvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Get the current viewport state { x, y, zoom }
  const viewport = useViewport();

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
      >
        <Controls>
          {/* Button no longer needs to be disabled */}
          <button 
            onClick={onAddNode} 
            className="add-node-button" 
            title="Add Node"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </Controls>
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Canvas;