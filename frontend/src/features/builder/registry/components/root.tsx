import React from 'react';
import { Box } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const RootConfig: ComponentConfig = {
  type: 'root',
  name: 'Canvas Root',
  icon: Box,
  isContainer: true,
  defaultContent: {},
  defaultStyle: {
    minHeight: '100%',
    width: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '24px',
    paddingBottom: '24px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'style',
      label: 'Canvas Style',
      properties: [
        { name: 'backgroundColor', label: 'Background Color', type: 'color' },
        { name: 'paddingTop', label: 'Padding Top', type: 'text' },
        { name: 'paddingBottom', label: 'Padding Bottom', type: 'text' },
        { name: 'paddingLeft', label: 'Padding Left', type: 'text' },
        { name: 'paddingRight', label: 'Padding Right', type: 'text' },
      ],
    }
  ],
  render: ({ node, children }) => {
    return (
      <div 
        style={node.style as React.CSSProperties}
        className="builder-canvas-root relative"
      >
        {children}
      </div>
    );
  }
};
