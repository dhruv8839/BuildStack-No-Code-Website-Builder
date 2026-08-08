import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const AccordionConfig: ComponentConfig = {
  type: 'accordion',
  name: 'FAQ Accordion',
  icon: HelpCircle,
  defaultContent: {
    title: 'Frequently Asked Questions',
    items: [
      { id: '1', question: 'How long does website setup take?', answer: 'BuildStack provisions your website instantly upon template selection.' },
      { id: '2', question: 'Can I export static HTML & CSS?', answer: 'Yes, 1-click ZIP export bundles clean HTML, CSS, and JS files.' },
      { id: '3', question: 'Are contact forms connected automatically?', answer: 'All forms captured on your site are routed directly to your Form Submissions Inbox.' },
    ],
  },
  defaultStyle: {
    backgroundColor: '#111113',
    color: '#ffffff',
    paddingTop: '24px',
    paddingBottom: '24px',
    paddingLeft: '24px',
    paddingRight: '24px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: '0px',
    marginBottom: '24px',
    width: '100%',
  },
  defaultSettings: {},
  propertySchemas: [
    {
      id: 'content',
      label: 'Accordion Content',
      properties: [
        { name: 'title', label: 'Section Title', type: 'text' },
      ],
    },
    {
      id: 'style',
      label: 'Layout & Colors',
      properties: [
        { name: 'backgroundColor', label: 'Background Color', type: 'color', responsive: true },
        { name: 'color',           label: 'Text Color',       type: 'color', responsive: true },
        { name: 'borderRadius',    label: 'Border Radius',    type: 'text',  responsive: true },
        { name: 'marginTop',       label: 'Margin Top',       type: 'text',  responsive: true },
        { name: 'marginBottom',    label: 'Margin Bottom',    type: 'text',  responsive: true },
      ],
    },
  ],
  render: ({ node }) => {
    const title = node.content?.title || 'Frequently Asked Questions';
    const items: Array<{ id: string; question: string; answer: string }> = node.content?.items || [
      { id: '1', question: 'How long does setup take?', answer: 'Setup takes less than 60 seconds.' },
      { id: '2', question: 'Is static export included?', answer: 'Yes, full ZIP export is included.' },
    ];

    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
      <div style={node.style as React.CSSProperties} className="bs-accordion-container space-y-4">
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.id || idx}
                className="border border-white/10 rounded-lg overflow-hidden bg-white/[0.02] transition-colors"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIdx(isOpen ? null : idx);
                  }}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-indigo-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-zinc-400 border-t border-white/5 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
