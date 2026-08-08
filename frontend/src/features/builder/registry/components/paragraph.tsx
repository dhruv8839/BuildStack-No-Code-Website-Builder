import React from 'react';
import { AlignLeft } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const ParagraphConfig: ComponentConfig = {
  type: 'paragraph',
  name: 'Paragraph',
  icon: AlignLeft,
  defaultContent: {
    text: 'Enter your paragraph text here...',
    linkUrl: '',
    target: '_self',
  },
  defaultStyle: {
    color: 'inherit',
    textAlign: 'left',
    marginTop: '0px',
    marginBottom: '16px',
    fontSize: '16px',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Content & Link',
      properties: [
        { name: 'text',    label: 'Text',        type: 'text' },
        { name: 'linkUrl', label: 'Target Page', type: 'page-picker' as any },
        { name: 'linkUrl', label: 'Custom Link URL (Optional)', type: 'text' },
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
            { label: 'Left',    value: 'left' },
            { label: 'Center',  value: 'center' },
            { label: 'Right',   value: 'right' },
            { label: 'Justify', value: 'justify' },
          ],
        },
        { name: 'fontSize',     label: 'Font Size',     type: 'text',   responsive: true },
        { name: 'marginTop',    label: 'Margin Top',    type: 'text',   responsive: true },
        { name: 'marginBottom', label: 'Margin Bottom', type: 'text',   responsive: true },
      ],
    },
  ],
  render: ({ node }) => {
    const text = node.content.text;
    const linkUrl = node.content.linkUrl;
    const target = node.content.target || '_self';

    const pElement = (
      <p style={node.style as React.CSSProperties}>
        {text}
      </p>
    );

    if (linkUrl && linkUrl.trim() !== '') {
      return (
        <a href={linkUrl} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} style={{ textDecoration: 'none', color: 'inherit' }}>
          {pElement}
        </a>
      );
    }

    return pElement;
  },
};
