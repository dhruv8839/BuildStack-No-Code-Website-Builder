import { useDispatch } from 'react-redux';
import { ComponentRegistry } from '../registry';
import { addNode } from '../state/builderSlice';
import { NodeFactory } from '../utils/nodeFactory';
import { useDraggable } from '@dnd-kit/core';

const COMPONENT_CATEGORIES = [
  { label: 'Text',        types: ['heading', 'paragraph'] },
  { label: 'Media',       types: ['image', 'video', 'icon'] },
  { label: 'Interactive', types: ['button', 'form'] },
  { label: 'Layout',      types: ['container', 'spacer', 'divider'] },
];

function DraggableComponentButton({ config, onClick }: { config: any; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${config.type}`,
    data: { type: 'new_component', componentType: config.type },
  });

  const Icon = config.icon;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <button
        onClick={onClick}
        title="Click to add, or drag to canvas"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: '10px 6px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'rgba(255,255,255,0.03)',
          cursor: 'grab',
          transition: 'all 0.15s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = 'rgba(99,102,241,0.4)'
          el.style.backgroundColor = 'rgba(99,102,241,0.08)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = 'rgba(255,255,255,0.06)'
          el.style.backgroundColor = 'rgba(255,255,255,0.03)'
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 7,
          backgroundColor: 'rgba(99,102,241,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={15} style={{ color: '#818cf8' }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 500, color: '#71717a', textAlign: 'center', lineHeight: 1.3 }}>
          {config.name}
        </span>
      </button>
    </div>
  );
}

export function ComponentsPanel() {
  const dispatch = useDispatch();
  const allConfigs = ComponentRegistry.getAllConfigs().filter((c) => c.type !== 'root');

  const handleAddComponent = (type: string) => {
    try {
      const node = NodeFactory.createNode(type as any);
      dispatch(addNode({ node }));
    } catch (e) {
      console.error('Failed to add component', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--studio-text)', marginBottom: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Elements
        </p>
        <p style={{ fontSize: 10, color: 'var(--studio-text-muted)' }}>
          Click to add · Drag onto canvas
        </p>
      </div>

      {/* Components */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }} className="studio-scrollbar">
        {COMPONENT_CATEGORIES.map((category) => {
          const configs = category.types
            .map((type) => allConfigs.find((c) => c.type === type))
            .filter(Boolean) as typeof allConfigs;

          if (configs.length === 0) return null;

          return (
            <div key={category.label} style={{ marginBottom: 18 }}>
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'var(--studio-text-subtle)',
                marginBottom: 8, paddingLeft: 2,
              }}>
                {category.label}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {configs.map((config) => (
                  <DraggableComponentButton
                    key={config.type}
                    config={config}
                    onClick={() => handleAddComponent(config.type)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
