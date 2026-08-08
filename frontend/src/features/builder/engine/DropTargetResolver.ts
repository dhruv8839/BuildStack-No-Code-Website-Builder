import type { BuilderNode } from '../types/builder';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { ValidationEngine } from './ValidationEngine';
import { LayoutEngine } from './LayoutEngine';

export interface DropTarget {
  parentId: string;
  insertIndex: number;
  position: 'before' | 'inside' | 'after';
  orientation: 'vertical' | 'horizontal';
  targetNodeId: string;
  targetRect?: { top: number; left: number; width: number; height: number };
}

export interface ResolveDropTargetOptions {
  draggedNodeIds: string[];
  overId: string;
  overData: any;
  overRect?: { top: number; left: number; width: number; height: number };
  activeRect?: { top: number; left: number; width: number; height: number };
  nodes: Record<string, BuilderNode>;
  viewport?: string;
  focusedContainerId?: string | null;
  keys?: { altKey?: boolean; cmdKey?: boolean };
}

export class DropTargetResolver {
  static resolve(options: ResolveDropTargetOptions): DropTarget | null {
    const {
      draggedNodeIds,
      overId,
      overData,
      overRect,
      activeRect,
      nodes,
      viewport = 'desktop',
      focusedContainerId,
      keys
    } = options;

    const overNode = nodes[overId];
    if (!overNode) return null;

    // Focus mode restriction: if in focus mode, targets outside focused subtree are invalid
    if (focusedContainerId && !ValidationEngine.isDescendantOrSelf(focusedContainerId, overId, nodes)) {
      return null;
    }

    const overConfig = ComponentRegistry.getConfig(overNode.type);
    const isOverContainer = overConfig?.isContainer ?? false;

    let targetParentId: string = overId;
    let insertIndex: number = 0;
    let position: 'before' | 'inside' | 'after' = 'inside';

    // Layout strategy of the hovered node's container
    const parentContainerId = overData?.sortable?.containerId || overNode.parentId || overId;
    const parentContainer = nodes[parentContainerId];
    const layoutStrategy = LayoutEngine.getStrategy(parentContainer, viewport);
    const orientation = layoutStrategy.type === 'horizontal' ? 'horizontal' : 'vertical';

    if (overRect && activeRect) {
      const placement = layoutStrategy.calculatePlacement(activeRect, overRect);

      // Force modifier overrides
      if (keys?.altKey && isOverContainer) {
        // Alt key forces INSIDE drop
        targetParentId = overNode.id;
        insertIndex = overNode.children.length;
        position = 'inside';
      } else if (keys?.cmdKey && overNode.parentId) {
        // Cmd/Ctrl key forces BREAKOUT to parent
        targetParentId = overNode.parentId;
        const grandParent = nodes[targetParentId];
        const idx = grandParent ? grandParent.children.indexOf(overNode.id) : 0;
        insertIndex = placement.placeAfter ? idx + 1 : idx;
        position = placement.placeAfter ? 'after' : 'before';
      } else {
        // FIX: Empty containers ALWAYS accept inside drops regardless of pointer ratio
        if (isOverContainer && overNode.children.length === 0) {
          targetParentId = overNode.id;
          insertIndex = 0;
          position = 'inside';
        } else {
          // Corrected 20% / 60% / 20% Drop Zone:
          // - Outer 20% edges = breakout to parent
          // - Inner 60% center = drop INSIDE container (if container), or sibling placement
          const isNearEdge = placement.relativeRatio < 0.20 || placement.relativeRatio > 0.80;
          const isNearTopEdge = placement.relativeRatio < 0.20;

          if (isOverContainer && isNearEdge && overNode.parentId) {
            // Edge zone: breakout to outer parent
            targetParentId = overNode.parentId;
            const parentNode = nodes[targetParentId];
            const containerIdx = parentNode ? parentNode.children.indexOf(overNode.id) : 0;
            insertIndex = isNearTopEdge ? containerIdx : containerIdx + 1;
            position = isNearTopEdge ? 'before' : 'after';
          } else if (isOverContainer && !isNearEdge) {
            // Center zone on a container: drop INSIDE
            targetParentId = overNode.id;
            insertIndex = overNode.children.length;
            position = 'inside';
          } else if (overData?.sortable) {
            // Sibling placement for non-container nodes
            targetParentId = overData.sortable.containerId;
            const overIdx = overData.sortable.index;
            insertIndex = placement.placeAfter ? overIdx + 1 : overIdx;
            position = placement.placeAfter ? 'after' : 'before';
          } else if (overNode.parentId) {
            // Fallback sibling placement
            targetParentId = overNode.parentId;
            const parent = nodes[targetParentId];
            const idx = parent ? parent.children.indexOf(overNode.id) : 0;
            insertIndex = placement.placeAfter ? idx + 1 : idx;
            position = placement.placeAfter ? 'after' : 'before';
          }
        }
      }
    } else {
      // Fallback without rects — always inside for containers
      if (isOverContainer) {
        targetParentId = overNode.id;
        insertIndex = overNode.children.length;
        position = 'inside';
      } else if (overNode.parentId) {
        targetParentId = overNode.parentId;
        const parent = nodes[targetParentId];
        const idx = parent ? parent.children.indexOf(overNode.id) : 0;
        insertIndex = idx + 1;
        position = 'after';
      }
    }

    // Validate drop target
    const validation = ValidationEngine.isValidDrop(draggedNodeIds, targetParentId, nodes);
    if (!validation.valid) {
      return null;
    }

    return {
      parentId: targetParentId,
      insertIndex: Math.max(0, insertIndex),
      position,
      orientation,
      targetNodeId: overId,
      targetRect: overRect
    };
  }
}
