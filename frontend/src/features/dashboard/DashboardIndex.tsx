import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { useGetMyOrganizationsQuery } from '../organizations/organizationsApiSlice';
import { useGetOrganizationWorkspacesQuery } from '../workspaces/workspacesApiSlice';
import { useGetProjectsForWorkspaceQuery } from '../projects/projectsApiSlice';
import { Button } from '../../components/ui/button';
import { 
  Building2, 
  Folder, 
  Globe, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ExternalLink,
  Loader2,
  Inbox
} from 'lucide-react';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import type { EnrichedProject, EnrichedWorkspace } from '../projects/hooks/useAllUserProjects';

// Sub-fetcher to collect projects per workspace
function DashboardWorkspaceFetcher({
  workspace,
  onCollectProjects,
  onCollectWorkspaces
}: {
  workspace: EnrichedWorkspace;
  onCollectProjects: (projects: EnrichedProject[]) => void;
  onCollectWorkspaces: (workspace: EnrichedWorkspace) => void;
}) {
  const { data: projects = [] } = useGetProjectsForWorkspaceQuery(workspace.id);

  useEffect(() => {
    onCollectWorkspaces(workspace);
  }, [workspace, onCollectWorkspaces]);

  useEffect(() => {
    const enriched: EnrichedProject[] = projects.map((p) => ({
      ...p,
      organizationId: workspace.organizationId,
      organizationName: workspace.organizationName,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
    }));
    onCollectProjects(enriched);
  }, [projects, workspace, onCollectProjects]);

  return null;
}

// Sub-fetcher to collect workspaces per organization
function DashboardOrgFetcher({
  organizationId,
  organizationName,
  onCollectProjects,
  onCollectWorkspaces
}: {
  organizationId: string;
  organizationName: string;
  onCollectProjects: (projects: EnrichedProject[]) => void;
  onCollectWorkspaces: (workspace: EnrichedWorkspace) => void;
}) {
  const { data: workspaces = [] } = useGetOrganizationWorkspacesQuery(organizationId);

  return (
    <>
      {workspaces.map((ws) => (
        <DashboardWorkspaceFetcher
          key={ws.id}
          workspace={{ ...ws, organizationId, organizationName }}
          onCollectProjects={onCollectProjects}
          onCollectWorkspaces={onCollectWorkspaces}
        />
      ))}
    </>
  );
}

export function DashboardIndex() {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allProjectsMap, setAllProjectsMap] = useState<Record<string, EnrichedProject[]>>({});
  const [allWorkspacesMap, setAllWorkspacesMap] = useState<Record<string, EnrichedWorkspace>>({});

  const { data: organizations = [], isLoading: isOrgsLoading } = useGetMyOrganizationsQuery();

  const handleCollectProjects = useCallback((wsProjects: EnrichedProject[]) => {
    if (wsProjects.length === 0) return;
    const wsId = wsProjects[0].workspaceId;
    setAllProjectsMap((prev) => {
      const existing = prev[wsId];
      if (existing && existing.length === wsProjects.length && existing.every((p, idx) => p.id === wsProjects[idx].id && p.updatedAt === wsProjects[idx].updatedAt)) {
        return prev;
      }
      return { ...prev, [wsId]: wsProjects };
    });
  }, []);

  const handleCollectWorkspaces = useCallback((ws: EnrichedWorkspace) => {
    setAllWorkspacesMap((prev) => {
      if (prev[ws.id]) return prev;
      return { ...prev, [ws.id]: ws };
    });
  }, []);

  const allProjects = useMemo(() => Object.values(allProjectsMap).flat(), [allProjectsMap]);
  const allWorkspaces = useMemo(() => Object.values(allWorkspacesMap), [allWorkspacesMap]);

  // Greeting time logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Creator';
  const recentProjects = useMemo(() => allProjects.slice(0, 6), [allProjects]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Background Fetchers */}
      {organizations.map((org) => (
        <DashboardOrgFetcher
          key={org.id}
          organizationId={org.id}
          organizationName={org.name}
          onCollectProjects={handleCollectProjects}
          onCollectWorkspaces={handleCollectWorkspaces}
        />
      ))}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl transition-colors duration-200">
        <div
          className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.1)',
                borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.25)',
                color: 'var(--primary)',
              }}
            >
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
              BuildStack Studio Engine Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
              {greeting}, <span style={{ color: 'var(--primary)' }}>{userName}</span>
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed">
              Design, customize, and publish industry-grade responsive websites with full backend form capture and static ZIP exports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="gap-2 text-white font-semibold shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Activity & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Globe className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--foreground)]">{allProjects.length}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Folder className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Workspaces</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--foreground)]">{allWorkspaces.length}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Organizations</span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--foreground)]">{organizations.length}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-1">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">AI Engine</span>
          </div>
          <p className="text-sm font-bold text-[var(--foreground)] truncate mt-1">
            {localStorage.getItem('buildstack_gemini_key') ? 'Custom Gemini Key' : 'Smart Synthesizer'}
          </p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          onClick={() => setIsModalOpen(true)}
          className="group cursor-pointer p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-200 shadow-sm flex items-center space-x-4"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border group-hover:scale-110 transition-transform"
            style={{
              backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
              borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
              color: 'var(--primary)',
            }}
          >
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Create New Project</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Pick SaaS, Agency or Store template</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/organizations')}
          className="group cursor-pointer p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-200 shadow-sm flex items-center space-x-4"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border group-hover:scale-110 transition-transform"
            style={{
              backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
              borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
              color: 'var(--primary)',
            }}
          >
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">Organizations</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Manage teams & workspaces</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/projects')}
          className="group cursor-pointer p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-200 shadow-sm flex items-center space-x-4 sm:col-span-2 lg:col-span-1"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border group-hover:scale-110 transition-transform"
            style={{
              backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
              borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
              color: 'var(--primary)',
            }}
          >
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">All Projects Catalog</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Browse all saved websites</p>
          </div>
        </div>
      </div>

      {/* Real Statistics Overview */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Workspace Analytics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Total Organizations</span>
              <Building2 className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="text-3xl font-extrabold text-[var(--foreground)]">{organizations.length}</div>
            <p className="text-[11px] text-[var(--muted-foreground)] opacity-80">Active user accounts & teams</p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Total Workspaces</span>
              <Folder className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="text-3xl font-extrabold text-[var(--foreground)]">{allWorkspaces.length}</div>
            <p className="text-[11px] text-[var(--muted-foreground)] opacity-80">Separated project folders</p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Total Projects</span>
              <Globe className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="text-3xl font-extrabold text-[var(--foreground)]">{allProjects.length}</div>
            <p className="text-[11px] text-[var(--muted-foreground)] opacity-80">Active built site canvases</p>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Website Projects</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Click open builder to edit canvas, assets, or form inbox</p>
          </div>
          <Link to="/projects" className="text-xs font-semibold hover:opacity-80 flex items-center gap-1.5 transition-colors" style={{ color: 'var(--primary)' }}>
            View All Projects ({allProjects.length})
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isOrgsLoading ? (
          <div className="flex h-40 items-center justify-center rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--primary)' }} />
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[var(--card)] border border-dashed border-[var(--border)] space-y-3">
            <div
              className="h-12 w-12 rounded-full border flex items-center justify-center mx-auto"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.1)',
                borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.25)',
                color: 'var(--primary)',
              }}
            >
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">No Projects Created Yet</h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
              Get started by creating your first website project with SaaS, Agency, or Store starter templates.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="text-white gap-1.5 text-xs font-semibold cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Website
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-200 flex flex-col shadow-md"
              >
                {/* Artboard Card Header */}
                <div className="h-36 bg-[var(--muted)] p-5 border-b border-[var(--border)] flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                      style={{
                        backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
                        color: 'var(--primary)',
                        borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Live Website
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                      {project.slug}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5 text-xs text-[var(--muted-foreground)]">
                    <p className="flex items-center justify-between">
                      <span className="opacity-75">Organization:</span>
                      <span className="font-medium text-[var(--foreground)]">{project.organizationName}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="opacity-75">Workspace:</span>
                      <span className="font-medium text-[var(--foreground)]">{project.workspaceName}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link to={`/projects/${project.id}/form-submissions`} title="View Form Submissions Inbox">
                        <Button variant="outline" size="xs" className="h-8 w-8 p-0 text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--accent)]">
                          <Inbox className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to={`/projects/${project.id}/builder`}>
                        <Button size="sm" className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                          Open Builder
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaces={allWorkspaces}
      />
    </div>
  );
}
