import React from 'react';
import { Video as VideoIcon } from 'lucide-react';
import type { ComponentConfig } from '../types';

// Converts a YouTube watch URL to an embeddable URL
function toEmbedUrl(url: string): string {
  if (!url) return '';
  // Already an embed URL
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com')) return url;
  // YouTube watch URL: https://www.youtube.com/watch?v=ID
  const ytMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // YouTube short URL: https://youtu.be/ID
  const ytShort = url.match(/youtu\.be\/([^?]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  // Vimeo: https://vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

export const VideoConfig: ComponentConfig = {
  type: 'video' as any,
  name: 'Video',
  icon: VideoIcon,
  defaultContent: {
    src: '',
  },
  defaultStyle: {
    width: '100%',
    height: '315px',
    marginTop: '0px',
    marginBottom: '16px',
    borderRadius: '8px',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Video',
      properties: [
        {
          name: 'src',
          label: 'YouTube / Vimeo URL',
          type: 'text',
        },
      ],
    },
    {
      id: 'style',
      label: 'Style',
      properties: [
        { name: 'width',        label: 'Width',         type: 'text', responsive: true },
        { name: 'height',       label: 'Height',        type: 'text', responsive: true },
        { name: 'marginTop',    label: 'Margin Top',    type: 'text', responsive: true },
        { name: 'marginBottom', label: 'Margin Bottom', type: 'text', responsive: true },
        { name: 'borderRadius', label: 'Border Radius', type: 'text', responsive: true },
      ],
    },
  ],
  render: ({ node }) => {
    const rawSrc: string = node.content.src ?? '';
    const embedSrc = toEmbedUrl(rawSrc.trim());
    const style = node.style as React.CSSProperties;

    if (!embedSrc) {
      return (
        <div
          style={{
            ...style,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            color: '#94A3B8',
            border: '2px dashed #334155',
            boxSizing: 'border-box',
          }}
        >
          <VideoIcon style={{ width: 40, height: 40, marginBottom: 8, color: '#818CF8' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>Video Embed</span>
          <span style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Paste a YouTube or Vimeo URL in the Properties panel
          </span>
        </div>
      );
    }

    return (
      <iframe
        src={embedSrc}
        style={{ ...style, display: 'block', border: 'none' }}
        title="Embedded Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  },
};
