import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const ImageConfig: ComponentConfig = {
  type: 'image',
  name: 'Image',
  icon: ImageIcon,
  defaultContent: {
    src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60',
    alt: 'Sample Image',
    linkUrl: '',
    target: '_self',
  },
  defaultStyle: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    objectFit: 'cover',
    marginTop: '0px',
    marginBottom: '16px',
    display: 'inline-block',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Image & Link',
      properties: [
        { name: 'src',     label: 'Image Source URL', type: 'image' },
        { name: 'alt',     label: 'Alt Text (SEO)',   type: 'text' },
        { name: 'linkUrl', label: 'Click Link URL (Optional)', type: 'text' },
        {
          name: 'target',
          label: 'Open In',
          type: 'select',
          options: [
            { label: 'Same Tab (_self)', value: '_self' },
            { label: 'New Tab (_blank)', value: '_blank' },
          ],
        },
      ],
    },
    {
      id: 'style',
      label: 'Style',
      properties: [
        { name: 'width',        label: 'Width',         type: 'text',  responsive: true },
        { name: 'height',       label: 'Height',        type: 'text',  responsive: true },
        { name: 'borderRadius', label: 'Border Radius', type: 'text',  responsive: true },
        { name: 'marginTop',    label: 'Margin Top',    type: 'text',  responsive: true },
        { name: 'marginBottom', label: 'Margin Bottom', type: 'text',  responsive: true },
      ],
    },
  ],
  render: ({ node }) => {
    const src = node.content.src || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60';
    const alt = node.content.alt || 'Image';
    const linkUrl = node.content.linkUrl;
    const target = node.content.target || '_self';

    const imgElement = (
      <img
        src={src}
        alt={alt}
        style={node.style as React.CSSProperties}
      />
    );

    if (linkUrl && linkUrl.trim() !== '') {
      return (
        <a href={linkUrl} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} style={{ display: 'inline-block', width: (node.style as any)?.width || '100%' }}>
          {imgElement}
        </a>
      );
    }

    return imgElement;
  },
};
