import React, { useState, useEffect, useRef } from 'react';
// 1. Import NodeResizer
import { Handle, Position, NodeResizer } from '@xyflow/react';

function CustomNode({ id, data, isConnectable, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const contentEditableRef = useRef(null);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      document.execCommand('selectAll', false, null);
    }
  }, [isEditing]);

  const handleDoubleClick = () => setIsEditing(true);

  const handleBlur = (event) => {
    setIsEditing(false);
    if (data.updateNodeLabel) {
      data.updateNodeLabel(id, event.currentTarget.textContent);
    }
  };

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} onDoubleClick={handleDoubleClick}>
      {/* 2. Add the NodeResizer component for border resizing */}
      <NodeResizer 
        isVisible={selected} 
        minWidth={120} 
        minHeight={40} 
        lineClassName="resize-line"
      />

      <Handle type="source" position={Position.Top} id="top" className="handle" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="right" className="handle" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="handle" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Left} id="left" className="handle" isConnectable={isConnectable} />
      
      <div
        ref={contentEditableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        style={{ padding: '10px', minWidth: '100px', minHeight: '30px' }}
      >
        {data.label}
      </div>
    </div>
  );
}

export default React.memo(CustomNode);