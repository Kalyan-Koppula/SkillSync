import React, { useCallback, useMemo, useRef, useEffect } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./CustomNode";
import "./styles.css";

const initialNodes = [];
const initialEdges = [];

const isValidConnection = () => true;
// We are removing the simple, flawed counter from here.

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const viewport = useViewport();
  const clipboard = useRef(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const updateNodeLabel = useCallback(
    (nodeId, newLabel) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, label: newLabel } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({ ...node, data: { ...node.data, updateNodeLabel } }))
    );
  }, [nodes.length, setNodes, updateNodeLabel]);

  const onCopy = useCallback(() => {
    const selectedNodes = reactFlowInstance
      .getNodes()
      .filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));
      const internalEdges = reactFlowInstance
        .getEdges()
        .filter(
          (edge) =>
            selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
        );
      clipboard.current = { nodes: selectedNodes, edges: internalEdges };
    }
  }, [reactFlowInstance]);

  // --- FIX: Upgraded onPaste with Robust ID Generation ---
  const onPaste = useCallback(() => {
    if (!clipboard.current) return;

    // 1. Find the highest existing node ID to ensure new IDs are unique
    const maxId = nodes.reduce(
      (max, node) => Math.max(max, parseInt(node.id, 10) || 0),
      0
    );
    let nextId = maxId + 1;

    const { nodes: copiedNodes, edges: copiedEdges } = clipboard.current;
    const idMapping = new Map();

    const newNodes = copiedNodes.map((node) => {
      const newId = `${nextId++}`; // Use our safe, incrementing counter
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
      const newSource = idMapping.get(edge.source);
      const newTarget = idMapping.get(edge.target);
      return {
        ...edge,
        // Also give the new edge a unique ID
        id: `e${newSource}-${newTarget}-${nextId++}`,
        source: newSource,
        target: newTarget,
      };
    });
    // FIX: Deselect all current nodes before adding the new, selected ones
    setNodes((currentNodes) => {
      const deselectedNodes = currentNodes.map((node) => ({
        ...node,
        selected: false,
      }));
      return [...deselectedNodes, ...newNodes];
    });
    setEdges((eds) => [...eds, ...newEdges]);
  }, [nodes, setNodes, setEdges, updateNodeLabel]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
      if (isCtrlOrCmd && event.key === "c") {
        event.preventDefault();
        onCopy();
      }
      if (isCtrlOrCmd && event.key === "v") {
        event.preventDefault();
        onPaste();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCopy, onPaste]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // --- FIX: Upgraded onAddNode with Robust ID Generation ---
  const onAddNode = useCallback(() => {
    if (!reactFlowWrapper.current) return;

    // Find the highest existing node ID to ensure the new node is unique
    const maxId = nodes.reduce(
      (max, node) => Math.max(max, parseInt(node.id, 10) || 0),
      0
    );
    const newId = `${maxId + 1}`;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = {
      x: (reactFlowBounds.width / 2 - viewport.x) / viewport.zoom,
      y: (reactFlowBounds.height / 2 - viewport.y) / viewport.zoom,
    };

    const newNode = {
      id: newId,
      type: "custom",
      position,
      data: { label: "New Node", updateNodeLabel },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, viewport, setNodes, updateNodeLabel]);

  return (
    <div style={{ width: "100vw", height: "100vh" }} ref={reactFlowWrapper}>
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
          <button
            onClick={onAddNode}
            className="add-node-button"
            title="Add Node"
          >
            {/* File icon SVG */}
            <svg
              fill="#000000"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M4,23H20a1,1,0,0,0,1-1V6a1,1,0,0,0-.293-.707l-4-4A1,1,0,0,0,16,1H4A1,1,0,0,0,3,2V22A1,1,0,0,0,4,23ZM5,3H15.586L19,6.414V21H5Zm11,9a1,1,0,0,1-1,1H13v2a1,1,0,0,1-2,0V13H9a1,1,0,0,1,0-2h2V9a1,1,0,0,1,2,0v2h2A1,1,0,0,1,16,12Z"></path>
              </g>
            </svg>
          </button>
        </Controls>
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default Canvas;
