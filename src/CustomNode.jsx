import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

function CustomNode({ data, isConnectable, selected, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const contentEditableRef = useRef(null);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      document.execCommand('selectAll', false, null);
      document.getSelection().collapseToEnd();
    }
  }, [isEditing]);

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => setIsEditing(false);

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} onDoubleClick={handleDoubleClick}>
      {/* We have removed the invisible hover-zone divs entirely */}

      {/* Handles are now simpler */}
      <Handle type="target" position={Position.Top} id={`${id}-top`} isConnectable={isConnectable} className="handle" />
      <Handle type="source" position={Position.Right} id={`${id}-right`} isConnectable={isConnectable} className="handle" />
      <Handle type="source" position={Position.Bottom} id={`${id}-bottom`} isConnectable={isConnectable} className="handle" />
      <Handle type="target" position={Position.Left} id={`${id}-left`} isConnectable={isConnectable} className="handle" />
      
      <div
        ref={contentEditableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        className="nodrag"
        style={{ padding: '10px', minWidth: '100px', minHeight: '30px' }}
      >
        {data.label}
      </div>
    </div>
  );
}

export default React.memo(CustomNode);