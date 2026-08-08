

interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number; // Y pixel for horizontal, X pixel for vertical
}

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
}

export function AlignmentGuides({ guides }: AlignmentGuidesProps) {
  if (!guides || guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {guides.map((guide, idx) => {
        if (guide.type === 'horizontal') {
          return (
            <div
              key={`h-${idx}`}
              className="absolute left-0 right-0 border-b-2 border-dashed border-indigo-500 shadow-sm"
              style={{ top: `${guide.position}px` }}
            >
              <span className="absolute left-2 -top-2.5 text-[9px] font-mono bg-indigo-600 text-white px-1 rounded">
                Y: {Math.round(guide.position)}px
              </span>
            </div>
          );
        } else {
          return (
            <div
              key={`v-${idx}`}
              className="absolute top-0 bottom-0 border-r-2 border-dashed border-indigo-500 shadow-sm"
              style={{ left: `${guide.position}px` }}
            >
              <span className="absolute top-2 -left-2 text-[9px] font-mono bg-indigo-600 text-white px-1 rounded">
                X: {Math.round(guide.position)}px
              </span>
            </div>
          );
        }
      })}
    </div>
  );
}
