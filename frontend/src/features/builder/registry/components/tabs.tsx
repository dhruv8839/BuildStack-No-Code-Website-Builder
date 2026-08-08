import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import type { ComponentConfig } from '../types';

export const TabsConfig: ComponentConfig = {
  type: 'tabs',
  name: 'Tab Switcher',
  icon: Layers,
  defaultContent: {
    tabs: [
      { id: 'tab-1', label: 'Monthly Billing', content: 'Pay month-to-month with complete flexibility and no annual commitment.' },
      { id: 'tab-2', label: 'Annual Billing (Save 20%)', content: 'Save 20% on all plans with annual billing and priority VIP support.' },
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
    const tabs: Array<{ id: string; label: string; content: string }> = node.content?.tabs || [
      { id: 'tab-1', label: 'Monthly', content: 'Flexible month-to-month billing.' },
      { id: 'tab-2', label: 'Annual', content: 'Annual billing with 20% savings.' },
    ];

    const [activeTabIdx, setActiveTabIdx] = useState(0);
    const activeTab = tabs[activeTabIdx] || tabs[0];

    return (
      <div style={node.style as React.CSSProperties} className="bs-tabs-container space-y-4">
        {/* Tab Buttons Header */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-lg max-w-md mx-auto">
          {tabs.map((tab, idx) => {
            const isActive = activeTabIdx === idx;
            return (
              <button
                key={tab.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTabIdx(idx);
                }}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel Content */}
        <div className="p-5 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-zinc-300 transition-all leading-relaxed">
          {activeTab ? activeTab.content : 'Select a tab'}
        </div>
      </div>
    );
  },
};
