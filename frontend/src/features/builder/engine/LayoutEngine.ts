import type { BuilderNode } from '../types/builder';

export type LayoutStrategyType = 'vertical' | 'horizontal' | 'grid' | 'absolute';

export interface LayoutStrategy {
  type: LayoutStrategyType;
  calculatePlacement(
    activeRect: { top: number; left: number; width: number; height: number },
    overRect: { top: number; left: number; width: number; height: number }
  ): { placeAfter: boolean; relativeRatio: number };
}

export class VerticalLayoutStrategy implements LayoutStrategy {
  type: LayoutStrategyType = 'vertical';

  calculatePlacement(
    activeRect: { top: number; left: number; width: number; height: number },
    overRect: { top: number; left: number; width: number; height: number }
  ) {
    const activeCenterY = activeRect.top + activeRect.height / 2;
    const overCenterY = overRect.top + overRect.height / 2;
    const relativeRatio = (activeCenterY - overRect.top) / Math.max(overRect.height, 1);

    return {
      placeAfter: activeCenterY > overCenterY,
      relativeRatio
    };
  }
}

export class HorizontalLayoutStrategy implements LayoutStrategy {
  type: LayoutStrategyType = 'horizontal';

  calculatePlacement(
    activeRect: { top: number; left: number; width: number; height: number },
    overRect: { top: number; left: number; width: number; height: number }
  ) {
    const activeCenterX = activeRect.left + activeRect.width / 2;
    const overCenterX = overRect.left + overRect.width / 2;
    const relativeRatio = (activeCenterX - overRect.left) / Math.max(overRect.width, 1);

    return {
      placeAfter: activeCenterX > overCenterX,
      relativeRatio
    };
  }
}

export class LayoutEngine {
  private static verticalStrategy = new VerticalLayoutStrategy();
  private static horizontalStrategy = new HorizontalLayoutStrategy();

  static getStrategy(containerNode: BuilderNode | undefined, viewport: string = 'desktop'): LayoutStrategy {
    if (!containerNode) return this.verticalStrategy;

    const style = (containerNode.style as any)?.[viewport] || (containerNode.style as any)?.desktop || {};
    if (style.flexDirection === 'row') {
      return this.horizontalStrategy;
    }
    return this.verticalStrategy;
  }
}
