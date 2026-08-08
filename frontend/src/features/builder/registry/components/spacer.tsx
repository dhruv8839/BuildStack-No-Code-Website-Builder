import React from 'react';

import { MoveVertical } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const SpacerConfig: ComponentConfig = {
  type: 'spacer',
  name: 'Spacer',
  icon: MoveVertical,
  defaultContent: {},
  defaultStyle: {
    height: '32px',
    width: '100%',
    display: 'block'
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'style',
      label: 'Dimensions',
      properties: [
        { name: 'height', label: 'Height', type: 'text' },
      ],
    }
  ],
  render: ({ node }) => {
    return (
      <div style={node.style as React.CSSProperties} />
    );
  }
};
