import React from 'react';
import { Minus } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const DividerConfig: ComponentConfig = {
  type: 'divider' as any,
  name: 'Divider',
  icon: Minus,
  defaultContent: {},
  defaultStyle: {
    width: '100%',
    height: '1px',
    backgroundColor: '#E5E7EB',
    marginTop: '24px',
    marginBottom: '24px',
    borderRadius: '999px',
    display: 'block',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'style',
      label: 'Style',
      properties: [
        { name: 'width',           label: 'Width',            type: 'text',  responsive: true },
        { name: 'height',          label: 'Thickness',        type: 'text',  responsive: true },
        { name: 'backgroundColor', label: 'Color',            type: 'color', responsive: true },
        { name: 'marginTop',       label: 'Margin Top',       type: 'text',  responsive: true },
        { name: 'marginBottom',    label: 'Margin Bottom',    type: 'text',  responsive: true },
        { name: 'borderRadius',    label: 'Border Radius',    type: 'text',  responsive: true },
      ],
    },
  ],
  render: ({ node }) => {
    return <div style={node.style as React.CSSProperties} />;
  },
};
