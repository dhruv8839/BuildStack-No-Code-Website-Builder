import { Link } from 'react-router-dom'
import type { ProjectResponse } from '../../../types/api'
import { 
  Play, 
  Globe, 
  CheckCircle2, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Archive,
  Inbox
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../../app/store'
import { useSaveBuilderStateMutation } from '../../projects/pagesApiSlice'
import { setSaveStatus, clearDirty, setViewport, undo, redo } from '../state/builderSlice'
import { downloadZipFile } from '../utils/exportHtml'

interface TopToolbarProps {
  project: ProjectResponse
  activePageId: string | null
}

const vpButtons = [
  { key: 'desktop', icon: Monitor, label: 'Desktop' },
  { key: 'tablet',  icon: Tablet,  label: 'Tablet' },
  { key: 'mobile',  icon: Smartphone, label: 'Mobile' },
] as const

export function TopToolbar({ project, activePageId }: TopToolbarProps) {
  const dispatch = useDispatch()
  const { isDirty, saveStatus, version, schemaVersion, rootNodeId, nodes, viewport, past, future, theme } = useSelector((state: RootState) => state.builder)
  const [saveBuilderState] = useSaveBuilderStateMutation()

  const handleManualSave = async () => {
    if (!activePageId || !isDirty || saveStatus === 'saving') return;
    dispatch(setSaveStatus('saving'))
    try {
      const result = await saveBuilderState({
        pageId: activePageId,
        state: { version, schemaVersion, rootNodeId: rootNodeId!, nodes }
      }).unwrap()
      dispatch(clearDirty({ version: result.version }))
    } catch {
      dispatch(setSaveStatus('error'))
    }
  }

  const handlePublish = async () => {
    if (!activePageId) return;
    await handleManualSave();
    window.open(`/published/${activePageId}`, '_blank');
  };

  const handleExportZip = () => {
    if (!activePageId || !rootNodeId) return;
    const siteName = project.name.toLowerCase().replace(/\s+/g, '-');
    downloadZipFile(siteName, rootNodeId, nodes, theme);
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 7,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
    border: '1px solid transparent',
  }

  const iconBtn = (disabled?: boolean): React.CSSProperties => ({
    ...btnBase,
    width: 32,
    height: 32,
    backgroundColor: 'transparent',
    color: disabled ? 'var(--studio-text-subtle)' : 'var(--studio-text-muted)',
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  const outlineBtn: React.CSSProperties = {
    ...btnBase,
    height: 30,
    padding: '0 12px',
    fontSize: 12,
    fontWeight: 500,
    backgroundColor: 'var(--studio-bg)',
    color: 'var(--studio-text)',
    border: '1px solid var(--studio-border)',
  }

  return (
    <div 
      className="flex h-full items-center justify-between px-3"
      style={{ height: 48 }}
    >
      {/* ── Left: Logo & Back ── */}
      <div className="flex items-center gap-3" style={{ minWidth: 180 }}>
        <Link to={project?.workspaceId ? `/workspaces/${project.workspaceId}/projects` : '/projects'}>
          <button
            style={{
              ...iconBtn(),
              color: 'var(--studio-text-muted)',
            }}
            title="Back to projects"
          >
            <ChevronLeft size={16} />
          </button>
        </Link>
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center justify-center rounded-lg"
            style={{ 
              width: 26, height: 26,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>B</span>
          </div>
          <div>
            <p style={{ color: 'var(--studio-text)', fontSize: 13, fontWeight: 600, lineHeight: 1.2, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project?.name || 'Untitled Project'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Center: Tools ── */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center" style={{ padding: '0 4px' }}>
          <button
            style={iconBtn(past.length === 0)}
            disabled={past.length === 0}
            onClick={() => dispatch(undo())}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            style={iconBtn(future.length === 0)}
            disabled={future.length === 0}
            onClick={() => dispatch(redo())}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--studio-border)', margin: '0 4px' }} />

        {/* Viewport Switcher */}
        <div 
          className="flex items-center gap-0.5"
          style={{ 
            backgroundColor: 'var(--studio-bg)',
            borderRadius: 8,
            padding: 3,
            border: '1px solid var(--studio-border)',
          }}
        >
          {vpButtons.map(({ key, icon: Icon, label }) => {
            const isActive = viewport === key
            return (
              <button
                key={key}
                onClick={() => dispatch(setViewport(key))}
                title={label}
                style={{
                  ...btnBase,
                  width: 28,
                  height: 28,
                  backgroundColor: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: isActive ? '#818cf8' : 'var(--studio-text-muted)',
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
              >
                <Icon size={14} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right: Save Status + Actions ── */}
      <div className="flex items-center gap-2" style={{ minWidth: 180, justifyContent: 'flex-end' }}>
        {/* Save Status */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            borderRadius: 6,
            padding: '0 8px',
            height: 28,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: isDirty ? 'pointer' : 'default',
          }}
          onClick={handleManualSave}
          title={isDirty ? 'Click to save now' : 'All changes saved'}
        >
          {saveStatus === 'saving' ? (
            <Loader2 size={12} className="animate-spin" style={{ color: '#818cf8' }} />
          ) : saveStatus === 'error' ? (
            <AlertCircle size={12} style={{ color: '#f87171' }} />
          ) : isDirty ? (
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          ) : (
            <CheckCircle2 size={12} style={{ color: '#34d399' }} />
          )}
          <span style={{ 
            fontSize: 11, 
            color: saveStatus === 'error' ? '#f87171' : saveStatus === 'saving' ? '#818cf8' : isDirty ? '#f59e0b' : 'var(--studio-text-muted)' 
          }}>
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Failed' : isDirty ? 'Unsaved' : 'Saved'}
          </span>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--studio-border)' }} />

        {/* Preview */}
        <a href={`/projects/${project.id}/preview?pageId=${activePageId}`} target="_blank" rel="noopener noreferrer">
          <button
            style={{ ...outlineBtn, opacity: !activePageId ? 0.4 : 1, cursor: !activePageId ? 'not-allowed' : 'pointer' }}
            disabled={!activePageId}
          >
            <Play size={12} />
            Preview
          </button>
        </a>

        {/* Export ZIP */}
        <button
          style={{ ...outlineBtn, opacity: !activePageId ? 0.4 : 1, cursor: !activePageId ? 'not-allowed' : 'pointer' }}
          disabled={!activePageId}
          onClick={handleExportZip}
          title="Export complete ZIP package (HTML + CSS + JS)"
        >
          <Archive size={12} />
          Export
        </button>

        {/* Submissions Inbox */}
        <Link
          to={`/projects/${project.id}/form-submissions`}
          title="View form submissions inbox"
          style={{ textDecoration: 'none' }}
        >
          <button
            style={{ ...outlineBtn, position: 'relative' }}
          >
            <Inbox size={12} />
            Inbox
          </button>
        </Link>

        {/* Publish */}
        <button
          className="btn-publish"
          style={{
            ...btnBase,
            height: 30,
            padding: '0 14px',
            fontSize: 12,
            fontWeight: 600,
            opacity: !activePageId ? 0.5 : 1,
            cursor: !activePageId ? 'not-allowed' : 'pointer',
          }}
          disabled={!activePageId}
          onClick={handlePublish}
        >
          <Globe size={12} />
          Publish
        </button>
      </div>
    </div>
  )
}
