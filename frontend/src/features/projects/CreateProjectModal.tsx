import React, { useState, useEffect } from 'react';
import { useCreateProjectMutation } from './projectsApiSlice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Loader2, FolderPlus, X, LayoutTemplate, Sparkles, ShoppingBag, Briefcase, FileCode, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EnrichedWorkspace } from './hooks/useAllUserProjects';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: EnrichedWorkspace[];
  defaultWorkspaceId?: string;
  onSuccess?: (projectId: string) => void;
}

const TEMPLATE_PRESETS = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with a completely blank page',
    icon: FileCode,
    badge: 'Custom',
  },
  {
    id: 'saas',
    name: 'SaaS Product Landing',
    description: 'Navbar, Hero, Features, Testimonials, Pricing & Footer',
    icon: Sparkles,
    badge: 'Popular',
  },
  {
    id: 'agency',
    name: 'Agency & Portfolio',
    description: 'Hero, Portfolio Grid, Testimonials, Contact & Footer',
    icon: Briefcase,
    badge: 'Business',
  },
  {
    id: 'store',
    name: 'E-Commerce & Store',
    description: 'Hero Banner, Product Highlights, CTA & Footer',
    icon: ShoppingBag,
    badge: 'Store',
  },
];

export function CreateProjectModal({
  isOpen,
  onClose,
  workspaces,
  defaultWorkspaceId,
  onSuccess
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(defaultWorkspaceId || '');
  const [selectedTemplate, setSelectedTemplate] = useState('saas');
  const [createProject, { isLoading }] = useCreateProjectMutation();

  useEffect(() => {
    if (defaultWorkspaceId) {
      setSelectedWorkspaceId(defaultWorkspaceId);
    } else if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, defaultWorkspaceId, selectedWorkspaceId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    if (!selectedWorkspaceId) {
      toast.error('Please select a workspace');
      return;
    }

    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `project-${Date.now()}`;
      const result = await createProject({
        workspaceId: selectedWorkspaceId,
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
      }).unwrap();

      sessionStorage.setItem(`project_template_${result.id}`, selectedTemplate);
      toast.success(`Project "${name}" created with ${selectedTemplate.toUpperCase()} template!`);
      setName('');
      setDescription('');
      onClose();
      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.error || 'Failed to create project';
      toast.error(msg);
      console.error('Project creation failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in-50">
      <div className="w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col text-[var(--foreground)] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
                borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                color: 'var(--primary)',
              }}
            >
              <FolderPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--foreground)]">Create New Website Project</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Select a starter template or start from scratch</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 studio-scrollbar">
          {workspaces.length === 0 ? (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-200">No workspace available</p>
                <p className="mt-1 text-zinc-300 leading-relaxed">
                  You need an Organization and Workspace before creating a project.
                </p>
                <Link
                  to="/organizations"
                  onClick={onClose}
                  className="inline-block mt-2 px-3 py-1.5 rounded-md bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
                >
                  Create Organization & Workspace →
                </Link>
              </div>
            </div>
          ) : (
            /* Project Details */
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="projectName" className="text-xs font-medium text-[var(--foreground)]">
                  Project Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="projectName"
                  placeholder="e.g. Acme SaaS Website"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label htmlFor="workspaceSelect" className="text-xs font-medium text-[var(--foreground)]">
                  Workspace <span className="text-red-400">*</span>
                </Label>
                <select
                  id="workspaceSelect"
                  value={selectedWorkspaceId}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id} className="bg-[var(--card)] text-[var(--foreground)]">
                      {ws.name} ({ws.organizationName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Template Selection Grid */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5 text-[var(--foreground)]">
              <LayoutTemplate className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
              Choose Starter Site Template
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {TEMPLATE_PRESETS.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/40'
                        : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <Icon
                          className="h-4 w-4"
                          style={{ color: isSelected ? 'var(--primary)' : 'var(--muted-foreground)' }}
                        />
                        <span className="text-xs font-semibold text-[var(--foreground)]">{tpl.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)] font-medium">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] leading-snug">{tpl.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="projectDesc" className="text-xs font-medium text-[var(--foreground)]">
              Description <span className="text-[var(--muted-foreground)]">(Optional)</span>
            </Label>
            <Input
              id="projectDesc"
              placeholder="Short summary of this website..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[var(--border)]">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-white cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
              disabled={isLoading || workspaces.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating Project...
                </>
              ) : (
                'Create Website'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
