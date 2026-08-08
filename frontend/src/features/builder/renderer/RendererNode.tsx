import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../app/store';
import { selectNode, updateNodeProperty } from '../state/builderSlice';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { 
  useSortable, 
  SortableContext, 
  horizontalListSortingStrategy, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResolvedStyle } from '../hooks/useResolvedStyle';
import { ResizeHandles } from './ResizeHandles';

// Node types that support inline text editing
const TEXT_EDITABLE_TYPES = new Set(['heading', 'paragraph', 'button']);

interface RendererNodeProps {
  nodeId: string;
}

export const RendererNode = memo(({ nodeId }: RendererNodeProps) => {
  const node = useSelector((state: RootState) => state.builder.nodes[nodeId]);
  const selectedNodeId = useSelector((state: RootState) => state.builder.selectedNodeId);
  const viewport = useSelector((state: RootState) => state.builder.viewport);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef<HTMLElement | null>(null);

  const isRoot = node?.type === 'root';
  const isTextEditable = node ? TEXT_EDITABLE_TYPES.has(node.type) : false;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: nodeId,
    data: {
      type: 'existing_component',
      nodeId: nodeId,
      componentType: node?.type,
    },
    disabled: isRoot || isEditing // Disable DnD while editing text
  });

  const { resolved: resolvedStyle } = useResolvedStyle(
    node ?? { style: { desktop: {}, tablet: {}, mobile: {} } } as any,
    viewport
  );

  // Auto-focus and select all content when entering contentEditable edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(editRef.current);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } catch (e) {
        // Selection fallback
      }
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isTextEditable) return;
    dispatch(selectNode(nodeId));
    setIsEditing(true);
  }, [isTextEditable, dispatch, nodeId]);

  const commitEdit = useCallback((newText: string) => {
    setIsEditing(false);
    if (node && newText !== node.content.text) {
      dispatch(updateNodeProperty({
        id: node.id,
        section: 'content',
        property: 'text',
        value: newText,
      }));
    }
  }, [node, dispatch]);

  if (!node) return null;

  const config = ComponentRegistry.getConfig(node.type);
  if (!config) return <div className="text-red-500">Unknown component: {node.type}</div>;

  const isSelected = selectedNodeId === node.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      dispatch(selectNode(node.id));
    }
  };

  const childrenNodes = node.children.map((childId) => (
    <RendererNode key={childId} nodeId={childId} />
  ));

  const resolvedNode = { ...node, style: resolvedStyle };

  let renderedContent = config.render({ node: resolvedNode as any, children: childrenNodes });

  const dndStyle = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    willChange: 'transform' as const,
  };

  const showResizeHandles = isSelected && !isEditing && !isRoot;
  const isInteractiveElement = node.type === 'video' || node.type === 'image' || node.type === 'form';

  // Preserve node size & layout display
  const nodeDisplay = resolvedStyle.display || (['button', 'image', 'video', 'icon'].includes(node.type) ? 'inline-block' : 'block');
  const nodeWidth = resolvedStyle.width ?? (nodeDisplay === 'inline-block' ? 'auto' : '100%');

  // Entrance Animation Effect
  const animEffect = node.content?.animation || resolvedStyle?.animation || 'none';
  const animClass = animEffect !== 'none' ? animEffect : '';

  // Selection & drag classes
  const baseClasses = `bs-sortable-item bs-node-wrapper transition-all duration-150 cursor-pointer ${animClass}`.trim();
  const selectionClasses = isSelected
    ? 'ring-2 ring-indigo-500 z-10'
    : 'hover:ring-1 hover:ring-indigo-400/40';
  const editingClasses = isEditing ? 'ring-2 ring-indigo-500 z-10 shadow-lg' : '';
  // Ghost placeholder: drastically reduce opacity and apply grayscale when dragging
  const draggingClasses = isDragging ? 'bs-is-dragging' : '';

  // Grip handle — 6 dots visible on hover (non-root, non-editing)
  const gripHandle = !isRoot && !isEditing ? (
    <div className="bs-drag-handle" aria-hidden="true">
      {[...Array(6)].map((_, i) => <span key={i} />)}
    </div>
  ) : null;

  // Pointer overlay for elements like video/iframe that trap click events
  const pointerOverlay = isInteractiveElement ? (
    <div 
      onClick={handleSelect}
      className="absolute inset-0 z-20 cursor-pointer bg-transparent"
      title="Click to select"
    />
  ) : null;

  // Inject dnd refs, styles, selection rings, and handles directly into component
  if (React.isValidElement(renderedContent)) {
    const existingProps = (renderedContent as React.ReactElement<any>).props;
    const existingClassName = existingProps.className || '';
    const existingStyle = existingProps.style || {};

    const isSelfClosingOrCustom =
      ['img', 'iframe', 'video', 'input', 'hr'].includes(
        typeof renderedContent.type === 'string' ? renderedContent.type : ''
      ) ||
      typeof renderedContent.type === 'function' ||
      ['form', 'image', 'video', 'accordion', 'tabs'].includes(node.type);

    if (isSelfClosingOrCustom) {
      // Components that cannot take DOM refs or sortable listeners directly: wrap in outer selectable div
      renderedContent = (
        <div
          ref={(el) => {
            setNodeRef(el);
            editRef.current = el;
          }}
          data-node-id={node.id}
          style={{
            position: 'relative',
            display: nodeDisplay,
            width: nodeWidth,
            height: resolvedStyle.height || 'auto',
            marginTop: resolvedStyle.marginTop,
            marginBottom: resolvedStyle.marginBottom,
            marginLeft: resolvedStyle.marginLeft,
            marginRight: resolvedStyle.marginRight,
            alignSelf: resolvedStyle.alignSelf,
            ...dndStyle,
          }}
          onClick={handleSelect}
          onDoubleClick={handleDoubleClick}
          className={`${baseClasses} ${isEditing ? editingClasses : selectionClasses} ${draggingClasses}`.trim()}
          {...(isEditing ? {} : attributes)}
          {...(isEditing ? {} : listeners)}
        >
          {React.cloneElement(renderedContent as React.ReactElement<any>, {
            style: {
              ...existingStyle,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 0,
              marginRight: 0,
              width: '100%',
              alignSelf: resolvedStyle.alignSelf,
            }
          })}
          {gripHandle}
          {pointerOverlay}
          {showResizeHandles && <ResizeHandles nodeId={node.id} />}
        </div>
      );
    } else {
      // Container/Box/Text tags (heading, paragraph, button, div, section): direct contentEditable in-place editing
      const existingChildren = existingProps.children;
      
      renderedContent = React.cloneElement(renderedContent as React.ReactElement<any>, {
        ref: (el: HTMLElement | null) => {
          setNodeRef(el);
          editRef.current = el;
        },
        'data-node-id': node.id,
        contentEditable: isEditing && isTextEditable,
        suppressContentEditableWarning: true,
        style: {
          ...existingStyle,
          ...dndStyle,
          position: 'relative',
          outline: isEditing ? '2px solid #6366f1' : undefined,
          outlineOffset: isEditing ? '2px' : undefined,
          borderRadius: isEditing ? '4px' : undefined,
        },
        onClick: handleSelect,
        onDoubleClick: handleDoubleClick,
        onBlur: isEditing ? (e: React.FocusEvent<HTMLElement>) => {
          commitEdit(e.currentTarget.textContent || '');
        } : undefined,
        onKeyDown: isEditing ? (e: React.KeyboardEvent<HTMLElement>) => {
          e.stopPropagation();
          if (e.key === 'Escape') {
            setIsEditing(false);
          } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commitEdit((e.currentTarget as HTMLElement).textContent || '');
          }
        } : undefined,
        className: `${existingClassName} ${baseClasses} ${isEditing ? editingClasses : selectionClasses} ${draggingClasses}`.trim(),
        ...(isEditing ? {} : attributes),
        ...(isEditing ? {} : listeners),
        children: (
          <>
            {existingChildren}
            {gripHandle}
            {pointerOverlay}
            {showResizeHandles && <ResizeHandles nodeId={node.id} />}
          </>
        )
      });
    }
  } else {
    renderedContent = (
      <div
        ref={(el) => {
          setNodeRef(el);
          editRef.current = el;
        }}
        data-node-id={node.id}
        style={{
          position: 'relative',
          display: nodeDisplay,
          width: nodeWidth,
          ...dndStyle,
        }}
        {...(isEditing ? {} : attributes)}
        {...(isEditing ? {} : listeners)}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
        className={`${baseClasses} ${isEditing ? editingClasses : selectionClasses} ${draggingClasses}`.trim()}
      >
        {renderedContent}
        {pointerOverlay}
        {showResizeHandles && <ResizeHandles nodeId={node.id} />}
      </div>
    );
  }

  // Choose optimal sorting strategy based on container layout
  if (config.isContainer) {
    const isHorizontalRow = resolvedStyle.flexDirection === 'row';
    const sortingStrategy = isHorizontalRow 
      ? horizontalListSortingStrategy 
      : rectSortingStrategy;

    // Empty container drop zone — shimmer invite shown in builder
    const emptyDropZone = node.children.length === 0 ? (
      <div className="bs-empty-drop-zone">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Drop here
      </div>
    ) : null;

    return (
      <SortableContext
        items={node.children}
        strategy={sortingStrategy}
        id={node.id}
      >
        {React.cloneElement(renderedContent as React.ReactElement<any>, {
          children: (
            <>
              {(renderedContent as React.ReactElement<any>).props.children}
              {emptyDropZone}
            </>
          )
        })}
      </SortableContext>
    );
  }

  return renderedContent;
});
