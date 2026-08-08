import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Sparkles, Layers, Palette, FormInput, Download,
  ArrowRight, CheckCircle2, Zap, MousePointer, Move, X,
  HelpCircle, Command, Eye, Laptop, ShieldCheck, FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface GuideStep {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badge: string;
  content: {
    heading: string;
    bullets: { title: string; desc: string; icon: any }[];
    proTip?: string;
  };
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'setup',
    title: '1. Quick Setup',
    subtitle: 'Org → Workspace → Project',
    icon: Zap,
    color: '#6366f1',
    badge: 'Step 1',
    content: {
      heading: 'Structure Your Digital Assets in Seconds',
      bullets: [
        {
          title: 'Organization',
          desc: 'Create an Organization to represent your agency, company, or personal studio.',
          icon: ShieldCheck,
        },
        {
          title: 'Workspace',
          desc: 'Separate your client work or personal side-projects into isolated workspace folders.',
          icon: Layers,
        },
        {
          title: 'Starter Presets',
          desc: 'Launch a project using pre-built templates for SaaS Landing, Creative Agency, E-Commerce, or Blank Canvas.',
          icon: Sparkles,
        },
      ],
      proTip: 'You can create unlimited projects inside any workspace and invite team members to collaborate.',
    },
  },
  {
    id: 'builder',
    title: '2. Canvas Builder',
    subtitle: 'Drag, Drop & Reorder',
    icon: Move,
    color: '#7c3aed',
    badge: 'Step 2',
    content: {
      heading: 'Visual-First No-Code Drag and Drop Engine',
      bullets: [
        {
          title: 'Ready Sections',
          desc: 'Open the left Sections panel and pick from 30+ pre-built sections (Hero, Features, Pricing, Testimonials, FAQ, Contact).',
          icon: Layers,
        },
        {
          title: 'Atomic Components',
          desc: 'Drag individual components (Headings, Buttons, Images, Videos, Tabs, Accordions, Forms) directly onto your canvas.',
          icon: MousePointer,
        },
        {
          title: 'Smooth Drag & Reorder',
          desc: 'Click and drag any element handle to reorder sections or move items seamlessly inside containers.',
          icon: Move,
        },
      ],
      proTip: 'Double-click any text heading, paragraph, or button to edit content directly on the canvas!',
    },
  },
  {
    id: 'styling',
    title: '3. Styling & Align',
    subtitle: 'Colors, Alignment & Fonts',
    icon: Palette,
    color: '#0284c7',
    badge: 'Step 3',
    content: {
      heading: 'Full Creative Control Over Styles & Layouts',
      bullets: [
        {
          title: 'Instant Alignment (⬅️ ↔️ ➡️)',
          desc: 'Select any element and click Left, Center, Right, or Stretch in the Property Panel to align horizontally instantly.',
          icon: Palette,
        },
        {
          title: 'Visual Property Panel',
          desc: 'Customize background colors, padding, borders, border-radius, font sizes, line heights, and shadow depth.',
          icon: FileText,
        },
        {
          title: 'Responsive Viewports',
          desc: 'Switch between Desktop, Tablet, and Mobile views at the top to refine styles per device breakpoint.',
          icon: Laptop,
        },
      ],
      proTip: 'Use global theme settings to toggle Light/Dark mode or change your primary accent color across the studio.',
    },
  },
  {
    id: 'forms',
    title: '4. Contact Forms',
    subtitle: 'Capture & Manage Leads',
    icon: FormInput,
    color: '#059669',
    badge: 'Step 4',
    content: {
      heading: 'Live Backend Form Capture Built Right In',
      bullets: [
        {
          title: 'Contact Form Component',
          desc: 'Add the Contact Form section to automatically embed a working form with Name, Email, Subject, and Message inputs.',
          icon: FormInput,
        },
        {
          title: 'Instant Feedback',
          desc: 'When site visitors fill out the form, they receive a live success confirmation banner.',
          icon: CheckCircle2,
        },
        {
          title: 'Project Form Inbox',
          desc: 'All form submissions automatically stream into your project’s Inbox page for review and CSV export.',
          icon: BookOpen,
        },
      ],
      proTip: 'Configure custom Webhook URLs in Settings to automatically forward submissions to Zapier, Make, or n8n.',
    },
  },
  {
    id: 'publish',
    title: '5. Export & Publish',
    subtitle: 'Static ZIP & Live Preview',
    icon: Download,
    color: '#e11d48',
    badge: 'Step 5',
    content: {
      heading: 'Ship Your Website to the World in One Click',
      bullets: [
        {
          title: 'Live Web Preview',
          desc: 'Click Preview to test your website live with full interactive buttons, tabs, accordions, and forms.',
          icon: Eye,
        },
        {
          title: 'Static ZIP Export',
          desc: 'Export a complete, clean, production-ready static HTML/CSS/JS ZIP file ready to host on Vercel, Netlify, or GitHub Pages.',
          icon: Download,
        },
        {
          title: 'Zero Lock-in',
          desc: 'Your generated code is self-contained with zero external runtime dependencies.',
          icon: Zap,
        },
      ],
      proTip: 'Use the Magic AI Assistant in the builder to rewrite headlines, polish text, or generate compelling CTAs before publishing!',
    },
  },
];

const KEYBOARD_SHORTCUTS = [
  { key: 'Double Click', action: 'Direct text inline editing on canvas' },
  { key: 'Drag Handle', action: 'Reorder sections & elements smoothly' },
  { key: 'Delete Key', action: 'Delete currently selected canvas element' },
  { key: 'Esc Key', action: 'Exit inline text editing or close property panels' },
  { key: 'Ctrl + S', action: 'Save current website project builder state' },
];

export function QuickGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [activeStepId, setActiveStepId] = useState<string>('setup');

  if (!isOpen) return null;

  const currentStep = GUIDE_STEPS.find((s) => s.id === activeStepId) || GUIDE_STEPS[0];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in-50">
      <div className="w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--muted)]/50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight">How to Use BuildStack</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Your complete, step-by-step interactive guide to building websites</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Step Navigation Sidebar */}
          <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--background)]/50 p-3 space-y-1 overflow-y-auto shrink-0 studio-scrollbar">
            {GUIDE_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStepId === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[var(--card)] border border-[var(--border)] shadow-sm'
                      : 'hover:bg-[var(--accent)] text-[var(--muted-foreground)]'
                  }`}
                  style={
                    isActive
                      ? { borderColor: 'var(--primary)', backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.08)' }
                      : undefined
                  }
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white font-semibold transition-transform"
                    style={{ backgroundColor: isActive ? 'var(--primary)' : step.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">{step.subtitle}</p>
                  </div>
                </button>
              );
            })}

            {/* Keyboard Shortcuts Section Trigger */}
            <div className="pt-4 border-t border-[var(--border)] mt-4 px-1">
              <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Command className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                Shortcuts Cheat Sheet
              </p>
              <div className="space-y-1.5">
                {KEYBOARD_SHORTCUTS.slice(0, 3).map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-[var(--card)] border border-[var(--border)]">
                    <span className="font-mono font-semibold text-[var(--primary)]">{s.key}</span>
                    <span className="text-[var(--muted-foreground)] text-[10px] truncate max-w-[120px]">{s.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          {/* Active Step Details Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 studio-scrollbar bg-[var(--card)]">
            
            {/* Step Banner */}
            <div className="flex items-start justify-between gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] relative overflow-hidden">
              <div className="space-y-1 relative z-10">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white"
                  style={{ backgroundColor: currentStep.color }}
                >
                  {currentStep.badge}
                </span>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">{currentStep.content.heading}</h3>
              </div>
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg relative z-10"
                style={{ backgroundColor: currentStep.color }}
              >
                <StepIcon className="h-7 w-7" />
              </div>
            </div>

            {/* Feature Bullets Grid */}
            <div className="grid gap-3">
              {currentStep.content.bullets.map((b, idx) => {
                const BIcon = b.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 hover:bg-[var(--accent)] transition-colors"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-white shadow-sm mt-0.5"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <BIcon className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--foreground)]">{b.title}</h4>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro Tip Callout */}
            {currentStep.content.proTip && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/25">
                <Sparkles className="h-5 w-5 shrink-0 mt-0.5 text-[var(--primary)]" />
                <div>
                  <p className="text-xs font-bold text-[var(--foreground)]">Pro Tip</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{currentStep.content.proTip}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4 bg-[var(--muted)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Step {GUIDE_STEPS.findIndex(s => s.id === activeStepId) + 1} of {GUIDE_STEPS.length}</span>
          </div>

          <div className="flex items-center gap-3">
            {GUIDE_STEPS.findIndex(s => s.id === activeStepId) < GUIDE_STEPS.length - 1 ? (
              <Button
                onClick={() => {
                  const idx = GUIDE_STEPS.findIndex(s => s.id === activeStepId);
                  setActiveStepId(GUIDE_STEPS[idx + 1].id);
                }}
                className="text-white gap-2 text-xs font-semibold cursor-pointer"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Next Step
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onClose();
                  navigate('/projects');
                }}
                className="text-white gap-2 text-xs font-semibold cursor-pointer"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Start Building Now 🚀
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
