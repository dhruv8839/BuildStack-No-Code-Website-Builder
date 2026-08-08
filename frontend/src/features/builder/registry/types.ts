import React from 'react';
import type { BuilderNode, NodeType } from '../types/builder';
export const _registry_types = true;

export type PropertyInputType = 'text' | 'number' | 'color' | 'select' | 'boolean' | 'image';

export interface PropertySchema {
  name: string;      // The property key (e.g., 'text', 'backgroundColor')
  label: string;     // The human-readable label
  type: PropertyInputType;
  options?: { label: string, value: string }[]; // For select types
  defaultValue?: any;
  /** If true, this property can have per-viewport overrides and shows inheritance UI in the Property Panel */
  responsive?: boolean;
}

export interface PropertyGroupSchema {
  id: 'content' | 'style' | 'settings';
  label: string;
  properties: PropertySchema[];
}

export interface ComponentConfig {
  type: NodeType;
  name: string;
  icon: React.ElementType; 
  isContainer?: boolean;
  
  // Default values when the node is created
  defaultContent: Record<string, any>;
  defaultStyle: Record<string, any>;
  defaultSettings: Record<string, any>;
  
  // Schemas drive the Property Panel dynamically
  propertySchemas: PropertyGroupSchema[];
  
  // Render function for the node
  render: (props: { node: BuilderNode; children?: React.ReactNode }) => React.ReactNode;
}
