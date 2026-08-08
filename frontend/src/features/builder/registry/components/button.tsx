import React from 'react';
import { Square } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const ButtonConfig: ComponentConfig = {
  type: 'button',
  name: 'Button',
  icon: Square,
  defaultContent: {
    text: 'Click Me',
    url: '#',
    target: '_self',
  },
  defaultStyle: {
    backgroundColor: '#4F46E5',
    color: '#ffffff',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '24px',
    paddingRight: '24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '0px',
    marginBottom: '16px',
    display: 'inline-block',
    textAlign: 'center',
    textDecoration: 'none',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Content & Motion',
      properties: [
        { name: 'text',   label: 'Button Label', type: 'text' },
        { name: 'url',    label: 'Target Page',  type: 'page-picker' as any },
        { name: 'url',    label: 'Custom URL / Anchor', type: 'text' },
        {
          name: 'target',
          label: 'Open In',
          type: 'select',
          options: [
            { label: 'Same Tab',  value: '_self' },
            { label: 'New Tab',   value: '_blank' },
          ]
        },
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
        { name: 'width',           label: 'Width',            type: 'text',  responsive: true },
        { name: 'height',          label: 'Height',           type: 'text',  responsive: true },
        { name: 'backgroundColor', label: 'Background Color', type: 'color', responsive: true },
        { name: 'color',           label: 'Text Color',       type: 'color', responsive: true },
        { name: 'fontSize',        label: 'Font Size',        type: 'text',  responsive: true },
        { name: 'borderRadius',    label: 'Border Radius',    type: 'text',  responsive: true },
        { name: 'paddingTop',      label: 'Padding Top',      type: 'text',  responsive: true },
        { name: 'paddingBottom',   label: 'Padding Bottom',   type: 'text',  responsive: true },
        { name: 'paddingLeft',     label: 'Padding Left',     type: 'text',  responsive: true },
        { name: 'paddingRight',    label: 'Padding Right',    type: 'text',  responsive: true },
        { name: 'marginTop',       label: 'Margin Top',       type: 'text',  responsive: true },
        { name: 'marginBottom',    label: 'Margin Bottom',    type: 'text',  responsive: true },
      ],
    },
  ],
  render: ({ node }) => {
    const url = node.content.url || '#';
    const target = node.content.target || '_self';

    return (
      <a
        href={url}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        style={{ ...node.style, textDecoration: 'none' } as React.CSSProperties}
      >
        {node.content.text}
      </a>
    );
  },
};
