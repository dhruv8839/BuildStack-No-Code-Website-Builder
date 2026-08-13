import React from 'react'

import { useParams } from 'react-router-dom'
import { TopToolbar } from './components/TopToolbar'
import { FocusHeader } from './focus/FocusHeader'
import { LeftSidebar } from './components/LeftSidebar'
import { CanvasArea } from './components/CanvasArea'
import { PropertyPanel } from './panels/PropertyPanel'
import { BottomStatusBar } from './components/BottomStatusBar'
import { PagesPanel } from './panels/PagesPanel'
import { ComponentsPanel } from './sidebar/ComponentsPanel'
import { SectionsPanel } from './sections/SectionsPanel'
import { ThemePanel } from './panels/ThemePanel'
import { SeoPanel } from './panels/SeoPanel'
import { AssetsPanel } from './sidebar/AssetsPanel'
import { FloatingActionBar } from './components/FloatingActionBar'
import { AiCopyAssistant } from './components/AiCopyAssistant'
import type { PanelType } from './components/LeftSidebar'
import { useGetProjectQuery } from '../projects/projectsApiSlice'
import { useGetPagesForProjectQuery, useGetBuilderStateQuery, useSaveBuilderStateMutation } from '../projects/pagesApiSlice'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import { loadBuilderState, initializeCanvas, setSaveStatus, clearDirty } from './state/builderSlice'
import { BuilderDndContext } from './dnd/BuilderDndContext'
import { useUndoRedo } from './hooks/useUndoRedo'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

import { createStarterSiteTemplate } from './sections/SectionTemplates'

import { CommandPalette } from './components/CommandPalette'

export default function BuilderShell() {
  const { projectId } = useParams<{ projectId: string }>()
  
  const { data: project, isLoading: isProjectLoading, error: projectError } = useGetProjectQuery(projectId!)
  const { data: projectPages, isLoading: isPagesLoading } = useGetPagesForProjectQuery(projectId!, { skip: !projectId })
  const [createPage] = useCreatePageMutation()

  const [activePanel, setActivePanel] = React.useState<PanelType>('sections')
  const [activePageId, setActivePageId] = React.useState<string | null>(null)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false)

  // Auto-select home page / first page on initial project load, or create Home page if project has 0 pages
  React.useEffect(() => {
    if (!activePageId && !isPagesLoading && projectPages) {
      if (projectPages.length > 0) {
        const homePage = projectPages.find((p) => p.isHomePage) || projectPages[0];
        setActivePageId(homePage.id);
      } else if (projectId) {
        // Auto-create Home page for empty projects
        createPage({ projectId, name: 'Home', slug: 'index', isHomePage: true })
          .unwrap()
          .then((newPage) => setActivePageId(newPage.id))
          .catch((err) => console.error('Auto-create page failed', err));
      }
    }
  }, [projectPages, isPagesLoading, activePageId, projectId, createPage]);

  // Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const dispatch = useDispatch()
  const builderState = useSelector((state: RootState) => state.builder)
  
  // Initialize keyboard shortcuts globally for the builder
  useUndoRedo()
  useKeyboardShortcuts()
  
  // Fetch builder state when a page is selected
  const { data: pageBuilderState, isLoading: isStateLoading, isFetching } = useGetBuilderStateQuery(activePageId!, {
    skip: !activePageId,
  })
  
  const [saveBuilderState] = useSaveBuilderStateMutation()

  const loadedPageIdRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (activePageId && !isFetching && loadedPageIdRef.current !== activePageId) {
      if (pageBuilderState && pageBuilderState.nodes && Object.keys(pageBuilderState.nodes).length > 0) {
        dispatch(loadBuilderState(pageBuilderState))
      } else {
        const storedTemplate = sessionStorage.getItem(`project_template_${projectId}`) || 'saas'
        if (storedTemplate && storedTemplate !== 'blank') {
          const starterTree = createStarterSiteTemplate(storedTemplate)
          dispatch(loadBuilderState({
            version: 1,
            schemaVersion: 1,
            rootNodeId: starterTree.rootNodeId,
            nodes: starterTree.nodes,
          }))
          sessionStorage.removeItem(`project_template_${projectId}`)
        } else {
          dispatch(initializeCanvas())
        }
      }
      loadedPageIdRef.current = activePageId;
    }
  }, [activePageId, pageBuilderState, isFetching, dispatch, projectId])

  // Auto-Save Logic (Debounced)
  React.useEffect(() => {
    if (!activePageId || !builderState.isDirty || builderState.saveStatus === 'saving') return;

    const timer = setTimeout(async () => {
      dispatch(setSaveStatus('saving'))
      try {
        const result = await saveBuilderState({
          pageId: activePageId,
          state: {
            version: builderState.version,
            schemaVersion: builderState.schemaVersion,
            rootNodeId: builderState.rootNodeId!,
            nodes: builderState.nodes,
          }
        }).unwrap()
        
        dispatch(clearDirty({ version: result.version }))
      } catch (err: any) {
        console.error("Save Builder State Failed:", err);
        dispatch(setSaveStatus('error'))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [builderState.isDirty, activePageId, dispatch, saveBuilderState])

  // Warn before closing tab if there are unsaved edits
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (builderState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [builderState.isDirty]);

  if (isProjectLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ backgroundColor: 'var(--studio-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--studio-text-muted)' }} />
        </div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ backgroundColor: 'var(--studio-bg)', color: '#f87171' }}>
        Failed to load project workspace.
      </div>
    )
  }

  return (
    <div
      className="grid h-screen w-screen overflow-hidden"
      style={{
        gridTemplateRows: '48px 1fr 28px',
        gridTemplateColumns: '100%',
        backgroundColor: 'var(--studio-bg)',
        color: 'var(--studio-text)',
      }}
    >
      {/* Top Toolbar */}
      <div style={{ borderBottom: '1px solid var(--studio-border)', backgroundColor: 'var(--studio-panel)' }}>
        <TopToolbar project={project} activePageId={activePageId} />
        <FocusHeader />
      </div>
      
      <BuilderDndContext>
        {/* Middle Content Area */}
        <div
          className="grid h-full overflow-hidden"
          style={{ gridTemplateColumns: '52px 256px 1fr 288px' }}
        >
          {/* Left Icon Rail */}
          <div style={{ borderRight: '1px solid var(--studio-border)', backgroundColor: 'var(--studio-bg)' }}>
            <LeftSidebar activePanel={activePanel} onPanelSelect={setActivePanel as any} />
          </div>
          
          {/* Active Panel */}
          <div
            className="overflow-y-auto studio-scrollbar"
            style={{ borderRight: '1px solid var(--studio-border)', backgroundColor: 'var(--studio-panel)' }}
          >
            {activePanel === 'pages' ? (
              <PagesPanel 
                projectId={projectId!} 
                activePageId={activePageId} 
                onPageSelect={setActivePageId} 
              />
            ) : activePanel === 'sections' ? (
              <SectionsPanel />
            ) : activePanel === 'components' ? (
              <ComponentsPanel />
            ) : activePanel === 'theme' ? (
              <ThemePanel />
            ) : activePanel === 'assets' ? (
              <AssetsPanel />
            ) : activePanel === 'seo' ? (
              <SeoPanel />
            ) : (
              <div className="p-4 text-sm" style={{ color: 'var(--studio-text-muted)' }}>Placeholder for {activePanel}</div>
            )}
          </div>
          
          {/* Main Canvas Area */}
          <div className="relative overflow-hidden" style={{ backgroundColor: 'var(--studio-canvas-bg)' }}>
            {isPagesLoading || isStateLoading || (!activePageId && (!projectPages || projectPages.length === 0)) ? (
              <div className="flex h-full items-center justify-center flex-col gap-3">
                <Loader2 className="h-7 w-7 animate-spin" style={{ color: '#6366f1' }} />
                <p className="text-xs font-semibold" style={{ color: 'var(--studio-text-muted)' }}>Initializing Builder Canvas…</p>
              </div>
            ) : !activePageId ? (
              <div className="flex h-full items-center justify-center flex-col gap-4">
                <div
                  className="rounded-2xl flex items-center justify-center"
                  style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}
                >
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--studio-text)' }}>Select a page to start building</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--studio-text-muted)' }}>Choose a page from the Pages panel on the left</p>
                </div>
              </div>
            ) : (
              <>
                <CanvasArea />
                <FloatingActionBar />
                <AiCopyAssistant />
              </>
            )}
          </div>
          
          {/* Right Property Panel */}
          <div
            className="overflow-y-auto studio-scrollbar"
            style={{ borderLeft: '1px solid var(--studio-border)', backgroundColor: 'var(--studio-panel)' }}
          >
            <PropertyPanel />
          </div>
        </div>
      </BuilderDndContext>
      
      {/* Bottom Status Bar */}
      <div style={{ borderTop: '1px solid var(--studio-border)', backgroundColor: 'var(--studio-bg)' }}>
        <BottomStatusBar />
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  )
}
