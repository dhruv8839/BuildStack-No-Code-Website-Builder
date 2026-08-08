import type { AppDispatch } from '../../../app/store';
import { moveNodes, addNode, removeNode, updateNodeProperty, undo, redo } from '../state/builderSlice';
import type { BuilderNode } from '../types/builder';

export interface Command {
  type: string;
  execute(dispatch: AppDispatch): void;
}

export class MoveNodesCommand implements Command {
  type = 'MOVE_NODES';
  nodeIds: string[];
  targetParentId: string;
  index: number;

  constructor(nodeIds: string[], targetParentId: string, index: number) {
    this.nodeIds = nodeIds;
    this.targetParentId = targetParentId;
    this.index = index;
  }

  execute(dispatch: AppDispatch) {
    dispatch(moveNodes({ nodeIds: this.nodeIds, newParentId: this.targetParentId, newIndex: this.index }));
  }
}

export class AddNodeCommand implements Command {
  type = 'ADD_NODE';
  node: BuilderNode;
  targetParentId?: string;
  index?: number;

  constructor(node: BuilderNode, targetParentId?: string, index?: number) {
    this.node = node;
    this.targetParentId = targetParentId;
    this.index = index;
  }

  execute(dispatch: AppDispatch) {
    dispatch(addNode({ node: this.node, parentId: this.targetParentId, index: this.index }));
  }
}

export class RemoveNodeCommand implements Command {
  type = 'REMOVE_NODE';
  nodeId: string;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  execute(dispatch: AppDispatch) {
    dispatch(removeNode(this.nodeId));
  }
}

export class UpdatePropertyCommand implements Command {
  type = 'UPDATE_PROPERTY';
  id: string;
  section: 'content' | 'style' | 'settings';
  property: string;
  value: any;
  viewport?: any;

  constructor(
    id: string,
    section: 'content' | 'style' | 'settings',
    property: string,
    value: any,
    viewport?: any
  ) {
    this.id = id;
    this.section = section;
    this.property = property;
    this.value = value;
    this.viewport = viewport;
  }

  execute(dispatch: AppDispatch) {
    dispatch(updateNodeProperty({
      id: this.id,
      section: this.section,
      property: this.property,
      value: this.value,
      viewport: this.viewport
    }));
  }
}

export class CommandEngine {
  static execute(command: Command, dispatch: AppDispatch) {
    command.execute(dispatch);
  }

  static undo(dispatch: AppDispatch) {
    dispatch(undo());
  }

  static redo(dispatch: AppDispatch) {
    dispatch(redo());
  }
}
