import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import {
  useGetPagesForProjectQuery,
  useCreatePageMutation,
  useDeletePageMutation,
} from '../../projects/pagesApiSlice'
import { Button } from '../../../components/ui/button'
import { Plus, Trash2, Home, File as FileIcon, Settings } from 'lucide-react'
import { PageSeoModal } from './PageSeoModal'
import type { PageResponse } from '../../../types/api'

interface PagesPanelProps {
  projectId: string
  activePageId: string | null
  onPageSelect: (pageId: string) => void
}

export function PagesPanel({ projectId, activePageId, onPageSelect }: PagesPanelProps) {
  const { data: pages, isLoading } = useGetPagesForProjectQuery(projectId)
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation()
  const [deletePage] = useDeletePageMutation()
  const isDirty = useSelector((state: RootState) => state.builder.isDirty)

  const [selectedSeoPage, setSelectedSeoPage] = useState<PageResponse | null>(null)

  const handleSelectPage = (targetPageId: string) => {
    if (targetPageId === activePageId) return
    if (isDirty) {
      const confirmSwitch = window.confirm('You have unsaved changes on this page. Switch to another page without saving?')
      if (!confirmSwitch) return
    }
    onPageSelect(targetPageId)
  }

  const handleCreatePage = async () => {
    const pageName = prompt('Enter page name:')
    if (!pageName) return
    
    const slug = pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    
    try {
      await createPage({
        projectId,
        name: pageName,
        slug,
        isHomePage: false,
      }).unwrap()
    } catch (err) {
      console.error('Failed to create page', err)
      alert('Failed to create page. Slug might already exist.')
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await deletePage({ pageId, projectId }).unwrap()
        if (activePageId === pageId) {
          onPageSelect('')
        }
      } catch (err) {
        console.error('Failed to delete page', err)
      }
    }
  }

  const handleSaveSeo = (_data: { title?: string; description?: string; slug?: string; ogImage?: string }) => {
    // Save SEO metadata logic (stored in local UI state or backend state)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--studio-text)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pages</p>
        <button
          onClick={handleCreatePage}
          disabled={isCreating}
          title="New page"
          style={{
            width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(99,102,241,0.3)',
            backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit', transition: 'all 0.15s ease',
          }}
        >
          <Plus size={13} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }} className="studio-scrollbar">
        {isLoading ? (
          <div style={{ padding: 16, fontSize: 11, color: 'var(--studio-text-muted)', textAlign: 'center' }}>Loading pages…</div>
        ) : pages?.length === 0 ? (
          <div style={{ padding: 24, fontSize: 11, color: 'var(--studio-text-muted)', textAlign: 'center' }}>No pages yet</div>
        ) : (
          pages?.map((page) => {
            const isActive = activePageId === page.id
            return (
              <div
                key={page.id}
                className="group"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderRadius: 7, padding: '7px 8px', cursor: 'pointer',
                  transition: 'all 0.15s ease', marginBottom: 2,
                  backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
                onClick={() => handleSelectPage(page.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', flex: 1 }}>
                  {page.isHomePage
                    ? <Home size={12} style={{ color: '#818cf8', flexShrink: 0 }} />
                    : <FileIcon size={12} style={{ color: isActive ? '#818cf8' : 'var(--studio-text-muted)', flexShrink: 0 }} />
                  }
                  <span style={{
                    fontSize: 12, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#c4b5fd' : 'var(--studio-text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {page.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, opacity: 0 }} className="group-hover:opacity-100" >
                  <button
                    style={{
                      width: 22, height: 22, borderRadius: 5, border: 'none',
                      backgroundColor: 'transparent', color: 'var(--studio-text-muted)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.1s ease',
                    }}
                    title="Page SEO & Settings"
                    onClick={(e) => { e.stopPropagation(); setSelectedSeoPage(page) }}
                  >
                    <Settings size={12} />
                  </button>

                  {!page.isHomePage && (
                    <button
                      style={{
                        width: 22, height: 22, borderRadius: 5, border: 'none',
                        backgroundColor: 'transparent', color: '#f87171',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      title="Delete page"
                      onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id) }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {selectedSeoPage && (
        <PageSeoModal
          page={selectedSeoPage}
          isOpen={!!selectedSeoPage}
          onClose={() => setSelectedSeoPage(null)}
          onSave={handleSaveSeo}
        />
      )}
    </div>
  )
}
