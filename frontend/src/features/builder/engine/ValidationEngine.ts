import type { BuilderNode } from '../types/builder';
import { ComponentRegistry } from '../registry/ComponentRegistry';

export class ValidationEngine {
  /**
   * Checks if candidateParentId is nodeId or a descendant of nodeId.
   * Prevents dropping a node into itself or any of its descendants.
   */
  static isDescendantOrSelf(nodeId: string, candidateParentId: string, nodes: Record<string, BuilderNode>): boolean {
    if (nodeId === candidateParentId) return true;

    let current: string | null = candidateParentId;
    while (current) {
      if (current === nodeId) return true;
      current = nodes[current]?.parentId || null;
    }

    return false;
  }

  /**
   * Validates if a set of dragged nodes can be dropped into targetParentId.
   */
  static isValidDrop(
    draggedNodeIds: string[], 
    targetParentId: string, 
    nodes: Record<string, BuilderNode>
  ): { valid: boolean; reason?: string } {
    const targetParent = nodes[targetParentId];
    if (!targetParent) {
      return { valid: false, reason: 'Target parent does not exist' };
    }

    // Target parent must be a container or root
    const parentConfig = ComponentRegistry.getConfig(targetParent.type);
    if (!parentConfig || !parentConfig.isContainer) {
      return { valid: false, reason: 'Target parent is not a container' };
    }

    for (const draggedId of draggedNodeIds) {
      // 1. Ancestor / Cycle check
      if (this.isDescendantOrSelf(draggedId, targetParentId, nodes)) {
        return { valid: false, reason: 'Cannot drop a component into itself or its descendants' };
      }

      const draggedNode = nodes[draggedId];
      if (draggedNode) {
        // Cannot drop root
        if (draggedNode.type === 'root') {
          return { valid: false, reason: 'Root component cannot be moved' };
        }
      }
    }

    return { valid: true };
  }
}
