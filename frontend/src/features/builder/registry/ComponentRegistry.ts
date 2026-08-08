import type { ComponentConfig } from './types';
import type { NodeType } from '../types/builder';

class Registry {
  private components: Map<NodeType, ComponentConfig> = new Map();

  register(config: ComponentConfig) {
    this.components.set(config.type, config);
  }

  getConfig(type: NodeType): ComponentConfig | undefined {
    return this.components.get(type);
  }

  getAllConfigs(): ComponentConfig[] {
    return Array.from(this.components.values());
  }
}

export const ComponentRegistry = new Registry();
