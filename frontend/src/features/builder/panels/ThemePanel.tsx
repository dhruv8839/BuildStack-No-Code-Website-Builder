import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../app/store';
import { updateTheme, applyGlobalPalette, updateNodeProperty } from '../state/builderSlice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Palette, Type, Paintbrush, Sparkles } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Inter',               label: 'Inter — Modern Sans' },
  { value: 'Outfit',              label: 'Outfit — Geometric Studio' },
  { value: 'Plus Jakarta Sans',   label: 'Plus Jakarta Sans — Clean' },
  { value: 'Poppins',             label: 'Poppins — Friendly' },
  { value: 'Space Grotesk',       label: 'Space Grotesk — Tech' },
  { value: 'Roboto',              label: 'Roboto — Standard' },
];

const PRESET_PALETTES = [
  { id: 'midnight-indigo', name: 'Midnight Indigo', primary: '#6366f1', secondary: '#818cf8', accent: '#38bdf8', bg: '#09090b', card: '#111113', text: '#f4f4f5' },
  { id: 'emerald-mint',    name: 'Emerald Mint',    primary: '#10b981', secondary: '#34d399', accent: '#06b6d4', bg: '#022c22', card: '#064e3b', text: '#ecfdf5' },
  { id: 'sunset-amber',    name: 'Sunset Amber',    primary: '#f59e0b', secondary: '#fbbf24', accent: '#f97316', bg: '#1c1917', card: '#292524', text: '#fef3c7' },
  { id: 'cyber-neon',       name: 'Cyber Neon',       primary: '#ec4899', secondary: '#f472b6', accent: '#06b6d4', bg: '#0f172a', card: '#1e293b', text: '#f8fafc' },
  { id: 'electric-violet', name: 'Electric Violet', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c084fc', bg: '#09090b', card: '#120e24', text: '#f5f3ff' },
  { id: 'rose-gold',       name: 'Rose Gold',       primary: '#e11d48', secondary: '#fb7185', accent: '#f43f5e', bg: '#18181b', card: '#27272a', text: '#fff1f2' },
  { id: 'slate-minimal',   name: 'Slate Minimal',   primary: '#0f172a', secondary: '#334155', accent: '#64748b', bg: '#ffffff', card: '#f8fafc', text: '#0f172a' },
  { id: 'dark-obsidian',   name: 'Dark Obsidian',   primary: '#3b82f6', secondary: '#60a5fa', accent: '#38bdf8', bg: '#000000', card: '#0a0a0a', text: '#ffffff' },
];

const COLOR_FIELDS = [
  { key: 'primaryColor',    label: 'Primary Accent',    default: '#6366f1' },
  { key: 'secondaryColor',  label: 'Secondary Accent',  default: '#818cf8' },
  { key: 'accentColor',     label: 'Highlight Color',   default: '#38bdf8' },
  { key: 'backgroundColor', label: 'Canvas Background', default: '#09090b' },
  { key: 'textColor',       label: 'Base Text Color',   default: '#f4f4f5' },
];

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <Icon size={12} style={{ color: '#818cf8' }} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--studio-text-subtle)' }}>
        {label}
      </span>
    </div>
  );
}

export function ThemePanel() {
  const rootNodeId = useSelector((state: RootState) => state.builder.rootNodeId);
  const theme = useSelector((state: RootState) => state.builder.theme) || {
    paletteId: 'midnight-indigo',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    accentColor: '#38bdf8',
    backgroundColor: '#09090b',
    textColor: '#f4f4f5',
    cardColor: '#111113',
    borderColor: 'rgba(255,255,255,0.08)',
    fontFamily: 'Inter',
  };
  const dispatch = useDispatch();

  const handleThemeChange = (key: string, value: string) => {
    dispatch(updateTheme({ [key]: value }));
    if (key === 'backgroundColor' && rootNodeId) {
      dispatch(updateNodeProperty({ id: rootNodeId, section: 'style', property: 'backgroundColor', value }));
    }
  };

  const applyPreset = (preset: typeof PRESET_PALETTES[0]) => {
    dispatch(applyGlobalPalette({
      paletteId: preset.id,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      backgroundColor: preset.bg,
      textColor: preset.text,
      cardColor: preset.card,
      borderColor: 'rgba(255,255,255,0.08)',
      fontFamily: theme.fontFamily || 'Inter',
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Palette size={14} style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--studio-text)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Global Theme Studio
            </p>
            <p style={{ fontSize: 10, color: 'var(--studio-text-muted)' }}>
              1-Click site-wide re-theming
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }} className="studio-scrollbar">

        {/* ── 1-Click Studio Palettes ────────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel icon={Paintbrush} label="1-Click Color Palettes" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PRESET_PALETTES.map((p) => {
              const isActive = theme.paletteId === p.id || (theme.primaryColor === p.primary && theme.backgroundColor === p.bg);
              return (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '10px 10px',
                    borderRadius: 8,
                    border: isActive ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, width: '100%' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#818cf8' : 'white' }}>
                      {p.name}
                    </span>
                    {isActive && <Sparkles size={11} style={{ color: '#818cf8' }} />}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[p.primary, p.secondary, p.accent, p.bg].map((color, i) => (
                      <span
                        key={i}
                        style={{
                          width: 14, height: 14,
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: '1px solid rgba(255,255,255,0.2)',
                          flexShrink: 0,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                        }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="studio-separator" />

        {/* ── Typography & Google Fonts ─────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <SectionLabel icon={Type} label="Typography & Fonts" />
          <div>
            <p style={{ fontSize: 11, color: 'var(--studio-text-muted)', marginBottom: 6 }}>Primary Font</p>
            <Select
              value={theme.fontFamily || 'Inter'}
              onValueChange={(val) => val && handleThemeChange('fontFamily', val)}
            >
              <SelectTrigger
                className="h-9 text-xs"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--studio-border)',
                  color: 'var(--studio-text)',
                }}
              >
                <SelectValue placeholder="Select Font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Font Preview Card */}
            <div style={{
              marginTop: 10, padding: '10px 12px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}>
              <p style={{
                fontFamily: `'${theme.fontFamily || 'Inter'}', sans-serif`,
                fontSize: 16,
                fontWeight: 700,
                color: 'white',
                margin: '0 0 2px 0',
              }}>
                Aa Bb Cc 123
              </p>
              <p style={{
                fontFamily: `'${theme.fontFamily || 'Inter'}', sans-serif`,
                fontSize: 11,
                color: '#94a3b8',
                margin: 0,
              }}>
                {theme.fontFamily || 'Inter'} — Custom Google Font Preview
              </p>
            </div>
          </div>
        </div>

        <div className="studio-separator" />

        {/* ── Custom Swatch Customizer ────────────────────────────── */}
        <div>
          <SectionLabel icon={Palette} label="Custom Color Swatches" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COLOR_FIELDS.map(({ key, label, default: def }) => {
              const currentValue = (theme as any)[key] || def;
              return (
                <div key={key}>
                  <p style={{ fontSize: 11, color: 'var(--studio-text-muted)', marginBottom: 6 }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                      <input
                        type="color"
                        value={currentValue.startsWith('#') ? currentValue : '#6366f1'}
                        onChange={(e) => handleThemeChange(key, e.target.value)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                      />
                      <div style={{
                        width: 32, height: 32, borderRadius: 7,
                        backgroundColor: currentValue,
                        border: '2px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                        boxShadow: `0 2px 8px ${currentValue}55`,
                        flexShrink: 0,
                      }} />
                    </label>
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleThemeChange(key, e.target.value)}
                      style={{
                        flex: 1,
                        height: 32, padding: '0 10px',
                        borderRadius: 7, border: '1px solid var(--studio-border)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: 'var(--studio-text)',
                        fontSize: 11, fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
