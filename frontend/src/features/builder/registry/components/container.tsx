import React from 'react';
import { Box } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const ContainerConfig: ComponentConfig = {
  type: 'container',
  name: 'Container',
  icon: Box,
  isContainer: true,
  defaultContent: {
    animation: 'none',
  },
  defaultStyle: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent',
    paddingTop: '16px',
    paddingBottom: '16px',
    paddingLeft: '16px',
    paddingRight: '16px',
    marginTop: '0px',
    marginBottom: '16px',
    borderRadius: '0px',
    border: '1px solid transparent',
    minHeight: '50px',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Animation Effect',
      properties: [
        {
          name: 'animation',
          label: 'Entrance Animation',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Fade In', value: 'bs-fadeIn' },
            { label: 'Slide Up', value: 'bs-slideUp' },
            { label: 'Slide Down', value: 'bs-slideDown' },
            { label: 'Zoom In', value: 'bs-zoomIn' },
          ],
        },
      ],
    },
    {
      id: 'style',
      label: 'Layout & Style',
      properties: [
        {
          name: 'display',
          label: 'Display',
          type: 'select',
          responsive: true,
          options: [
            { label: 'Flex',  value: 'flex' },
            { label: 'Block', value: 'block' },
            { label: 'Grid',  value: 'grid' },
          ],
        },
        {
          name: 'flexDirection',
          label: 'Direction',
          type: 'select',
          responsive: true,
          options: [
            { label: 'Row',    value: 'row' },
            { label: 'Column', value: 'column' },
          ],
        },
        { name: 'width',           label: 'Width',            type: 'text',  responsive: true },
        { name: 'height',          label: 'Height',           type: 'text',  responsive: true },
        { name: 'minHeight',       label: 'Min Height',       type: 'text',  responsive: true },
        { name: 'backgroundColor', label: 'Background Color', type: 'color', responsive: true },
        { name: 'paddingTop',      label: 'Padding Top',      type: 'text',  responsive: true },
        { name: 'paddingBottom',   label: 'Padding Bottom',   type: 'text',  responsive: true },
        { name: 'paddingLeft',     label: 'Padding Left',     type: 'text',  responsive: true },
        { name: 'paddingRight',    label: 'Padding Right',    type: 'text',  responsive: true },
        { name: 'marginTop',       label: 'Margin Top',       type: 'text',  responsive: true },
        { name: 'marginBottom',    label: 'Margin Bottom',    type: 'text',  responsive: true },
        { name: 'borderRadius',    label: 'Border Radius',    type: 'text',  responsive: true },
        { name: 'border',          label: 'Border',           type: 'text',  responsive: true },
      ],
    },
  ],
  render: ({ node, children }) => {
    const animClass = node.content?.animation && node.content.animation !== 'none'
      ? `animate-${node.content.animation}`
      : '';

    return (
      <div className={animClass} style={node.style as React.CSSProperties}>
        {children}
      </div>
    );
  },
};
