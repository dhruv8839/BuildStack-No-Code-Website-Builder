import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  pointerWithin,
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  CollisionDetection
} from '@dnd-kit/core';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { NodeFactory } from '../utils/nodeFactory';
import { DragOverlayContent } from './DragOverlayContent';
import { DropTargetResolver } from '../engine/DropTargetResolver';
import type { DropTarget } from '../engine/DropTargetResolver';
import { CommandEngine, MoveNodesCommand, AddNodeCommand } from '../engine/CommandEngine';
import { DragFeedbackOverlay } from './DragFeedbackOverlay';

interface BuilderDndContextProps {
  children: React.ReactNode;
}

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return closestCorners(args);
};

export function BuilderDndContext({ children }: BuilderDndContextProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<DropTarget | null>(null);

  const dispatch = useDispatch();
  const nodes = useSelector((state: RootState) => state.builder.nodes);
  const viewport = useSelector((state: RootState) => state.builder.viewport);
  const focusedContainerId = useSelector((state: RootState) => state.focus.focusedContainerId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveData(active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active.data.current || !over.data.current) {
      setActiveDropTarget(null);
      return;
    }

    const draggedNodeIds = active.data.current.type === 'existing_component' 
      ? [active.data.current.nodeId] 
      : [];

    const dropTarget = DropTargetResolver.resolve({
      draggedNodeIds,
      overId: over.id as string,
      overData: over.data.current,
      overRect: over.rect,
      activeRect: active.rect.current.translated ?? undefined,
      nodes,
      viewport,
      focusedContainerId
    });

    setActiveDropTarget(dropTarget);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveData(null);

    const dropTargetToApply = activeDropTarget;
    setActiveDropTarget(null);

    if (!dropTargetToApply) return;

    const { parentId, insertIndex } = dropTargetToApply;
    const activeData = event.active.data.current;
    if (!activeData) return;

    if (activeData.type === 'new_component') {
      try {
        const newNode = NodeFactory.createNode(activeData.componentType as any);
        CommandEngine.execute(
          new AddNodeCommand(newNode, parentId, insertIndex),
          dispatch
        );
      } catch (e) {
        console.error("Failed to add new node", e);
      }
    } else if (activeData.type === 'existing_component') {
      const draggedNodeId = activeData.nodeId;
      if (draggedNodeId === parentId) return;

      CommandEngine.execute(
        new MoveNodesCommand([draggedNodeId], parentId, insertIndex),
        dispatch
      );
    }
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragFeedbackOverlay dropTarget={activeDropTarget} />
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeId ? <DragOverlayContent id={activeId} data={activeData} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
