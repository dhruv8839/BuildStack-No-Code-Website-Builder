import React from 'react'
import { FileText, Component, LayoutTemplate, Palette, Image as ImageIcon, Search } from 'lucide-react'

export type PanelType = 'pages' | 'sections' | 'components' | 'theme' | 'layers' | 'assets' | 'seo'

interface LeftSidebarProps {
  activePanel: PanelType
  onPanelSelect: (panel: PanelType) => void
}

const items: { id: PanelType; icon: React.ReactNode; label: string }[] = [
  { id: 'pages',      icon: <FileText size={16} />,       label: 'Pages' },
  { id: 'sections',   icon: <LayoutTemplate size={16} />, label: 'Sections' },
  { id: 'components', icon: <Component size={16} />,       label: 'Elements' },
  { id: 'assets',     icon: <ImageIcon size={16} />,      label: 'Assets' },
  { id: 'theme',      icon: <Palette size={16} />,        label: 'Global Theme' },
  { id: 'seo',        icon: <Search size={16} />,         label: 'Page SEO' },
]

export function LeftSidebar({ activePanel, onPanelSelect }: LeftSidebarProps) {
  return (
    <div className="flex h-full flex-col items-center py-3 gap-1">
      {items.map((item) => {
        const isActive = activePanel === item.id
        return (
          <button
            key={item.id}
            onClick={() => onPanelSelect(item.id)}
            title={item.label}
            style={{
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
              backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: isActive ? '#818cf8' : 'var(--studio-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.05)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--studio-text)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--studio-text-muted)'
              }
            }}
          >
            {item.icon}
          </button>
        )
      })}
    </div>
  )
}
