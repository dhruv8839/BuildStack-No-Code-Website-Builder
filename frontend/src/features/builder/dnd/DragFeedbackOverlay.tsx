import type { DropTarget } from '../engine/DropTargetResolver';

interface DragFeedbackOverlayProps {
  dropTarget: DropTarget | null;
}

export function DragFeedbackOverlay({ dropTarget }: DragFeedbackOverlayProps) {
  if (!dropTarget || !dropTarget.targetRect) return null;

  const { position, orientation, targetRect } = dropTarget;

  // Container Highlight Box — glowing ring with pulsing label
  if (position === 'inside') {
    return (
      <div
        className="fixed border-2 border-indigo-500 pointer-events-none z-50 rounded-lg transition-all duration-75"
        style={{
          top: `${targetRect.top}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          background: 'rgba(99,102,241,0.07)',
          boxShadow: '0 0 0 4px rgba(99,102,241,0.15), inset 0 0 20px rgba(99,102,241,0.05)',
        }}
      >
        <span
          className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider"
          style={{ boxShadow: '0 0 10px rgba(99,102,241,0.6)' }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse"
          />
          Drop Inside
        </span>
      </div>
    );
  }

  // Horizontal Glowing Insertion Line (Vertical Stacks)
  if (orientation === 'vertical') {
    const lineY = position === 'before' ? targetRect.top : targetRect.top + targetRect.height;

    return (
      <div
        className="fixed pointer-events-none z-50 transition-all duration-75"
        style={{
          top: `${lineY - 2}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: '4px',
        }}
      >
        <div
          className="bs-drop-line w-full h-full relative rounded-full"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #a855f7, #6366f1)',
          }}
        >
          {/* Left end pin */}
          <div
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg"
            style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }}
          />
          {/* Right end pin */}
          <div
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg"
            style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }}
          />
        </div>
      </div>
    );
  }

  // Vertical Glowing Insertion Line (Horizontal Flex Rows)
  const lineX = position === 'before' ? targetRect.left : targetRect.left + targetRect.width;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-75"
      style={{
        top: `${targetRect.top}px`,
        left: `${lineX - 2}px`,
        width: '4px',
        height: `${targetRect.height}px`,
      }}
    >
      <div
        className="bs-drop-line w-full h-full relative rounded-full"
        style={{
          background: 'linear-gradient(180deg, #6366f1, #a855f7, #6366f1)',
        }}
      >
        {/* Top end pin */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-lg"
          style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }}
        />
        {/* Bottom end pin */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-4 h-4 rounded-full border-2 border-white shadow-lg"
          style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }}
        />
      </div>
    </div>
  );
}
