import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ZoomIn, ZoomOut, Monitor, Tablet, Smartphone } from 'lucide-react'
import { selectNode } from '../state/builderSlice'
import type { RootState } from '../../../app/store'
import { RendererNode } from '../renderer/RendererNode'
import type { Viewport } from '../state/builderSlice'

const ZOOM_LEVELS = [50, 75, 100, 125, 150]

const VIEWPORT_DEFAULTS: Record<Viewport, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 390,
}

const VIEWPORT_META: Record<Viewport, { label: string; Icon: any }> = {
  desktop: { label: 'Desktop', Icon: Monitor },
  tablet:  { label: 'Tablet',  Icon: Tablet },
  mobile:  { label: 'Mobile',  Icon: Smartphone },
}

const CANVAS_MIN_WIDTH = 320
const CANVAS_MAX_WIDTH = 1600

export function CanvasArea() {
  const [zoomIndex, setZoomIndex] = useState(2) // 100%
  const dispatch = useDispatch()
  const rootNodeId = useSelector((state: RootState) => state.builder.rootNodeId)
  const viewport = useSelector((state: RootState) => state.builder.viewport)
  const theme = useSelector((state: RootState) => state.builder.theme)

  // Canvas width (overrideable by drag)
  const [canvasWidth, setCanvasWidth] = useState<number>(VIEWPORT_DEFAULTS[viewport])
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Reset canvas width when viewport changes
  useEffect(() => {
    setCanvasWidth(VIEWPORT_DEFAULTS[viewport])
  }, [viewport])

  // Dynamically load Google Font
  useEffect(() => {
    if (!theme?.fontFamily) return;
    const fontName = theme.fontFamily;
    const fontId = `gfont-${fontName.replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`;
      document.head.appendChild(link);
    }
  }, [theme?.fontFamily]);

  const handleDeselect = useCallback(() => { dispatch(selectNode(null)) }, [dispatch])

  // Drag resize handlers
  const startDrag = useCallback((side: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragStartX.current = e.clientX
    dragStartWidth.current = canvasWidth
    if (side === 'left') setIsDraggingLeft(true)
    else setIsDraggingRight(true)
  }, [canvasWidth])

  useEffect(() => {
    if (!isDraggingLeft && !isDraggingRight) return

    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current
      const widthDelta = isDraggingLeft ? -delta * 2 : delta * 2
      const newWidth = Math.min(CANVAS_MAX_WIDTH, Math.max(CANVAS_MIN_WIDTH, dragStartWidth.current + widthDelta))
      setCanvasWidth(newWidth)
    }

    const onUp = () => {
      setIsDraggingLeft(false)
      setIsDraggingRight(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDraggingLeft, isDraggingRight])

  const vpMeta = VIEWPORT_META[viewport]
  const VpIcon = vpMeta.Icon
  const focusedContainerId = useSelector((state: RootState) => state.focus.focusedContainerId)
  const activeRootId = focusedContainerId || rootNodeId
  const zoomFactor = ZOOM_LEVELS[zoomIndex] / 100

  const toolbarBtnStyle = (active?: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    width: active !== undefined ? 28 : undefined,
    height: 28,
    padding: active !== undefined ? undefined : '0 10px',
    borderRadius: 6,
    border: '1px solid var(--studio-border)',
    backgroundColor: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
    color: active ? '#818cf8' : 'var(--studio-text-muted)',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  })

  return (
    <div
      className="absolute inset-0 flex flex-col"
      onClick={handleDeselect}
      style={{ userSelect: isDraggingLeft || isDraggingRight ? 'none' : undefined }}
    >
      {/* Canvas toolbar */}
      <div
        className="flex h-10 items-center justify-between px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--studio-border)', backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: zoom controls */}
        <div className="flex items-center gap-1">
          <button
            style={toolbarBtnStyle()}
            onClick={() => setZoomIndex(Math.max(0, zoomIndex - 1))}
            disabled={zoomIndex === 0}
          >
            <ZoomOut size={13} />
          </button>
          <button
            style={{ ...toolbarBtnStyle(), width: 52, cursor: 'pointer' }}
            onClick={() => setZoomIndex(2)}
            title="Reset to 100%"
          >
            {ZOOM_LEVELS[zoomIndex]}%
          </button>
          <button
            style={toolbarBtnStyle()}
            onClick={() => setZoomIndex(Math.min(ZOOM_LEVELS.length - 1, zoomIndex + 1))}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Center: viewport + width readout */}
        <div className="flex items-center gap-2">
          <VpIcon size={12} style={{ color: 'var(--studio-text-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--studio-text-muted)', fontWeight: 500 }}>
            {vpMeta.label}
          </span>
          <span style={{ fontSize: 11, color: 'var(--studio-text-subtle)', fontFamily: 'monospace' }}>
            {Math.round(canvasWidth)}px
          </span>
          {(isDraggingLeft || isDraggingRight) && (
            <span style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 4, padding: '1px 6px' }}>
              DRAGGING
            </span>
          )}
        </div>

        {/* Right: reset */}
        <button
          style={toolbarBtnStyle()}
          onClick={() => setCanvasWidth(VIEWPORT_DEFAULTS[viewport])}
          title="Reset canvas width"
        >
          Reset
        </button>
      </div>

      {/* Main artboard area with dot grid */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden canvas-dot-grid flex justify-center"
        style={{ padding: '32px 16px' }}
        onClick={handleDeselect}
      >
        <div 
          className="flex items-start justify-center min-h-full max-w-full"
        >
          {/* Left resize handle */}
          <div
            className={`canvas-resize-handle flex-shrink-0 self-stretch ${isDraggingLeft ? 'dragging' : ''}`}
            style={{ minHeight: 400 }}
            onMouseDown={(e) => startDrag('left', e)}
            title="Drag to resize canvas"
          />

          {/* The white canvas */}
          <div
            ref={canvasRef}
            className="relative bg-white rounded-lg overflow-hidden flex-shrink-0"
            style={{
              width: canvasWidth,
              minHeight: 800,
              transform: `scale(${zoomFactor})`,
              transformOrigin: 'top center',
              transition: isDraggingLeft || isDraggingRight ? 'none' : 'transform 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.4), 0 20px 60px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {activeRootId
              ? <RendererNode nodeId={activeRootId} />
              : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', textAlign: 'center', padding: '80px 40px',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 13, marginBottom: 16,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>✦</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                    Canvas is ready
                  </p>
                  <p style={{ fontSize: 12, color: '#52525b', lineHeight: 1.7, maxWidth: 200 }}>
                    Add a section from the <strong style={{ color: '#6366f1' }}>Sections</strong> panel on the left to get started
                  </p>
                </div>
              )
            }
          </div>

          {/* Right resize handle */}
          <div
            className={`canvas-resize-handle flex-shrink-0 self-stretch ${isDraggingRight ? 'dragging' : ''}`}
            style={{ minHeight: 400 }}
            onMouseDown={(e) => startDrag('right', e)}
            title="Drag to resize canvas"
          />
        </div>
      </div>
    </div>
  )
}
