import { useMemo } from 'react';
import type { BuilderNode } from '../types/builder';
import type { Viewport } from '../state/builderSlice';

export interface ResolvedStyleResult {
  /** The fully merged CSS style object ready to pass to a DOM element */
  resolved: Record<string, any>;
  /**
   * Returns true if the given property is inherited from a larger breakpoint
   * (i.e., no local override exists for the current viewport).
   */
  isInherited: (property: string) => boolean;
  /**
   * Returns the inherited value for a property from the closest larger breakpoint.
   * Returns undefined if no inherited value exists.
   */
  getInheritedValue: (property: string) => any;
}

/**
 * Resolves the effective CSS style for a node at a given viewport,
 * applying the inheritance chain: desktop → tablet → mobile.
 *
 * This is the single source of truth for style resolution across
 * the renderer, property panel, and any future consumers.
 *
 * Memoized to avoid re-computation on unrelated renders.
 */
export function useResolvedStyle(node: BuilderNode | null | undefined, viewport: Viewport): ResolvedStyleResult {
  return useMemo(() => {
    const desktopStyle = node?.style?.desktop ?? {};
    const tabletStyle = node?.style?.tablet ?? {};
    const mobileStyle = node?.style?.mobile ?? {};

    let resolved: Record<string, any>;
    let localOverrides: Record<string, any>;

    switch (viewport) {
      case 'mobile':
        resolved = { ...desktopStyle, ...tabletStyle, ...mobileStyle };
        localOverrides = mobileStyle;
        break;
      case 'tablet':
        resolved = { ...desktopStyle, ...tabletStyle };
        localOverrides = tabletStyle;
        break;
      case 'desktop':
      default:
        resolved = { ...desktopStyle };
        localOverrides = desktopStyle;
        break;
    }

    const isInherited = (property: string): boolean => {
      if (viewport === 'desktop') return false;
      return !(property in localOverrides) && property in resolved;
    };

    const getInheritedValue = (property: string): any => {
      if (viewport === 'desktop') return undefined;
      if (property in localOverrides) return undefined;
      if (viewport === 'mobile') {
        if (property in tabletStyle) return tabletStyle[property];
        if (property in desktopStyle) return desktopStyle[property];
      }
      if (viewport === 'tablet') {
        if (property in desktopStyle) return desktopStyle[property];
      }
      return undefined;
    };

    // Helper: Expand 'align' property into CSS styles
    if (resolved.align) {
      const a = resolved.align;
      if (a === 'center') {
        if (!('alignSelf' in resolved)) resolved.alignSelf = 'center';
        if (!('marginLeft' in resolved)) resolved.marginLeft = 'auto';
        if (!('marginRight' in resolved)) resolved.marginRight = 'auto';
        if (!('textAlign' in resolved)) resolved.textAlign = 'center';
      } else if (a === 'right') {
        if (!('alignSelf' in resolved)) resolved.alignSelf = 'flex-end';
        if (!('marginLeft' in resolved)) resolved.marginLeft = 'auto';
        if (!('marginRight' in resolved)) resolved.marginRight = '0px';
        if (!('textAlign' in resolved)) resolved.textAlign = 'right';
      } else if (a === 'left') {
        if (!('alignSelf' in resolved)) resolved.alignSelf = 'flex-start';
        if (!('marginLeft' in resolved)) resolved.marginLeft = '0px';
        if (!('marginRight' in resolved)) resolved.marginRight = 'auto';
        if (!('textAlign' in resolved)) resolved.textAlign = 'left';
      } else if (a === 'stretch') {
        if (!('alignSelf' in resolved)) resolved.alignSelf = 'stretch';
        if (!('marginLeft' in resolved)) resolved.marginLeft = '0px';
        if (!('marginRight' in resolved)) resolved.marginRight = '0px';
        if (!('width' in resolved)) resolved.width = '100%';
      }
    }

    return { resolved, isInherited, getInheritedValue };
  }, [node?.style, viewport]);
}
