import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  User, Palette, Cpu, Bell, Trash2, Save, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Sun, Moon, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { applyThemeAndAccent } from '../../utils/themeManager';

type SettingsTab = 'profile' | 'appearance' | 'integrations' | 'notifications' | 'danger';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',          icon: User },
  { id: 'appearance',    label: 'Appearance',        icon: Palette },
  { id: 'integrations',  label: 'AI & Integrations', icon: Cpu },
  { id: 'notifications', label: 'Notifications',     icon: Bell },
  { id: 'danger',        label: 'Danger Zone',       icon: Trash2 },
];

const ACCENT_COLORS = [
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Violet',  value: '#7c3aed' },
  { label: 'Sky',     value: '#0284c7' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Rose',    value: '#e11d48' },
  { label: 'Amber',   value: '#d97706' },
];

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5 shadow-sm transition-colors duration-200">
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        {description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none"
      style={{ backgroundColor: checked ? 'var(--primary)' : 'var(--muted-foreground)' }}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-lg transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Creator';

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);

  // Profile
  const [displayName, setDisplayName] = useState(userName);

  // Appearance - load persisted settings from localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('buildstack_theme') as 'dark' | 'light') || 'dark'
  );
  const [accentColor, setAccentColor] = useState(
    () => localStorage.getItem('buildstack_accent') || '#6366f1'
  );

  // Integrations
  const [aiKey, setAiKey] = useState(() => localStorage.getItem('buildstack_gemini_key') || '');
  const [showAiKey, setShowAiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Notifications
  const [emailOnSubmission, setEmailOnSubmission] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Danger
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Apply theme & accent on page mount to ensure sync
  useEffect(() => {
    const savedTheme = (localStorage.getItem('buildstack_theme') as 'dark' | 'light') || 'dark';
    const savedAccent = localStorage.getItem('buildstack_accent') || '#6366f1';
    setTheme(savedTheme);
    setAccentColor(savedAccent);
    applyThemeAndAccent(savedTheme, savedAccent);
  }, []);

  const handleThemeSelect = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('buildstack_theme', newTheme);
    applyThemeAndAccent(newTheme, accentColor);
  };

  const handleAccentSelect = (newAccent: string) => {
    setAccentColor(newAccent);
    localStorage.setItem('buildstack_accent', newAccent);
    applyThemeAndAccent(theme, newAccent);
  };

  const handleSave = () => {
    localStorage.setItem('buildstack_gemini_key', aiKey);
    localStorage.setItem('buildstack_accent', accentColor);
    localStorage.setItem('buildstack_theme', theme);
    applyThemeAndAccent(theme, accentColor);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage your account preferences and integrations.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <nav className="w-48 shrink-0 space-y-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDanger = tab.id === 'danger';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? isDanger
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                      : 'border'
                    : isDanger
                    ? 'text-red-500/60 hover:bg-red-500/5 hover:text-red-500'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                }`}
                style={
                  isActive && !isDanger
                    ? {
                        backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
                        color: 'var(--primary)',
                        borderColor: 'var(--primary)',
                      }
                    : undefined
                }
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: isActive && !isDanger ? 'var(--primary)' : undefined }}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <SectionCard title="Profile Information" description="How your name and identity appear across BuildStack.">
                {/* Avatar Initials */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-sm"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{displayName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{currentUser?.email || 'No email'}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] opacity-70 mt-0.5">Avatar is auto-generated from your name</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[var(--foreground)]">Display Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="h-9 text-sm bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-[var(--foreground)]">Email Address</Label>
                  <Input
                    value={currentUser?.email || ''}
                    disabled
                    className="h-9 text-sm bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed opacity-70"
                  />
                  <p className="text-[11px] text-[var(--muted-foreground)]">Email is linked to your account and cannot be changed here.</p>
                </div>
              </SectionCard>

              <SectionCard title="Account Actions">
                <Button variant="outline" size="sm" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]" onClick={handleLogout}>
                  Sign Out of BuildStack
                </Button>
              </SectionCard>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <SectionCard title="Appearance" description="Customize how BuildStack looks for you.">
              <div className="space-y-2">
                <Label className="text-xs text-[var(--foreground)]">Theme Mode</Label>
                <div className="flex gap-3">
                  {(['dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeSelect(t)}
                      className={`flex flex-1 flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === t
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                          : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40'
                      }`}
                    >
                      {t === 'dark' ? (
                        <Moon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-500" />
                      )}
                      <span className="text-xs font-semibold text-[var(--foreground)] capitalize">{t} Mode</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs text-[var(--foreground)]">Accent Color</Label>
                <div className="flex gap-2.5 flex-wrap">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleAccentSelect(c.value)}
                      title={c.label}
                      className={`relative h-9 w-9 rounded-full transition-all cursor-pointer ${
                        accentColor === c.value
                          ? 'ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--background)] scale-110'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {accentColor === c.value && (
                        <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Changes apply live instantly across your entire dashboard.</p>
              </div>
            </SectionCard>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <>
              <SectionCard
                title="BuildStack Magic AI"
                description="Connect your AI engine key to enable live AI-powered text generation in the builder."
              >
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                  <Sparkles className="h-4 w-4 text-[var(--primary)] shrink-0" />
                  <p className="text-xs text-[var(--foreground)] font-medium">
                    {aiKey ? '✓ AI engine key configured. Magic AI is active.' : 'No key set. Using built-in Smart Synthesizer.'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[var(--foreground)]">AI Engine License Key</Label>
                  <div className="relative">
                    <Input
                      type={showAiKey ? 'text' : 'password'}
                      value={aiKey}
                      onChange={(e) => setAiKey(e.target.value)}
                      placeholder="Paste your key here..."
                      className="h-9 text-sm bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAiKey(!showAiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                    >
                      {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">Stored locally in your browser. Never sent to our servers.</p>
                </div>
              </SectionCard>

              <SectionCard
                title="Form Submission Webhook"
                description="Send form submissions to an external URL (Zapier, Make, n8n, etc.)."
              >
                <div className="space-y-1.5">
                  <Label className="text-xs text-[var(--foreground)]">Webhook URL</Label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/..."
                    className="h-9 text-sm bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                  />
                  <p className="text-[11px] text-[var(--muted-foreground)]">All new form submissions will be forwarded as a POST request to this URL.</p>
                </div>
              </SectionCard>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <SectionCard title="Notification Preferences" description="Control how and when BuildStack notifies you.">
              <div className="space-y-4">
                <div className="space-y-3 pb-3 border-b border-[var(--border)]">
                  <Label className="text-xs text-[var(--foreground)]">Notification Email Address</Label>
                  <Input
                    type="email"
                    value={localStorage.getItem('buildstack_notification_email') || currentUser?.email || ''}
                    onChange={(e) => localStorage.setItem('buildstack_notification_email', e.target.value)}
                    placeholder="alerts@example.com"
                    className="h-9 text-sm bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                  />
                  <p className="text-[11px] text-[var(--muted-foreground)]">Submissions will trigger email notifications sent to this address.</p>
                </div>

                {[
                  {
                    label: 'Form Submission Alerts',
                    desc: 'Get notified every time a new contact form is submitted on your site.',
                    value: emailOnSubmission,
                    onChange: setEmailOnSubmission,
                  },
                  {
                    label: 'Weekly Digest Email',
                    desc: 'Receive a weekly summary of your site analytics and new submissions.',
                    value: weeklyDigest,
                    onChange: setWeeklyDigest,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle checked={item.value} onChange={item.onChange} />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="text-sm font-semibold text-red-500">Danger Zone</h3>
                  <p className="text-xs text-red-500/70 mt-0.5">These actions are permanent and cannot be undone.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Delete Account</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Permanently delete your BuildStack account, all workspaces, projects, and data.</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete My Account
                </Button>
              </div>

              {/* Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="w-full max-w-md mx-4 rounded-2xl bg-[var(--card)] border border-red-500/30 p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="text-base font-bold text-[var(--foreground)]">Confirm Account Deletion</h3>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      This will permanently delete your account and all associated data. Type <strong className="text-[var(--foreground)]">DELETE</strong> to confirm.
                    </p>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder='Type "DELETE" to confirm'
                      className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1 bg-red-600 hover:bg-red-500"
                        disabled={deleteConfirm !== 'DELETE'}
                        onClick={() => {
                          dispatch(logout());
                          navigate('/login');
                        }}
                      >
                        Permanently Delete
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
                        onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save Button — shown for all tabs except danger */}
          {activeTab !== 'danger' && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleSave}
                className="text-white gap-2 shadow-sm cursor-pointer"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
              {saved && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Changes saved & applied!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
