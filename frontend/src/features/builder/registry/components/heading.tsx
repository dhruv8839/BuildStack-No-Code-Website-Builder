import React from 'react';
import { Type } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const HeadingConfig: ComponentConfig = {
  type: 'heading',
  name: 'Heading',
  icon: Type,
  defaultContent: {
    text: 'Heading Text',
  },
  defaultStyle: {
    color: 'inherit',
    textAlign: 'left',
    marginTop: '0px',
    marginBottom: '16px',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Text & Motion',
      properties: [
        { name: 'text', label: 'Text', type: 'text' },
        {
          name: 'animation',
          label: 'Entrance Motion',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Fade In', value: 'bs-fadeIn' },
            { label: 'Fade Up', value: 'bs-fadeUp' },
            { label: 'Slide in Left', value: 'bs-slideInLeft' },
            { label: 'Slide in Right', value: 'bs-slideInRight' },
            { label: 'Zoom In', value: 'bs-zoomIn' },
            { label: 'Floating Glow', value: 'bs-floatGlow' },
            { label: 'Bounce In', value: 'bs-bounceIn' },
          ],
        },
      ],
    },
    {
      id: 'style',
      label: 'Style',
      properties: [
        { name: 'width',        label: 'Width',         type: 'text',   responsive: true },
        { name: 'height',       label: 'Height',        type: 'text',   responsive: true },
        { name: 'color',        label: 'Color',         type: 'color',  responsive: true },
        { 
          name: 'textAlign', 
          label: 'Alignment', 
          type: 'select',
          responsive: true,
          options: [
            { label: 'Left',   value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right',  value: 'right' }
          ]
        },
        { name: 'fontSize',     label: 'Font Size',     type: 'text',   responsive: true },
        { name: 'marginTop',    label: 'Margin Top',    type: 'text',   responsive: true },
        { name: 'marginBottom', label: 'Margin Bottom', type: 'text',   responsive: true },
      ],
    }
  ],
  render: ({ node }) => {
    return (
      <h2 style={node.style as React.CSSProperties}>
        {node.content.text}
      </h2>
    );
  }
};
