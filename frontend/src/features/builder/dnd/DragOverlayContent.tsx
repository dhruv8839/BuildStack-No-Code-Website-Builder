import { ComponentRegistry } from '../registry';
import { Move } from 'lucide-react';

interface DragOverlayContentProps {
  id: string;
  data: any;
}

export function DragOverlayContent({ data }: DragOverlayContentProps) {
  if (!data) return null;

  if (data.type === 'new_component') {
    const config = ComponentRegistry.getConfig(data.componentType);
    if (!config) return null;
    const Icon = config.icon;

    return (
      <div
        className="px-4 py-2.5 bg-[#0d0d10]/95 backdrop-blur-md border-2 border-emerald-500 rounded-xl flex items-center gap-2.5 cursor-grabbing text-white"
        style={{
          boxShadow: '0 0 0 4px rgba(16,185,129,0.15), 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.3)',
        }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider leading-none mb-0.5">New Element</span>
          <span className="text-xs font-bold text-white leading-none">{config.name}</span>
        </div>
        <div className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    );
  }

  if (data.type === 'existing_component') {
    const config = ComponentRegistry.getConfig(data.componentType);
    const Icon = config?.icon || Move;

    return (
      <div
        className="px-4 py-2.5 bg-[#0d0d10]/95 backdrop-blur-md border-2 border-indigo-500 rounded-xl flex items-center gap-2.5 cursor-grabbing text-white"
        style={{
          boxShadow: '0 0 0 4px rgba(99,102,241,0.15), 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.3)',
        }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/40">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider leading-none mb-0.5">Moving Node</span>
          <span className="text-xs font-bold text-white leading-none">{config?.name || 'Component'}</span>
        </div>
      </div>
    );
  }

  return null;
}
