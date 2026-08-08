import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../app/store';
import { exitFocusMode, setFocusContainer } from './focusSlice';
import { ChevronRight, X, Eye } from 'lucide-react';

export function FocusHeader() {
  const dispatch = useDispatch();
  const { focusedContainerId, breadcrumbStack } = useSelector((state: RootState) => state.focus);

  if (!focusedContainerId) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
      padding: '5px 14px',
      gap: 12,
    }}>
      {/* Left: Focus badge + breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
        {/* Focus badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          backgroundColor: 'rgba(99,102,241,0.2)',
          border: '1px solid rgba(99,102,241,0.35)',
          borderRadius: 5, padding: '2px 7px', flexShrink: 0,
        }}>
          <Eye size={10} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Focus
          </span>
        </div>

        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden' }}>
          <button
            onClick={() => dispatch(exitFocusMode())}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--studio-text-muted)', padding: '0 2px',
              fontFamily: 'inherit', transition: 'color 0.1s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--studio-text)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--studio-text-muted)' }}
          >
            Page Root
          </button>

          {breadcrumbStack.map((item, idx) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <ChevronRight size={11} style={{ color: 'var(--studio-text-subtle)', flexShrink: 0 }} />
              <button
                onClick={() => {
                  if (idx === breadcrumbStack.length - 1) return;
                  dispatch(setFocusContainer({
                    id: item.id,
                    name: item.name,
                    ancestors: breadcrumbStack.slice(0, idx)
                  }));
                }}
                style={{
                  background: 'none', border: 'none', padding: '0 2px',
                  fontFamily: 'inherit', cursor: idx === breadcrumbStack.length - 1 ? 'default' : 'pointer',
                  fontSize: 11,
                  fontWeight: idx === breadcrumbStack.length - 1 ? 600 : 400,
                  color: idx === breadcrumbStack.length - 1 ? '#c4b5fd' : 'var(--studio-text-muted)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100,
                }}
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Exit button */}
      <button
        onClick={() => dispatch(exitFocusMode())}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          height: 24, padding: '0 10px',
          borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          color: 'var(--studio-text-muted)', cursor: 'pointer',
          fontSize: 11, fontWeight: 500, fontFamily: 'inherit',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.08)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--studio-text)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--studio-text-muted)'
        }}
      >
        <X size={12} />
        Exit Focus
      </button>
    </div>
  );
}
