import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Search, Globe, Image as ImageIcon, X } from 'lucide-react';
import type { PageResponse } from '../../../types/api';

interface PageSeoModalProps {
  page: PageResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: { title?: string; description?: string; slug?: string; ogImage?: string }) => void;
}

export function PageSeoModal({ page, isOpen, onClose, onSave }: PageSeoModalProps) {
  const [title, setTitle] = useState(page.name || '');
  const [slug, setSlug] = useState(page.slug || '');
  const [description, setDescription] = useState('');
  const [ogImage, setOgImage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ title, slug, description, ogImage });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-base font-semibold">Page SEO & Settings</h3>
            <p className="text-xs text-muted-foreground">Configure search engine indexing and link metadata for "{page.name}"</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* SEO Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-primary" />
              SEO Title Tag
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acme Corp — Next Gen SaaS Platform"
              className="h-9 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Appears in Google search results and browser tab (recommended: 50–60 characters)</p>
          </div>

          {/* URL Slug */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              URL Path / Slug
            </Label>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0 font-mono">/</span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
                className="h-9 text-xs font-mono rounded-l-none"
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Meta Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your page for search engines and social sharing..."
              className="w-full rounded-md border bg-transparent p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-[10px] text-muted-foreground">Recommended: 120–160 characters</p>
          </div>

          {/* OpenGraph Image */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              Social Share Image (og:image)
            </Label>
            <Input
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://example.com/og-cover.png"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleSave}>
            Save SEO Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
