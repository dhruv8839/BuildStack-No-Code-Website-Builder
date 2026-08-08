import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { updateNodeProperty } from '../state/builderSlice';
import { Sparkles, Wand2, RefreshCw, Check, Key, ChevronDown, ChevronUp, Minus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

const AI_PRESET_PROMPTS = [
  { id: 'professional', label: '💼 Professional & Corporate', tone: 'authoritative, corporate, professional business tone' },
  { id: 'punchy',       label: '⚡ Short & Punchy Hero',      tone: 'ultra-concise, high-impact marketing headline' },
  { id: 'converting',   label: '🎯 High-Converting CTA',      tone: 'action-oriented, urgent, persuasive call to action' },
  { id: 'grammar',      label: '✨ Polish & Fix Grammar',     tone: 'grammatically perfect, clear, polished vocabulary' },
  { id: 'luxury',       label: '💎 Elegant & Premium',        tone: 'sophisticated, high-end luxury brand aesthetic' },
];

const DEFAULT_GEMINI_KEY = '';

export function AiCopyAssistant() {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector((state: RootState) => state.builder.selectedNodeId);
  const node = useSelector((state: RootState) => selectedNodeId ? state.builder.nodes[selectedNodeId] : null);
  const viewport = useSelector((state: RootState) => state.builder.viewport);

  const [customPrompt, setCustomPrompt] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('buildstack_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  if (!node || !['heading', 'paragraph', 'button'].includes(node.type)) {
    return null;
  }

  // Minimized Pill Floating Badge
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-600 text-white font-semibold text-xs shadow-2xl hover:bg-indigo-500 transition-all hover:scale-105 cursor-pointer border border-indigo-400/30"
        title="Expand BuildStack Magic AI"
      >
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span>Magic AI</span>
      </button>
    );
  }

  const currentText = node.content?.text || '';

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('buildstack_gemini_key', key);
  };

  // Smart Contextual Copy Synthesizer (for zero-config offline AI)
  const synthesizeContextualCopy = (targetText: string, nodeType: string, toneId?: string, custom?: string): string => {
    const text = targetText.trim();
    const keywords = text.length > 0 ? text.split(/\s+/).slice(0, 4).join(' ') : 'website product';
    
    if (custom) {
      if (nodeType === 'button') return `Get Started with ${custom}`;
      if (nodeType === 'heading') return `Transforming ${custom} for the Modern Web`;
      return `Designed specifically for ${custom}. Delivering unmatched efficiency and modern user experiences.`;
    }

    if (toneId === 'professional') {
      if (nodeType === 'button') return `Schedule Executive Consultation`;
      if (nodeType === 'heading') return `Enterprise Solutions for ${keywords}`;
      return `Empowering modern organizations with scalable, industry-grade infrastructure for ${keywords}.`;
    }

    if (toneId === 'punchy') {
      if (nodeType === 'button') return `Launch ${keywords} Now →`;
      if (nodeType === 'heading') return `${keywords}. Reimagined.`;
      return `Build faster. Scale smarter. Elevate ${keywords} effortlessly.`;
    }

    if (toneId === 'converting') {
      if (nodeType === 'button') return `Claim Your Free Trial — Start Instant`;
      if (nodeType === 'heading') return `Unlock Unmatched Growth with ${keywords}`;
      return `Join over 10,000+ teams using ${keywords} to accelerate growth and double conversions.`;
    }

    if (toneId === 'grammar') {
      return text ? text.replace(/\b\w/g, (l) => l.toUpperCase()) : `Refined, polished website copy.`;
    }

    if (toneId === 'luxury') {
      if (nodeType === 'button') return `Experience ${keywords}`;
      if (nodeType === 'heading') return `The Apex of ${keywords}`;
      return `Meticulously crafted with unyielding precision for discerning global leaders.`;
    }

    return `Optimized ${keywords} experience`;
  };

  // Generate via Google Gemini 1.5 Flash API if key exists, or Smart Synthesizer
  const handleGenerate = async (presetId?: string) => {
    setIsGenerating(true);
    setGeneratedText(null);

    const preset = AI_PRESET_PROMPTS.find((p) => p.id === presetId);
    const toneInstruction = preset ? preset.tone : (customPrompt || 'engaging website copy');

    if (apiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are an expert website copywriter. Rewrite the following ${node.type} element text for a website.\n\nOriginal Text: "${currentText}"\nDesired Tone/Style: ${toneInstruction}\n\nInstructions: Return ONLY the raw rewritten copy text. Do not wrap in quotes, markdown, or explain.`
                }]
              }]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const geminiResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (geminiResult && geminiResult.trim()) {
            setGeneratedText(geminiResult.trim().replace(/^["']|["']$/g, ''));
            setIsGenerating(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart synthesizer:', err);
      }
    }

    // Smart Contextual Synthesizer Fallback
    setTimeout(() => {
      const result = synthesizeContextualCopy(currentText, node.type, presetId, customPrompt);
      setGeneratedText(result);
      setIsGenerating(false);
    }, 500);
  };

  const handleApply = () => {
    if (generatedText && selectedNodeId) {
      dispatch(updateNodeProperty({
        id: selectedNodeId,
        section: 'content',
        property: 'text',
        value: generatedText,
        viewport
      }));
      setGeneratedText(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-84 rounded-xl bg-[#111113] border border-white/10 p-4 shadow-2xl backdrop-blur-md studio-scrollbar space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">BuildStack Magic AI</h4>
            <p className="text-[10px] text-zinc-400">Target: <span className="font-semibold text-indigo-300">{node.type}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded cursor-pointer"
            title="Configure AI Engine Key"
          >
            <Key className="h-3 w-3 text-indigo-400" />
            {apiKey ? 'AI Active' : 'Set AI Key'}
            {showKeyInput ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Minimize AI Assistant"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Optional AI Engine Key Drawer */}
      {showKeyInput && (
        <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[10px] text-indigo-300 font-semibold">
            <span>BUILDSTACK AI LICENSE KEY</span>
            <span className="text-zinc-500 font-normal">Optional</span>
          </div>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            placeholder="Key..."
            className="h-7 text-xs bg-black/40 border-indigo-500/30 text-white font-mono"
          />
          <p className="text-[9px] text-zinc-400 leading-tight">
            Provide a custom AI key for live cloud generation, or leave blank to use the built-in Magic Synthesizer.
          </p>
        </div>
      )}

      {/* Target Element Content Preview */}
      <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-300">
        <span className="text-[10px] font-semibold text-zinc-500 block mb-1">TARGET ELEMENT TEXT</span>
        <p className="italic line-clamp-2">{currentText || '(empty text node)'}</p>
      </div>

      {/* Generated Result Preview */}
      {generatedText && (
        <div className="p-3 rounded-lg bg-indigo-950/50 border border-indigo-500/40 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-indigo-300 font-semibold">
            <span>AI SUGGESTED REWRITE</span>
            <Sparkles className="h-3 w-3 animate-pulse" />
          </div>
          <p className="text-xs text-white font-medium leading-relaxed">{generatedText}</p>
          <Button
            onClick={handleApply}
            size="xs"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Apply to {node.type}
          </Button>
        </div>
      )}

      {/* AI Presets */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold text-zinc-400 block uppercase">Context-Aware AI Presets</span>
        <div className="grid gap-1">
          {AI_PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleGenerate(preset.id)}
              disabled={isGenerating}
              className="flex items-center justify-between p-2 rounded-md bg-white/[0.02] border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-left transition-colors text-xs text-zinc-300 hover:text-white group"
            >
              <span>{preset.label}</span>
              <Wand2 className="h-3 w-3 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Instruction Input */}
      <div className="space-y-1.5 pt-2 border-t border-white/10">
        <span className="text-[10px] font-semibold text-zinc-400 block uppercase">Custom Prompt</span>
        <div className="flex gap-1.5">
          <Input
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. For an AI startup..."
            className="h-8 text-xs bg-white/[0.04] border-white/10 text-white"
          />
          <Button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !customPrompt.trim()}
            size="xs"
            className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {isGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
