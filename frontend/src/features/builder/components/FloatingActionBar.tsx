import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { removeNode, duplicateNode, selectNode, moveNode } from '../state/builderSlice'
import { ComponentRegistry } from '../registry/ComponentRegistry'
import { ChevronUp, ChevronDown, Copy, Trash2, X } from 'lucide-react'

function getNodeBreadcrumbs(
  nodeId: string,
  nodes: Record<string, any>,
  rootNodeId: string | null
): string[] {
  const crumbs: string[] = []
  let current: string | undefined = nodeId
  while (current && current !== rootNodeId) {
    const node = nodes[current]
    if (!node) break
    const config = ComponentRegistry.getConfig(node.type)
    crumbs.unshift(config?.name ?? node.type)
    current = node.parentId
  }
  return crumbs
}

export function FloatingActionBar() {
  const dispatch = useDispatch()
  const selectedNodeId = useSelector((state: RootState) => state.builder.selectedNodeId)
  const nodes = useSelector((state: RootState) => state.builder.nodes)
  const rootNodeId = useSelector((state: RootState) => state.builder.rootNodeId)

  const [barPos, setBarPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const rafRef = useRef<number>(0)

  // Track the DOM element of the selected node and compute position
  const updatePosition = useCallback(() => {
    if (!selectedNodeId) {
      setBarPos(null)
      return
    }
    const el = document.querySelector(`[data-node-id="${selectedNodeId}"]`) as HTMLElement | null
    if (!el) {
      setBarPos(null)
      return
    }
    const rect = el.getBoundingClientRect()
    setBarPos({
      top: rect.top + window.scrollY - 40,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 260),
    })
  }, [selectedNodeId])

  useEffect(() => {
    if (!selectedNodeId) {
      setBarPos(null)
      return
    }

    const tick = () => {
      updatePosition()
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [selectedNodeId, updatePosition])

  if (!selectedNodeId || selectedNodeId === rootNodeId || !barPos) return null

  const node = nodes[selectedNodeId]
  if (!node) return null

  const breadcrumbs = getNodeBreadcrumbs(selectedNodeId, nodes, rootNodeId)
  const isRoot = selectedNodeId === rootNodeId

  // Move up/down in parent
  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!node.parentId) return
    const parent = nodes[node.parentId]
    if (!parent) return
    const idx = parent.children.indexOf(selectedNodeId)
    if (idx > 0) dispatch(moveNode({ nodeId: selectedNodeId, newParentId: node.parentId, newIndex: idx - 1 }))
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!node.parentId) return
    const parent = nodes[node.parentId]
    if (!parent) return
    const idx = parent.children.indexOf(selectedNodeId)
    if (idx < parent.children.length - 1) dispatch(moveNode({ nodeId: selectedNodeId, newParentId: node.parentId, newIndex: idx + 1 }))
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(duplicateNode(selectedNodeId))
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeNode(selectedNodeId))
  }

  const handleDeselect = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(selectNode(null))
  }

  const config = ComponentRegistry.getConfig(node.type)
  const nodeName = config?.name ?? node.type

  const parent = node.parentId ? nodes[node.parentId] : null
  const siblingIdx = parent ? parent.children.indexOf(selectedNodeId) : -1
  const canMoveUp = parent && siblingIdx > 0
  const canMoveDown = parent && siblingIdx < parent.children.length - 1

  const barStyle: React.CSSProperties = {
    position: 'fixed',
    top: Math.max(8, barPos.top),
    left: Math.max(8, barPos.left),
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    height: 34,
    borderRadius: 10,
    border: '1px solid rgba(99,102,241,0.3)',
    backgroundColor: '#1a1a2e',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    overflow: 'hidden',
    pointerEvents: 'all',
  }

  const btnStyle = (color?: string, disabled?: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 34,
    border: 'none',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
    color: disabled ? 'rgba(113,113,122,0.4)' : (color || '#a1a1aa'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.12s ease, color 0.12s ease',
    flexShrink: 0,
  })

  return createPortal(
    <div
      style={barStyle}
      className="float-bar-enter"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Node type chip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 10px',
        height: '100%',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        maxWidth: 200,
      }}>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
          {breadcrumbs.map((crumb, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && (
                <span style={{ color: '#3f3f46', fontSize: 10 }}>›</span>
              )}
              <span style={{
                fontSize: 11,
                fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                color: i === breadcrumbs.length - 1 ? '#818cf8' : '#52525b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 80,
              }}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Move up */}
      <button
        style={btnStyle(undefined, !canMoveUp)}
        onClick={handleMoveUp}
        disabled={!canMoveUp}
        title="Move up (Ctrl+↑)"
        onMouseEnter={(e) => { if (canMoveUp) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
      >
        <ChevronUp size={14} />
      </button>

      {/* Move down */}
      <button
        style={btnStyle(undefined, !canMoveDown)}
        onClick={handleMoveDown}
        disabled={!canMoveDown}
        title="Move down (Ctrl+↓)"
        onMouseEnter={(e) => { if (canMoveDown) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
      >
        <ChevronDown size={14} />
      </button>

      {/* Duplicate */}
      <button
        style={btnStyle('#a78bfa')}
        onClick={handleDuplicate}
        title="Duplicate (Ctrl+D)"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(167,139,250,0.1)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
      >
        <Copy size={13} />
      </button>

      {/* Delete */}
      <button
        style={btnStyle('#f87171')}
        onClick={handleDelete}
        title="Delete (Del)"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(248,113,113,0.1)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
      >
        <Trash2 size={13} />
      </button>

      {/* Deselect */}
      <button
        style={btnStyle('#71717a')}
        onClick={handleDeselect}
        title="Deselect (Esc)"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
      >
        <X size={12} />
      </button>
    </div>,
    document.body
  )
}
