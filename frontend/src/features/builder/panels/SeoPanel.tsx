import { useState, useMemo } from 'react';
import { Search, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

export function SeoPanel() {
  const [metaTitle, setMetaTitle] = useState('BuildStack — High-Performance No-Code Website Generator');
  const [metaDesc, setMetaDesc] = useState('Design, customize, and launch production-grade responsive websites with built-in form capture and static ZIP exports.');
  const [keywords, setKeywords] = useState('no code, website builder, react, web design, landing page');
  const [ogImage, setOgImage] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80');

  // Calculate real-time SEO health score (0 - 100)
  const seoAnalysis = useMemo(() => {
    let score = 0;
    const checks: Array<{ text: string; passed: boolean }> = [];

    // Title Check (ideal 30 - 60 chars)
    const titleLen = metaTitle.trim().length;
    if (titleLen >= 30 && titleLen <= 60) {
      score += 30;
      checks.push({ text: `Meta Title length is optimal (${titleLen}/60 chars)`, passed: true });
    } else if (titleLen > 0) {
      score += 15;
      checks.push({ text: `Meta Title is ${titleLen < 30 ? 'too short' : 'too long'} (${titleLen} chars, ideal 30-60)`, passed: false });
    } else {
      checks.push({ text: 'Meta Title is missing', passed: false });
    }

    // Meta Description Check (ideal 70 - 160 chars)
    const descLen = metaDesc.trim().length;
    if (descLen >= 70 && descLen <= 160) {
      score += 30;
      checks.push({ text: `Meta Description length is optimal (${descLen}/160 chars)`, passed: true });
    } else if (descLen > 0) {
      score += 15;
      checks.push({ text: `Meta Description is ${descLen < 70 ? 'too short' : 'too long'} (${descLen} chars, ideal 70-160)`, passed: false });
    } else {
      checks.push({ text: 'Meta Description is missing', passed: false });
    }

    // OpenGraph Social Image Check
    if (ogImage && ogImage.startsWith('http')) {
      score += 20;
      checks.push({ text: 'OpenGraph Social Sharing Image URL configured', passed: true });
    } else {
      checks.push({ text: 'OpenGraph Social Sharing Image is missing', passed: false });
    }

    // Keywords Check
    if (keywords.trim().length > 0) {
      score += 20;
      checks.push({ text: 'Target Meta Keywords specified', passed: true });
    } else {
      checks.push({ text: 'Meta Keywords are missing', passed: false });
    }

    return { score, checks };
  }, [metaTitle, metaDesc, ogImage, keywords]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--studio-border)', flexShrink: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg border shadow-sm"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
                borderColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                color: 'var(--primary)',
              }}
            >
              <Search className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">SEO & OpenGraph</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">Search engine optimization</p>
            </div>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            seoAnalysis.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            Score {seoAnalysis.score}/100
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }} className="studio-scrollbar space-y-5">
        
        {/* SEO Score Progress Bar */}
        <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--foreground)]">SEO Health Indicator</span>
            <span className="font-bold text-[var(--primary)]">{seoAnalysis.score}%</span>
          </div>
          <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--primary)] to-emerald-400 transition-all duration-300"
              style={{ width: `${seoAnalysis.score}%` }}
            />
          </div>
          
          <div className="space-y-1.5 pt-2">
            {seoAnalysis.checks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                {c.passed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                )}
                <span className={c.passed ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Meta Title Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-[var(--foreground)] font-medium">Page Title (Meta Title)</Label>
            <span className={`text-[10px] ${metaTitle.length > 60 ? 'text-amber-400' : 'text-[var(--muted-foreground)]'}`}>
              {metaTitle.length} / 60
            </span>
          </div>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="e.g. Acme Corp — Next-Gen SaaS Platform"
            className="h-8 text-xs bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
          />
        </div>

        {/* Meta Description Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-[var(--foreground)] font-medium">Meta Description</Label>
            <span className={`text-[10px] ${metaDesc.length > 160 ? 'text-amber-400' : 'text-[var(--muted-foreground)]'}`}>
              {metaDesc.length} / 160
            </span>
          </div>
          <textarea
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            rows={3}
            placeholder="Summarize page content for Google search results..."
            className="w-full p-2.5 rounded-md text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] leading-relaxed focus:outline-none focus:border-[var(--primary)] font-sans"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--foreground)] font-medium">Meta Keywords</Label>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="comma-separated keywords..."
            className="h-8 text-xs bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
          />
        </div>

        {/* OpenGraph Image URL */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--foreground)] font-medium">OpenGraph Social Sharing Image</Label>
          <Input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://..."
            className="h-8 text-xs bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
          />
        </div>

        {/* Live Social Sharing Card Preview */}
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-semibold">
            <Share2 className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Social Sharing Preview (Twitter & Facebook)</span>
          </div>

          <div className="rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-lg space-y-0">
            {ogImage && (
              <div className="h-36 w-full bg-[var(--muted)] overflow-hidden relative">
                <img src={ogImage} alt="Social Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3.5 space-y-1 bg-[var(--card)]">
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono block">buildstack.app</span>
              <h4 className="text-xs font-bold text-[var(--foreground)] line-clamp-1">{metaTitle || 'Page Title'}</h4>
              <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-tight">{metaDesc || 'Meta description snippet...'}</p>
            </div>
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
