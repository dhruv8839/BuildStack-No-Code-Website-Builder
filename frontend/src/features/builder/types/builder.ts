export const _builder_types = true;
export type NodeType = 'heading' | 'paragraph' | 'button' | 'image' | 'container' | 'spacer' | 'root' | 'video' | 'icon' | 'divider' | 'form' | 'accordion' | 'tabs';

export interface ResponsiveStyle {
  desktop: Record<string, any>;
  tablet: Record<string, any>;
  mobile: Record<string, any>;
}

export interface BuilderNode {
  id: string;
  type: NodeType;
  parentId: string | null;
  children: string[];
  content: Record<string, any>;
  style: ResponsiveStyle;
  settings: Record<string, any>;
}
