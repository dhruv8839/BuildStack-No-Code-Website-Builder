import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'

export function BottomStatusBar() {
  const viewport = useSelector((state: RootState) => state.builder.viewport)
  const selectedNodeId = useSelector((state: RootState) => state.builder.selectedNodeId)
  const nodes = useSelector((state: RootState) => state.builder.nodes)
  const isDirty = useSelector((state: RootState) => state.builder.isDirty)

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null
  const totalNodes = Object.keys(nodes).length

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: 10,
        color: 'var(--studio-text-subtle)',
        fontFamily: 'inherit',
      }}
    >
      {/* Left: connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#34d399', flexShrink: 0 }} />
          BuildStack Studio
        </span>
        <span style={{ color: 'var(--studio-border)' }}>·</span>
        <span>{totalNodes > 1 ? `${totalNodes - 1} element${totalNodes !== 2 ? 's' : ''}` : 'Empty canvas'}</span>
        {isDirty && (
          <>
            <span style={{ color: 'var(--studio-border)' }}>·</span>
            <span style={{ color: '#f59e0b' }}>● Unsaved</span>
          </>
        )}
      </div>

      {/* Center: keyboard shortcut hints */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ opacity: 0.6 }}>Ctrl+D Duplicate</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ opacity: 0.6 }}>Del Remove</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ opacity: 0.6 }}>Ctrl+Z Undo</span>
      </div>

      {/* Right: viewport & selection info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {selectedNode && (
          <>
            <span style={{ color: '#818cf8' }}>
              {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} selected
            </span>
            <span style={{ color: 'var(--studio-border)' }}>·</span>
          </>
        )}
        <span style={{ textTransform: 'capitalize' }}>{viewport}</span>
      </div>
    </div>
  )
}
