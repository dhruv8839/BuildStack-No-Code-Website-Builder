import { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { addSection } from '../state/builderSlice';
import { SECTION_TEMPLATES } from '../sections/SectionTemplates';
import type { SectionTemplate } from '../sections/SectionTemplates';
import { Search, X } from 'lucide-react';

type CategoryId = 'all' | 'navigation' | 'hero' | 'content' | 'ecommerce' | 'blog' | 'contact' | 'footer';

const CATEGORY_TABS: { id: CategoryId; label: string; emoji: string }[] = [
  { id: 'all',        label: 'All',         emoji: '⚡' },
  { id: 'navigation', label: 'Nav',         emoji: '🧭' },
  { id: 'hero',       label: 'Hero',        emoji: '🚀' },
  { id: 'content',    label: 'Content',     emoji: '📦' },
  { id: 'ecommerce',  label: 'Shop',        emoji: '🛍️' },
  { id: 'blog',       label: 'Blog',        emoji: '📰' },
  { id: 'contact',    label: 'Contact',     emoji: '✉️' },
  { id: 'footer',     label: 'Footer',      emoji: '🦶' },
];

export function SectionsPanel() {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSection = (template: SectionTemplate) => {
    const { sectionRootId, nodes } = template.build();
    dispatch(addSection({ sectionRootId, nodes }));
  };

  const filteredTemplates = useMemo(() => {
    let list = SECTION_TEMPLATES;

    if (activeCategory !== 'all') {
      list = list.filter((t) => t.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--studio-text)', marginBottom: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Sections
        </p>
        <p style={{ fontSize: 10, color: 'var(--studio-text-muted)' }}>
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} — click to add
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={11} style={{ position: 'absolute', left: 9, color: 'var(--studio-text-subtle)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 28px 6px 26px',
              fontSize: 11,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 7,
              color: 'var(--studio-text)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--studio-text-subtle)', display: 'flex', alignItems: 'center' }}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs — scrollable horizontal strip */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '6px 10px',
          overflowX: 'auto',
          flexShrink: 0,
          borderBottom: '1px solid var(--studio-border)',
          scrollbarWidth: 'none',
        }}
        className="studio-scrollbar"
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 9px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                color: isActive ? '#818cf8' : 'var(--studio-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 11 }}>{tab.emoji}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Template List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }} className="studio-scrollbar">
        {filteredTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 32 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
            <p style={{ fontSize: 12, color: 'var(--studio-text-muted)', fontWeight: 600 }}>No sections found</p>
            <p style={{ fontSize: 10, color: 'var(--studio-text-subtle)', marginTop: 4 }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleAddSection(template)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 9,
                  border: '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'rgba(99,102,241,0.4)';
                  el.style.backgroundColor = 'rgba(99,102,241,0.08)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'rgba(255,255,255,0.06)';
                  el.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
              >
                {/* Thumbnail */}
                <span style={{
                  fontSize: 18,
                  lineHeight: 1,
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 7,
                  backgroundColor: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}>
                  {template.thumbnail}
                </span>

                {/* Info */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--studio-text)', margin: 0, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {template.name}
                  </p>
                  <p style={{ fontSize: 9.5, color: 'var(--studio-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {template.description}
                  </p>
                </div>

                {/* Add hint */}
                <span style={{ fontSize: 14, color: '#818cf8', flexShrink: 0, fontWeight: 700, lineHeight: 1 }}>+</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
