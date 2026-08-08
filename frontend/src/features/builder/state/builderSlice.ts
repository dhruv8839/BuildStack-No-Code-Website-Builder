import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BuilderNode } from '../types/builder';
import { NodeFactory } from '../utils/nodeFactory';
import '../registry'; // Initialize all component configs

// Deep-clone a node subtree with fresh IDs, returning: clonedNodes map and new root id
function deepCloneSubtree(
  sourceId: string,
  allNodes: Record<string, BuilderNode>
): { clonedNodes: Record<string, BuilderNode>; newRootId: string } {
  const clonedNodes: Record<string, BuilderNode> = {};

  function cloneNode(id: string, newParentId: string | undefined): string {
    const src = allNodes[id];
    if (!src) return id;
    const newId = crypto.randomUUID();
    const newChildren = src.children.map((childId) => cloneNode(childId, newId));
    clonedNodes[newId] = {
      ...JSON.parse(JSON.stringify(src)),
      id: newId,
      parentId: newParentId ?? src.parentId,
      children: newChildren,
    };
    return newId;
  }

  const newRootId = cloneNode(sourceId, allNodes[sourceId]?.parentId);
  return { clonedNodes, newRootId };
}

import type { BuilderStateDto } from '../../../types/api';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export interface HistorySnapshot {
  nodes: Record<string, BuilderNode>;
  rootNodeId: string | null;
}

export interface ThemeState {
  paletteId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  cardColor: string;
  borderColor: string;
  fontFamily: string;
}

interface BuilderState {
  version: number | null;
  schemaVersion: number;
  nodes: Record<string, BuilderNode>;
  rootNodeId: string | null;
  
  // Theme settings
  theme: ThemeState;

  // Undo / Redo History
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Selection & UI State
  selectedNodeId: string | null;
  viewport: Viewport;

  // Auto-Save Status
  isDirty: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

const initialState: BuilderState = {
  version: null,
  schemaVersion: 1,
  nodes: {},
  rootNodeId: null,
  theme: {
    paletteId: 'midnight-indigo',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    accentColor: '#38bdf8',
    backgroundColor: '#09090b',
    textColor: '#f4f4f5',
    cardColor: '#111113',
    borderColor: 'rgba(255,255,255,0.08)',
    fontFamily: 'Inter',
  },
  past: [],
  future: [],
  selectedNodeId: null,
  viewport: 'desktop',
  isDirty: false,
  saveStatus: 'idle',
};

function recordSnapshot(state: BuilderState) {
  state.past.push(JSON.parse(JSON.stringify({
    nodes: state.nodes,
    rootNodeId: state.rootNodeId
  })));
  if (state.past.length > 50) {
    state.past.shift();
  }
  state.future = [];
}

export const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    loadBuilderState: (state, action: PayloadAction<BuilderStateDto>) => {
      state.version = action.payload.version;
      state.schemaVersion = action.payload.schemaVersion;
      state.rootNodeId = action.payload.rootNodeId;
      state.selectedNodeId = null;
      
      const loadedNodes = action.payload.nodes as Record<string, any>;
      Object.keys(loadedNodes).forEach(key => {
        const node = loadedNodes[key];
        if (node.style && !node.style.desktop) {
          node.style = {
            desktop: { ...node.style },
            tablet: {},
            mobile: {}
          };
        }
      });
      state.nodes = loadedNodes as Record<string, BuilderNode>;
      
      state.past = [];
      state.future = [];
      state.isDirty = false;
      state.saveStatus = 'idle';
    },
    setSaveStatus: (state, action: PayloadAction<'idle' | 'saving' | 'saved' | 'error'>) => {
      state.saveStatus = action.payload;
    },
    setViewport: (state, action: PayloadAction<Viewport>) => {
      state.viewport = action.payload;
    },
    clearDirty: (state, action: PayloadAction<{ version: number | null }>) => {
      state.isDirty = false;
      state.version = action.payload.version;
      state.saveStatus = 'saved';
    },
    initializeCanvas: (state) => {
      const rootNode = NodeFactory.createNode('root');
      state.nodes = { [rootNode.id]: rootNode };
      state.rootNodeId = rootNode.id;
      state.version = null;
      state.selectedNodeId = null;
      state.past = [];
      state.future = [];
      state.isDirty = false;
      state.saveStatus = 'idle';
    },
    undo: (state) => {
      if (state.past.length === 0) return;
      
      const previous = state.past.pop()!;
      state.future.unshift(JSON.parse(JSON.stringify({
        nodes: state.nodes,
        rootNodeId: state.rootNodeId
      })));
      
      state.nodes = previous.nodes;
      state.rootNodeId = previous.rootNodeId;
      
      if (state.selectedNodeId && !state.nodes[state.selectedNodeId]) {
        state.selectedNodeId = null;
      }
      state.isDirty = true;
    },
    redo: (state) => {
      if (state.future.length === 0) return;
      
      const next = state.future.shift()!;
      state.past.push(JSON.parse(JSON.stringify({
        nodes: state.nodes,
        rootNodeId: state.rootNodeId
      })));
      
      state.nodes = next.nodes;
      state.rootNodeId = next.rootNodeId;
      
      if (state.selectedNodeId && !state.nodes[state.selectedNodeId]) {
        state.selectedNodeId = null;
      }
      state.isDirty = true;
    },
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },
    addNode: (state, action: PayloadAction<{ node: BuilderNode; parentId?: string; index?: number }>) => {
      recordSnapshot(state);
      const { node, parentId, index } = action.payload;
      const targetParentId = parentId || state.rootNodeId;
      
      if (!targetParentId) return;

      node.parentId = targetParentId;
      state.nodes[node.id] = node;

      const parent = state.nodes[targetParentId];
      if (parent) {
        if (typeof index === 'number' && index >= 0) {
          parent.children.splice(index, 0, node.id);
        } else {
          parent.children.push(node.id);
        }
      }

      state.selectedNodeId = node.id;
      state.isDirty = true;
    },
    moveNode: (state, action: PayloadAction<{ nodeId: string; newParentId: string; newIndex: number }>) => {
      const { nodeId, newParentId, newIndex } = action.payload;
      const node = state.nodes[nodeId];
      const newParent = state.nodes[newParentId];

      if (!node || !newParent) return;

      recordSnapshot(state);

      if (node.parentId && state.nodes[node.parentId]) {
        const oldParent = state.nodes[node.parentId];
        oldParent.children = oldParent.children.filter(id => id !== nodeId);
      }

      node.parentId = newParentId;

      let insertIndex = newIndex;
      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > newParent.children.length) insertIndex = newParent.children.length;

      newParent.children.splice(insertIndex, 0, nodeId);
      state.isDirty = true;
    },
    moveNodes: (state, action: PayloadAction<{ nodeIds: string[]; newParentId: string; newIndex: number }>) => {
      const { nodeIds, newParentId, newIndex } = action.payload;
      const newParent = state.nodes[newParentId];
      if (!newParent || nodeIds.length === 0) return;

      recordSnapshot(state);

      let currentInsertIndex = newIndex;
      nodeIds.forEach(nodeId => {
        const node = state.nodes[nodeId];
        if (!node) return;

        if (node.parentId && state.nodes[node.parentId]) {
          const oldParent = state.nodes[node.parentId];
          const oldIdx = oldParent.children.indexOf(nodeId);
          if (oldIdx !== -1) {
            oldParent.children.splice(oldIdx, 1);
            if (node.parentId === newParentId && oldIdx < currentInsertIndex) {
              currentInsertIndex--;
            }
          }
        }

        node.parentId = newParentId;
        newParent.children.splice(currentInsertIndex, 0, nodeId);
        currentInsertIndex++;
      });

      state.isDirty = true;
    },
    updateNodeProperty: (
      state, 
      action: PayloadAction<{ 
        id: string; 
        section: 'content' | 'style' | 'settings'; 
        property: string; 
        value: any; 
        viewport?: Viewport 
      }>
    ) => {
      const { id, section, property, value, viewport = 'desktop' } = action.payload;
      const node = state.nodes[id];
      if (!node) return;

      recordSnapshot(state);

      if (section === 'style') {
        if (!node.style[viewport]) {
          node.style[viewport] = {};
        }
        node.style[viewport][property] = value;
      } else {
        node[section][property] = value;
      }

      state.isDirty = true;
    },
    removeNode: (state, action: PayloadAction<string>) => {
      const idToRemove = action.payload;
      if (idToRemove === state.rootNodeId) return; // Cannot remove root

      recordSnapshot(state);

      const deleteRecursive = (id: string) => {
        const node = state.nodes[id];
        if (!node) return;
        node.children.forEach(deleteRecursive);
        delete state.nodes[id];
      };

      const nodeToRemove = state.nodes[idToRemove];
      if (nodeToRemove && nodeToRemove.parentId && state.nodes[nodeToRemove.parentId]) {
        const parent = state.nodes[nodeToRemove.parentId];
        parent.children = parent.children.filter(id => id !== idToRemove);
      }

      deleteRecursive(idToRemove);
      
      if (state.selectedNodeId === idToRemove) {
        state.selectedNodeId = null;
      }
      state.isDirty = true;
    },
    clearNodeStyleProperty: (state, action: PayloadAction<{ id: string; property: string; viewport: Viewport }>) => {
      const { id, property, viewport } = action.payload;
      const node = state.nodes[id];
      if (!node) return;
      if (viewport === 'desktop') return;
      if (node.style[viewport] && property in node.style[viewport]) {
        recordSnapshot(state);
        delete node.style[viewport][property];
        state.isDirty = true;
      }
    },
    addSection: (state, action: PayloadAction<{ sectionRootId: string; nodes: Record<string, BuilderNode> }>) => {
      recordSnapshot(state);
      const { sectionRootId, nodes } = action.payload;
      Object.assign(state.nodes, nodes);
      if (state.rootNodeId && state.nodes[state.rootNodeId]) {
        const sectionNode = state.nodes[sectionRootId];
        if (sectionNode) sectionNode.parentId = state.rootNodeId;
        state.nodes[state.rootNodeId].children.push(sectionRootId);
      }
      state.isDirty = true;
    },
    updateTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      recordSnapshot(state);
      state.theme = { ...state.theme, ...action.payload };
      state.isDirty = true;
    },
    applyGlobalPalette: (state, action: PayloadAction<ThemeState>) => {
      recordSnapshot(state);
      const palette = action.payload;
      state.theme = { ...palette };

      // Traverse all canvas nodes to update their styles live
      Object.values(state.nodes).forEach((node) => {
        if (!node.style) node.style = { desktop: {}, tablet: {}, mobile: {} };
        if (!node.style.desktop) node.style.desktop = {};

        const dStyle = node.style.desktop;

        if (node.type === 'root') {
          node.style.desktop = { ...dStyle, backgroundColor: palette.backgroundColor, color: palette.textColor };
        } else if (node.type === 'button') {
          node.style.desktop = { ...dStyle, backgroundColor: palette.primaryColor, color: '#ffffff' };
        } else if (node.type === 'container') {
          // If container has background color that isn't transparent, update to palette card/bg
          if (dStyle.backgroundColor && dStyle.backgroundColor !== 'transparent') {
            node.style.desktop = { ...dStyle, backgroundColor: palette.cardColor || palette.backgroundColor };
          }
          if (dStyle.borderColor && dStyle.borderColor !== 'transparent') {
            node.style.desktop = { ...dStyle, borderColor: palette.borderColor };
          }
        } else if (node.type === 'heading') {
          if (dStyle.color && dStyle.color !== 'inherit') {
            node.style.desktop = { ...dStyle, color: palette.textColor };
          }
        }
      });

      state.isDirty = true;
    },
    duplicateNode: (state, action: PayloadAction<string>) => {
      const sourceId = action.payload;
      const sourceNode = state.nodes[sourceId];
      if (!sourceNode || !sourceNode.parentId) return;

      recordSnapshot(state);

      const { clonedNodes, newRootId } = deepCloneSubtree(sourceId, state.nodes);
      Object.assign(state.nodes, clonedNodes);

      const parent = state.nodes[sourceNode.parentId];
      if (parent) {
        const idx = parent.children.indexOf(sourceId);
        parent.children.splice(idx + 1, 0, newRootId);
      }

      state.selectedNodeId = newRootId;
      state.isDirty = true;
    },
  },
});

export const { 
  loadBuilderState,
  setSaveStatus,
  setViewport,
  clearDirty,
  initializeCanvas, 
  undo,
  redo,
  selectNode, 
  addNode, 
  addSection,
  moveNode,
  moveNodes,
  updateNodeProperty, 
  removeNode,
  clearNodeStyleProperty,
  updateTheme,
  applyGlobalPalette,
  duplicateNode,
} = builderSlice.actions;

export default builderSlice.reducer;
