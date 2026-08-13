import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { ComponentRegistry } from '../registry';
import { SECTION_TEMPLATES } from '../sections/SectionTemplates';
import { NodeFactory } from '../utils/nodeFactory';
import { addNode, addSection } from '../state/builderSlice';
import { Search, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset query on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const components = useMemo(() => {
    return ComponentRegistry.getAllConfigs()
      .filter((c) => c.type !== 'root')
      .map((c) => ({
        kind: 'element' as const,
        id: `element-${c.type}`,
        title: c.name,
        subtitle: `Add ${c.name} element`,
        icon: c.icon,
        type: c.type,
      }));
  }, []);

  const sections = useMemo(() => {
    return SECTION_TEMPLATES.map((t) => ({
      kind: 'section' as const,
      id: `section-${t.id}`,
      title: t.name,
      subtitle: t.description,
      thumbnail: t.thumbnail,
      template: t,
    }));
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [...components, ...sections].slice(0, 12);

    const matchedComponents = components.filter((c) => c.title.toLowerCase().includes(q));
    const matchedSections = sections.filter((s) => s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q));

    return [...matchedComponents, ...matchedSections].slice(0, 15);
  }, [query, components, sections]);

  const handleSelect = (item: (typeof filteredItems)[0]) => {
    if (item.kind === 'element') {
      try {
        const node = NodeFactory.createNode(item.type as any);
        dispatch(addNode({ node }));
      } catch (e) {
        console.error('Failed to add component', e);
      }
    } else {
      const { sectionRootId, nodes } = item.template.build();
      dispatch(addSection({ sectionRootId, nodes }));
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '120px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--studio-panel)',
          border: '1px solid var(--studio-border)',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--studio-border)', gap: 10 }}>
          <Search size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
          <input
            type="text"
            autoFocus
            placeholder="Search elements or section templates (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--studio-text)',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--studio-text-subtle)', display: 'flex', alignItems: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }} className="studio-scrollbar">
          {filteredItems.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--studio-text-muted)', fontSize: 13 }}>
              No components or sections found matching "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.kind === 'element' ? item.icon : null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: '2px',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 7,
                      backgroundColor: item.kind === 'element' ? 'rgba(99,102,241,0.1)' : 'rgba(139,92,246,0.1)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.kind === 'element' && Icon ? (
                        <Icon size={16} style={{ color: '#818cf8' }} />
                      ) : (
                        <span style={{ fontSize: 16 }}>{(item as any).thumbnail || '📦'}</span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--studio-text)', margin: 0 }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--studio-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: item.kind === 'element' ? 'rgba(99,102,241,0.1)' : 'rgba(139,92,246,0.1)',
                    color: item.kind === 'element' ? '#818cf8' : '#a78bfa',
                  }}>
                    {item.kind}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
