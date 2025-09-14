import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

function CustomNode({ data, isConnectable, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const contentEditableRef = useRef(null);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      document.execCommand('selectAll', false, null);
    }
  }, [isEditing]);

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => setIsEditing(false);

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`} onDoubleClick={handleDoubleClick}>
      <Handle type="source" position={Position.Top} id="top" className="handle" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="right" className="handle" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="handle" isConnectable={isConnectable} />
      <Handle type="source" position={Position.Left} id="left" className="handle" isConnectable={isConnectable} />
      
      <div
        ref={contentEditableRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        // The "nodrag" class has been removed from this line
        style={{ padding: '10px', minWidth: '100px', minHeight: '30px' }}
      >
        {data.label}
      </div>
    </div>
  );
}

export default React.memo(CustomNode);