import type { BuilderNode, NodeType } from '../types/builder';
import { generateNodeId } from './idGenerator';
import { ComponentRegistry } from '../registry/ComponentRegistry';

export class NodeFactory {
  static createNode(type: NodeType, parentId: string | null = null): BuilderNode {
    const config = ComponentRegistry.getConfig(type);
    if (!config) {
      throw new Error(`Unknown component type: ${type}. Did you forget to register it?`);
    }

    return {
      id: generateNodeId(),
      type,
      parentId,
      children: [],
      // Deep clone to avoid mutating the default registry config
      content: JSON.parse(JSON.stringify(config.defaultContent)),
      style: {
        desktop: JSON.parse(JSON.stringify(config.defaultStyle)),
        tablet: {},
        mobile: {}
      },
      settings: JSON.parse(JSON.stringify(config.defaultSettings))
    };
  }
}
