import React from 'react';
import { Star } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ComponentConfig } from '../types';

// Curated popular icon list for the picker dropdown
export const ICON_OPTIONS = [
  'Star', 'Heart', 'Home', 'User', 'Settings', 'Search', 'Mail', 'Phone',
  'MapPin', 'Calendar', 'Clock', 'Check', 'X', 'Plus', 'Minus', 'ArrowRight',
  'ArrowLeft', 'ChevronDown', 'ChevronUp', 'ChevronRight', 'ChevronLeft',
  'Globe', 'Lock', 'Unlock', 'Eye', 'EyeOff', 'Download', 'Upload',
  'Share2', 'Link', 'Image', 'Video', 'Music', 'Camera', 'Mic',
  'ShoppingCart', 'CreditCard', 'DollarSign', 'TrendingUp', 'BarChart2',
  'Zap', 'Shield', 'Award', 'Gift', 'Layers', 'Grid', 'List', 'Menu',
  'BookOpen', 'FileText', 'Folder', 'Clipboard', 'Edit', 'Trash2',
  'RefreshCw', 'RotateCw', 'Send', 'MessageSquare', 'Bell', 'Info',
  'AlertCircle', 'CheckCircle', 'XCircle', 'HelpCircle', 'Smile',
  'Sun', 'Moon', 'Cloud', 'Wind', 'Droplet', 'Coffee', 'Code', 'Terminal',
];

export const IconConfig: ComponentConfig = {
  type: 'icon' as any,
  name: 'Icon',
  icon: Star,
  defaultContent: {
    iconName: 'Star',
  },
  defaultStyle: {
    color: '#4F46E5',
    width: '32px',
    height: '32px',
    marginTop: '0px',
    marginBottom: '0px',
    marginLeft: '0px',
    marginRight: '0px',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Icon',
      properties: [
        { name: 'iconName', label: 'Icon', type: 'icon-picker' as any },
      ],
    },
    {
      id: 'style',
      label: 'Style',
      properties: [
        { name: 'color',           label: 'Icon Color',    type: 'color', responsive: true },
        { name: 'width',           label: 'Width',         type: 'text', responsive: true },
        { name: 'height',          label: 'Height',        type: 'text', responsive: true },
        { name: 'backgroundColor', label: 'Background',    type: 'color', responsive: true },
        { name: 'borderRadius',    label: 'Border Radius', type: 'text', responsive: true },
        { name: 'padding',         label: 'Padding',       type: 'text', responsive: true },
        { name: 'marginTop',       label: 'Margin Top',    type: 'text', responsive: true },
        { name: 'marginBottom',    label: 'Margin Bottom', type: 'text', responsive: true },
        { name: 'marginLeft',      label: 'Margin Left',   type: 'text', responsive: true },
        { name: 'marginRight',     label: 'Margin Right',  type: 'text', responsive: true },
      ],
    }
  ],
  render: ({ node }) => {
    const IconCmp = (LucideIcons as any)[node.content.iconName] || LucideIcons.Star;
    const resolvedStyle = node.style as React.CSSProperties;
    
    return (
      <div style={{ display: 'inline-block', ...resolvedStyle }}>
        <IconCmp width="100%" height="100%" color={resolvedStyle.color as string || 'currentColor'} strokeWidth={2} />
      </div>
    );
  }
};
