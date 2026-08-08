import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateNodeProperty } from '../state/builderSlice';
import type { RootState } from '../../../app/store';

interface ResizeHandlesProps {
  nodeId: string;
}

type HandleDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_DIRECTIONS: { dir: HandleDirection; className: string; cursor: string }[] = [
  { dir: 'nw', className: '-top-1.5 -left-1.5', cursor: 'nwse-resize' },
  { dir: 'n',  className: '-top-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
  { dir: 'ne', className: '-top-1.5 -right-1.5', cursor: 'nesw-resize' },
  { dir: 'e',  className: 'top-1/2 -translate-y-1/2 -right-1.5', cursor: 'ew-resize' },
  { dir: 'se', className: '-bottom-1.5 -right-1.5', cursor: 'nwse-resize' },
  { dir: 's',  className: '-bottom-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
  { dir: 'sw', className: '-bottom-1.5 -left-1.5', cursor: 'nesw-resize' },
  { dir: 'w',  className: 'top-1/2 -translate-y-1/2 -left-1.5', cursor: 'ew-resize' },
];

export function ResizeHandles({ nodeId }: ResizeHandlesProps) {
  const dispatch = useDispatch();
  const viewport = useSelector((state: RootState) => state.builder.viewport);
  const node = useSelector((state: RootState) => state.builder.nodes[nodeId]);

  const handleMouseDown = useCallback((e: React.MouseEvent, dir: HandleDirection) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;

    const parentElem = (e.target as HTMLElement).parentElement;
    if (!parentElem) return;

    const startWidth = parentElem.offsetWidth;
    const startHeight = parentElem.offsetHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      const MAX_ELEMENT_WIDTH = 1440;

      if (dir.includes('e')) newWidth = Math.min(MAX_ELEMENT_WIDTH, Math.max(20, startWidth + deltaX));
      if (dir.includes('w')) newWidth = Math.min(MAX_ELEMENT_WIDTH, Math.max(20, startWidth - deltaX));
      if (dir.includes('s')) newHeight = Math.max(20, startHeight + deltaY);
      if (dir.includes('n')) newHeight = Math.max(20, startHeight - deltaY);

      if (dir.includes('e') || dir.includes('w')) {
        dispatch(updateNodeProperty({
          id: nodeId,
          section: 'style',
          property: 'width',
          value: `${Math.round(newWidth)}px`,
          viewport
        }));
      }

      if (dir.includes('n') || dir.includes('s')) {
        dispatch(updateNodeProperty({
          id: nodeId,
          section: 'style',
          property: 'height',
          value: `${Math.round(newHeight)}px`,
          viewport
        }));
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [dispatch, nodeId, viewport]);

  if (!node || node.type === 'root') return null;

  return (
    <>
      {HANDLE_DIRECTIONS.map(({ dir, className, cursor }) => (
        <div
          key={dir}
          onMouseDown={(e) => handleMouseDown(e, dir)}
          style={{ cursor }}
          className={`absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-full z-30 shadow-sm hover:scale-125 transition-transform ${className}`}
          title={`Resize (${dir.toUpperCase()})`}
        />
      ))}
    </>
  );
}
