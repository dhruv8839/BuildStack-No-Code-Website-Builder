import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { removeNode, duplicateNode, selectNode, moveNode } from '../state/builderSlice';

/**
 * Global keyboard shortcuts for the builder canvas:
 * - Delete / Backspace → remove selected node (only when not in text input)
 * - Ctrl+D             → duplicate selected node
 * - Escape             → deselect current node
 * - Ctrl+ArrowUp       → move selected node up in its parent
 * - Ctrl+ArrowDown     → move selected node down in its parent
 */
export function useKeyboardShortcuts() {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector((state: RootState) => state.builder.selectedNodeId);
  const nodes = useSelector((state: RootState) => state.builder.nodes);
  const rootNodeId = useSelector((state: RootState) => state.builder.rootNodeId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest && target.closest('[contenteditable="true"]'));

      if (isTyping) return;

      // Escape — deselect
      if (e.key === 'Escape') {
        dispatch(selectNode(null));
        return;
      }
      if (!selectedNodeId) return;

      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+D — duplicate
      if (ctrl && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedNodeId !== rootNodeId) {
          dispatch(duplicateNode(selectedNodeId));
        }
        return;
      }

      // Delete / Backspace — remove
      if ((e.key === 'Delete' || e.key === 'Backspace') && !ctrl) {
        e.preventDefault();
        if (selectedNodeId !== rootNodeId) {
          dispatch(removeNode(selectedNodeId));
        }
        return;
      }

      // Ctrl+ArrowUp — move node up in parent
      if (ctrl && e.key === 'ArrowUp') {
        e.preventDefault();
        const selectedNode = nodes[selectedNodeId];
        if (selectedNode && selectedNode.parentId) {
          const parent = nodes[selectedNode.parentId];
          if (parent) {
            const index = parent.children.indexOf(selectedNodeId);
            if (index > 0) {
              dispatch(moveNode({ nodeId: selectedNodeId, newParentId: parent.id, newIndex: index - 1 }));
            }
          }
        }
        return;
      }

      // Ctrl+ArrowDown — move node down in parent
      if (ctrl && e.key === 'ArrowDown') {
        e.preventDefault();
        const selectedNode = nodes[selectedNodeId];
        if (selectedNode && selectedNode.parentId) {
          const parent = nodes[selectedNode.parentId];
          if (parent) {
            const index = parent.children.indexOf(selectedNodeId);
            if (index < parent.children.length - 1) {
              dispatch(moveNode({ nodeId: selectedNodeId, newParentId: parent.id, newIndex: index + 2 }));
            }
          }
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedNodeId, nodes, rootNodeId]);
}
