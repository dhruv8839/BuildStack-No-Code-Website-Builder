import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { useResolvedStyle } from '../hooks/useResolvedStyle';

interface PreviewNodeProps {
  nodeId: string;
}

export const PreviewNode = memo(({ nodeId }: PreviewNodeProps) => {
  const node = useSelector((state: RootState) => state.builder.nodes[nodeId]);
  const viewport = useSelector((state: RootState) => state.builder.viewport);

  // Use centralized style resolution hook (memoized)
  const { resolved: resolvedStyle } = useResolvedStyle(
    node ?? { style: { desktop: {}, tablet: {}, mobile: {} } } as any,
    viewport
  );

  if (!node) return null;

  const config = ComponentRegistry.getConfig(node.type);
  if (!config) return null;

  const childrenNodes = node.children.map((childId) => (
    <PreviewNode key={childId} nodeId={childId} />
  ));

  const resolvedNode = { ...node, style: resolvedStyle };

  let renderedContent = config.render({ node: resolvedNode as any, children: childrenNodes });

  if (React.isValidElement(renderedContent)) {
    const existingProps = (renderedContent as React.ReactElement<any>).props;
    const existingClassName = existingProps.className || '';
    
    // We only preserve the original styling and class names, stripping all builder interactions
    renderedContent = React.cloneElement(renderedContent as React.ReactElement<any>, {
      style: { ...(existingProps.style || {}) },
      className: existingClassName.trim(),
    });
  }

  return renderedContent as React.ReactElement;
});

PreviewNode.displayName = 'PreviewNode';
