/**
 * Section Template Library
 * 
 * Each template is a factory function that returns a self-contained 
 * node tree with a sectionRootId and all the nodes keyed by ID.
 * All IDs are generated fresh on each call so templates can be added
 * multiple times without conflicts.
 */

import type { BuilderNode } from '../types/builder';
import { generateNodeId } from '../utils/idGenerator';

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'navigation' | 'hero' | 'content' | 'ecommerce' | 'blog' | 'contact' | 'footer';
  thumbnail: string; // emoji fallback
  build: (theme?: any) => { sectionRootId: string; nodes: Record<string, BuilderNode> };
}

// ─── Helper to adapt nodes to active theme palette ──────────────────────────
export function applyThemeToNodes(nodes: Record<string, BuilderNode>, theme?: any): Record<string, BuilderNode> {
  if (!theme) return nodes;
  
  Object.values(nodes).forEach((n) => {
    if (!n.style) n.style = { desktop: {}, tablet: {}, mobile: {} };
    if (!n.style.desktop) n.style.desktop = {};
    const dStyle = n.style.desktop;

    if (n.type === 'container') {
      if (dStyle.backgroundColor === '#ffffff' || dStyle.backgroundColor === '#FFFFFF') {
        dStyle.backgroundColor = theme.backgroundColor || '#09090b';
      }
    } else if (n.type === 'heading' || n.type === 'paragraph') {
      if (dStyle.color === '#0F172A' || dStyle.color === '#1E293B' || dStyle.color === '#475569' || dStyle.color === '#000000') {
        dStyle.color = theme.textColor || '#f4f4f5';
      }
    } else if (n.type === 'button') {
      if (dStyle.backgroundColor === '#4F46E5' || dStyle.backgroundColor === '#6366f1' || dStyle.backgroundColor === '#0F172A') {
        dStyle.backgroundColor = theme.primaryColor || '#6366f1';
      }
    }
  });

  return nodes;
}

// ─── Helper to quickly build a node ─────────────────────────────────────────
function node(
  type: BuilderNode['type'],
  id: string,
  parentId: string | null,
  children: string[],
  content: Record<string, any>,
  desktopStyle: Record<string, any>,
  mobileStyle: Record<string, any> = {}
): BuilderNode {
  return {
    id,
    type,
    parentId,
    children,
    content,
    style: { desktop: desktopStyle, tablet: {}, mobile: mobileStyle },
    settings: {},
  };
}

// ─── SECTION DEFINITIONS ────────────────────────────────────────────────────

function buildNavbarSection() {
  const root = generateNodeId();
  const logo = generateNodeId();
  const navLinks = generateNodeId();
  const link1 = generateNodeId();
  const link2 = generateNodeId();
  const link3 = generateNodeId();
  const cta = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [logo, navLinks, cta],
      {},
      { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '48px', paddingRight: '48px', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)', width: '100%', minHeight: '64px' },
      { paddingLeft: '16px', paddingRight: '16px' }
    ),
    [logo]: node('heading', logo, root, [],
      { text: 'MyBrand' },
      { fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '0px', letterSpacing: '-0.02em' }
    ),
    [navLinks]: node('container', navLinks, root, [link1, link2, link3],
      {},
      { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '0px', minHeight: '0px', border: 'none' },
      { display: 'none' }
    ),
    [link1]: node('paragraph', link1, navLinks, [],
      { text: 'Features' },
      { fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '0px', cursor: 'pointer' }
    ),
    [link2]: node('paragraph', link2, navLinks, [],
      { text: 'Pricing' },
      { fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '0px', cursor: 'pointer' }
    ),
    [link3]: node('paragraph', link3, navLinks, [],
      { text: 'Company' },
      { fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '0px', cursor: 'pointer' }
    ),
    [cta]: node('button', cta, root, [],
      { text: 'Get Started →', url: '#' },
      { backgroundColor: '#4F46E5', color: '#ffffff', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', marginBottom: '0px', display: 'inline-block', textAlign: 'center', border: 'none', textDecoration: 'none' }
    ),
  };

  return { sectionRootId: root, nodes };
}

function buildHeroSection() {
  const root = generateNodeId();
  const badge = generateNodeId();
  const headline = generateNodeId();
  const subtitle = generateNodeId();
  const btnRow = generateNodeId();
  const primaryBtn = generateNodeId();
  const secondaryBtn = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [badge, headline, subtitle, btnRow],
      { animation: 'bs-slideUp' },
      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', paddingTop: '96px', paddingBottom: '96px', paddingLeft: '48px', paddingRight: '48px', textAlign: 'center', width: '100%', minHeight: '520px' },
      { paddingTop: '64px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px' }
    ),
    [badge]: node('paragraph', badge, root, [],
      { text: '✨ Launching BuildStack 2.0' },
      { fontSize: '13px', color: '#4F46E5', backgroundColor: '#EEF2FF', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '14px', paddingRight: '14px', borderRadius: '999px', marginBottom: '24px', display: 'inline-block', fontWeight: '600' }
    ),
    [headline]: node('heading', headline, root, [],
      { text: 'Build production websites\nin record time' },
      { fontSize: '56px', fontWeight: '800', color: '#0F172A', marginBottom: '24px', textAlign: 'center', lineHeight: '1.15', letterSpacing: '-0.03em' },
      { fontSize: '36px' }
    ),
    [subtitle]: node('paragraph', subtitle, root, [],
      { text: 'Create clean, high-performing websites without touching a single line of code. Designed for modern creators and growth teams.' },
      { fontSize: '19px', color: '#64748B', marginBottom: '40px', textAlign: 'center', maxWidth: '640px', lineHeight: '1.6' },
      { fontSize: '16px' }
    ),
    [btnRow]: node('container', btnRow, root, [primaryBtn, secondaryBtn],
      {},
      { display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '0px', minHeight: '0px', border: 'none' },
      { flexDirection: 'column', width: '100%' }
    ),
    [primaryBtn]: node('button', primaryBtn, btnRow, [],
      { text: 'Start Building Free →', url: '#' },
      { backgroundColor: '#4F46E5', color: '#ffffff', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', marginBottom: '0px', display: 'inline-block', textAlign: 'center', border: 'none', textDecoration: 'none' },
      { width: '100%', textAlign: 'center' }
    ),
    [secondaryBtn]: node('button', secondaryBtn, btnRow, [],
      { text: 'Explore Templates', url: '#' },
      { backgroundColor: '#F1F5F9', color: '#334155', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '10px', fontSize: '16px', fontWeight: '600', marginBottom: '0px', display: 'inline-block', textAlign: 'center', border: 'none', textDecoration: 'none' },
      { width: '100%', textAlign: 'center' }
    ),
  };

  return { sectionRootId: root, nodes };
}

function buildDarkHeroSection() {
  const root = generateNodeId();
  const badge = generateNodeId();
  const headline = generateNodeId();
  const subtitle = generateNodeId();
  const btn = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [badge, headline, subtitle, btn],
      { animation: 'bs-fadeIn' },
      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', paddingTop: '100px', paddingBottom: '100px', paddingLeft: '48px', paddingRight: '48px', textAlign: 'center', width: '100%', minHeight: '520px' },
      { paddingTop: '64px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px' }
    ),
    [badge]: node('paragraph', badge, root, [],
      { text: '⚡ Next-Gen Website Builder' },
      { fontSize: '13px', color: '#38BDF8', backgroundColor: '#1E293B', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '14px', paddingRight: '14px', borderRadius: '999px', marginBottom: '24px', display: 'inline-block', fontWeight: '600' }
    ),
    [headline]: node('heading', headline, root, [],
      { text: 'Design fast. Publish faster.' },
      { fontSize: '58px', fontWeight: '800', color: '#F8FAFC', marginBottom: '24px', textAlign: 'center', lineHeight: '1.1', letterSpacing: '-0.03em' },
      { fontSize: '38px' }
    ),
    [subtitle]: node('paragraph', subtitle, root, [],
      { text: 'Empower your team with a no-code canvas built for speed, responsive design, and seamless publishing.' },
      { fontSize: '20px', color: '#94A3B8', marginBottom: '40px', textAlign: 'center', maxWidth: '620px', lineHeight: '1.6' }
    ),
    [btn]: node('button', btn, root, [],
      { text: 'Get Started Now →', url: '#' },
      { backgroundColor: '#0284C7', color: '#ffffff', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', marginBottom: '0px', display: 'inline-block', textAlign: 'center', border: 'none', textDecoration: 'none' }
    ),
  };

  return { sectionRootId: root, nodes };
}

function buildFeaturesSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const sub = generateNodeId();
  const grid = generateNodeId();

  const features = [
    { icon: '⚡', title: 'Lightning Speed', desc: 'Pre-rendered static HTML output guarantees instant page loads and 100/100 Lighthouse scores.' },
    { icon: '🎨', title: 'Drag & Drop Canvas', desc: 'Intelligent spatial resolver handles nested containers and component reordering effortlessly.' },
    { icon: '📱', title: 'Responsive Engine', desc: 'Seamless Desktop, Tablet, and Mobile viewport inheritance out of the box.' },
  ];

  const cardIds = features.map(() => generateNodeId());
  const iconIds = features.map(() => generateNodeId());
  const titleIds = features.map(() => generateNodeId());
  const descIds = features.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, sub, grid],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '48px', paddingRight: '48px', width: '100%', minHeight: '100px' },
      { paddingLeft: '24px', paddingRight: '24px', paddingTop: '60px', paddingBottom: '60px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Everything you need to launch' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' },
      { fontSize: '28px' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'BuildStack gives non-technical creators all the tools to build, design, and publish custom sites.' },
      { fontSize: '18px', color: '#64748B', marginBottom: '56px', textAlign: 'center', maxWidth: '580px' }
    ),
    [grid]: node('container', grid, root, cardIds,
      {},
      { display: 'flex', flexDirection: 'row', gap: '24px', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '0px', minHeight: '0px', border: 'none', width: '100%' },
      { flexDirection: 'column' }
    ),
  };

  features.forEach((f, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [iconIds[i], titleIds[i], descIds[i]],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', backgroundColor: '#FFFFFF', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.05)', flex: '1', minHeight: '100px', marginBottom: '0px' }
    );
    nodes[iconIds[i]] = node('heading', iconIds[i], cardIds[i], [],
      { text: f.icon },
      { fontSize: '36px', marginBottom: '16px' }
    );
    nodes[titleIds[i]] = node('heading', titleIds[i], cardIds[i], [],
      { text: f.title },
      { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }
    );
    nodes[descIds[i]] = node('paragraph', descIds[i], cardIds[i], [],
      { text: f.desc },
      { fontSize: '15px', color: '#64748B', marginBottom: '0px', lineHeight: '1.6' }
    );
  });

  return { sectionRootId: root, nodes };
}

function buildPricingSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const sub = generateNodeId();
  const grid = generateNodeId();

  const plans = [
    { title: 'Starter', price: '$0', desc: 'Free forever for personal websites and side projects.', btn: 'Get Started' },
    { title: 'Pro Plan', price: '$29', desc: 'Custom domains, unlimited pages, and instant HTML export.', btn: 'Start Free Trial', popular: true },
    { title: 'Agency', price: '$79', desc: 'Team collaboration, white-labeling, and dedicated support.', btn: 'Contact Sales' },
  ];

  const cardIds = plans.map(() => generateNodeId());
  const titleIds = plans.map(() => generateNodeId());
  const priceIds = plans.map(() => generateNodeId());
  const descIds = plans.map(() => generateNodeId());
  const btnIds = plans.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, sub, grid],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '48px', paddingRight: '48px', width: '100%', minHeight: '100px' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Simple, transparent pricing' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'Choose the plan that fits your growth. Upgrade or downgrade anytime.' },
      { fontSize: '18px', color: '#64748B', marginBottom: '56px', textAlign: 'center', maxWidth: '540px' }
    ),
    [grid]: node('container', grid, root, cardIds,
      {},
      { display: 'flex', flexDirection: 'row', gap: '24px', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '0px', minHeight: '0px', border: 'none', width: '100%' },
      { flexDirection: 'column' }
    ),
  };

  plans.forEach((p, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [titleIds[i], priceIds[i], descIds[i], btnIds[i]],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', backgroundColor: p.popular ? '#4F46E5' : '#FFFFFF', color: p.popular ? '#FFFFFF' : '#0F172A', paddingTop: '36px', paddingBottom: '36px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.08)', flex: '1', minHeight: '100px', marginBottom: '0px' }
    );
    nodes[titleIds[i]] = node('heading', titleIds[i], cardIds[i], [],
      { text: p.title },
      { fontSize: '20px', fontWeight: '700', color: p.popular ? '#FFFFFF' : '#0F172A', marginBottom: '12px' }
    );
    nodes[priceIds[i]] = node('heading', priceIds[i], cardIds[i], [],
      { text: `${p.price} / mo` },
      { fontSize: '36px', fontWeight: '800', color: p.popular ? '#FFFFFF' : '#0F172A', marginBottom: '12px' }
    );
    nodes[descIds[i]] = node('paragraph', descIds[i], cardIds[i], [],
      { text: p.desc },
      { fontSize: '14px', color: p.popular ? '#E0E7FF' : '#64748B', marginBottom: '32px', lineHeight: '1.6' }
    );
    nodes[btnIds[i]] = node('button', btnIds[i], cardIds[i], [],
      { text: p.btn, url: '#' },
      { backgroundColor: p.popular ? '#FFFFFF' : '#4F46E5', color: p.popular ? '#4F46E5' : '#FFFFFF', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', width: '100%', textAlign: 'center', display: 'inline-block', border: 'none', textDecoration: 'none' }
    );
  });

  return { sectionRootId: root, nodes };
}

function buildCtaSection() {
  const root = generateNodeId();
  const headline = generateNodeId();
  const sub = generateNodeId();
  const btn = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [headline, sub, btn],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4F46E5', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '48px', paddingRight: '48px', width: '100%', minHeight: '100px' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [headline]: node('heading', headline, root, [],
      { text: 'Ready to build your website?' },
      { fontSize: '40px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' },
      { fontSize: '28px' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'Join thousands of creators who build with BuildStack. Free forever for personal use.' },
      { fontSize: '18px', color: '#C7D2FE', marginBottom: '40px', textAlign: 'center', maxWidth: '500px' }
    ),
    [btn]: node('button', btn, root, [],
      { text: 'Create Your Website — Free', url: '#' },
      { backgroundColor: '#ffffff', color: '#4F46E5', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '10px', fontSize: '16px', fontWeight: '700', marginBottom: '0px', display: 'inline-block', textAlign: 'center', border: 'none', textDecoration: 'none' }
    ),
  };

  return { sectionRootId: root, nodes };
}

function buildTestimonialsSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const grid = generateNodeId();

  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Founder @ Acme Studio', quote: '"BuildStack helped us launch our portfolio in one afternoon. The templates and inline editing are unreal."', avatar: '👩' },
    { name: 'James Taylor', role: 'Product Lead @ TechFlow', quote: '"We built our landing page in minutes. No developer bottlenecks, just fast publishing."', avatar: '👨' },
    { name: 'Priya Patel', role: 'Indie Creator', quote: '"The cleanest website builder I have used. Zero code required, and static HTML export is seamless."', avatar: '👩‍💻' },
  ];

  const cardIds = testimonials.map(() => generateNodeId());
  const quoteIds = testimonials.map(() => generateNodeId());
  const nameIds = testimonials.map(() => generateNodeId());
  const roleIds = testimonials.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, grid],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '48px', paddingRight: '48px', width: '100%', minHeight: '100px' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Loved by creators & growth teams' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '48px', textAlign: 'center', letterSpacing: '-0.02em' },
      { fontSize: '28px' }
    ),
    [grid]: node('container', grid, root, cardIds,
      {},
      { display: 'flex', flexDirection: 'row', gap: '24px', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '0px', minHeight: '0px', border: 'none' },
      { flexDirection: 'column' }
    ),
  };

  testimonials.forEach((t, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [quoteIds[i], nameIds[i], roleIds[i]],
      {},
      { display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '16px', boxShadow: '0 4px 15px -2px rgb(0 0 0 / 0.05)', flex: '1', minHeight: '100px', marginBottom: '0px' }
    );
    nodes[quoteIds[i]] = node('paragraph', quoteIds[i], cardIds[i], [],
      { text: t.quote },
      { fontSize: '15px', color: '#334155', marginBottom: '24px', lineHeight: '1.7', fontStyle: 'italic' }
    );
    nodes[nameIds[i]] = node('heading', nameIds[i], cardIds[i], [],
      { text: `${t.avatar} ${t.name}` },
      { fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }
    );
    nodes[roleIds[i]] = node('paragraph', roleIds[i], cardIds[i], [],
      { text: t.role },
      { fontSize: '13px', color: '#94A3B8', marginBottom: '0px' }
    );
  });

  return { sectionRootId: root, nodes };
}

function buildFooterSection() {
  const root = generateNodeId();
  const top = generateNodeId();
  const brand = generateNodeId();
  const tagline = generateNodeId();
  const links = generateNodeId();
  const l1 = generateNodeId();
  const l2 = generateNodeId();
  const l3 = generateNodeId();
  const divider = generateNodeId();
  const copy = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [top, divider, copy],
      {},
      { display: 'flex', flexDirection: 'column', backgroundColor: '#0F172A', paddingTop: '64px', paddingBottom: '32px', paddingLeft: '48px', paddingRight: '48px', width: '100%', minHeight: '100px' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [top]: node('container', top, root, [brand, tagline, links],
      {},
      { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '48px', minHeight: '0px', border: 'none' },
      { flexDirection: 'column', gap: '32px' }
    ),
    [brand]: node('heading', brand, top, [],
      { text: 'MyBrand' },
      { fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '0px', letterSpacing: '-0.02em' }
    ),
    [tagline]: node('paragraph', tagline, top, [],
      { text: 'Empower creators to build the web without limits.' },
      { fontSize: '14px', color: '#94A3B8', marginBottom: '0px', maxWidth: '240px', lineHeight: '1.6' }
    ),
    [links]: node('container', links, top, [l1, l2, l3],
      {},
      { display: 'flex', flexDirection: 'row', gap: '32px', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '0px', minHeight: '0px', border: 'none' }
    ),
    [l1]: node('paragraph', l1, links, [], { text: 'Features' }, { fontSize: '14px', color: '#94A3B8', marginBottom: '0px', cursor: 'pointer' }),
    [l2]: node('paragraph', l2, links, [], { text: 'Pricing' },  { fontSize: '14px', color: '#94A3B8', marginBottom: '0px', cursor: 'pointer' }),
    [l3]: node('paragraph', l3, links, [], { text: 'Privacy' },  { fontSize: '14px', color: '#94A3B8', marginBottom: '0px', cursor: 'pointer' }),
    [divider]: node('spacer', divider, root, [], {}, { height: '1px', backgroundColor: '#1E293B', marginBottom: '32px', width: '100%' }),
    [copy]: node('paragraph', copy, root, [],
      { text: `© ${new Date().getFullYear()} MyBrand. All rights reserved.` },
      { fontSize: '13px', color: '#64748B', marginBottom: '0px', textAlign: 'center' }
    ),
  };

  return { sectionRootId: root, nodes };
}

function buildDarkGlassNavbarSection() {
  const root = generateNodeId();
  const logo = generateNodeId();
  const navLinks = generateNodeId();
  const link1 = generateNodeId();
  const link2 = generateNodeId();
  const link3 = generateNodeId();
  const cta = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [logo, navLinks, cta],
      {},
      { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#09090b', color: '#f4f4f5', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '48px', paddingRight: '48px', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '100%', minHeight: '64px' },
      { paddingLeft: '16px', paddingRight: '16px' }
    ),
    [logo]: node('heading', logo, root, [],
      { text: '✨ BuildStack' },
      { fontSize: '20px', fontWeight: '800', color: '#ffffff', marginBottom: '0px', letterSpacing: '-0.02em' }
    ),
    [navLinks]: node('container', navLinks, root, [link1, link2, link3],
      {},
      { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px', backgroundColor: 'transparent', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', marginBottom: '0px', minHeight: '0px', border: 'none' },
      { display: 'none' }
    ),
    [link1]: node('paragraph', link1, navLinks, [], { text: 'Product' }, { fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '0px', cursor: 'pointer' }),
    [link2]: node('paragraph', link2, navLinks, [], { text: 'Solutions' }, { fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '0px', cursor: 'pointer' }),
    [link3]: node('paragraph', link3, navLinks, [], { text: 'Pricing' }, { fontSize: '14px', fontWeight: '500', color: '#a1a1aa', marginBottom: '0px', cursor: 'pointer' }),
    [cta]: node('button', cta, root, [],
      { text: 'Launch App →', url: '#' },
      { backgroundColor: '#6366f1', color: '#ffffff', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '18px', paddingRight: '18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '0px', display: 'inline-block', textAlign: 'center', border: 'none', textDecoration: 'none' }
    ),
  };

  return { sectionRootId: root, nodes };
}

function buildSplitHeroSection() {
  const root = generateNodeId();
  const leftCol = generateNodeId();
  const rightCol = generateNodeId();
  const headline = generateNodeId();
  const subtitle = generateNodeId();
  const ctaBtn = generateNodeId();
  const imgNode = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [leftCol, rightCol],
      {},
      { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '48px', backgroundColor: '#ffffff', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '48px', paddingRight: '48px', width: '100%', minHeight: '480px' },
      { flexDirection: 'column', paddingLeft: '24px', paddingRight: '24px', paddingTop: '48px', paddingBottom: '48px' }
    ),
    [leftCol]: node('container', leftCol, root, [headline, subtitle, ctaBtn],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: '1', backgroundColor: 'transparent', minHeight: '0px', border: 'none' }
    ),
    [headline]: node('heading', headline, leftCol, [],
      { text: 'We Build High-Impact Web Products' },
      { fontSize: '44px', fontWeight: '800', color: '#0F172A', marginBottom: '20px', lineHeight: '1.2', letterSpacing: '-0.02em' }
    ),
    [subtitle]: node('paragraph', subtitle, leftCol, [],
      { text: 'Transform your brand with custom engineering, responsive canvases, and automated lead capture.' },
      { fontSize: '18px', color: '#64748B', marginBottom: '32px', lineHeight: '1.6' }
    ),
    [ctaBtn]: node('button', ctaBtn, leftCol, [],
      { text: 'Explore Showcase →', url: '#' },
      { backgroundColor: '#0284C7', color: '#ffffff', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', marginBottom: '0px', display: 'inline-block', border: 'none' }
    ),
    [rightCol]: node('container', rightCol, root, [imgNode],
      {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1', backgroundColor: 'transparent', minHeight: '0px', border: 'none' }
    ),
    [imgNode]: node('image', imgNode, rightCol, [],
      { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80', alt: 'Showcase Workspace' },
      { width: '100%', height: 'auto', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)' }
    ),
  };

  return { sectionRootId: root, nodes };
}

// ─── NEW TEMPLATE FUNCTIONS ──────────────────────────────────────────────────

function buildStatsSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const grid = generateNodeId();
  const stats = [
    { number: '10,000+', label: 'Active Websites' },
    { number: '98%', label: 'Customer Satisfaction' },
    { number: '4.9★', label: 'Average Rating' },
    { number: '$2.4M', label: 'Revenue Generated' },
  ];
  const cardIds = stats.map(() => generateNodeId());
  const numIds = stats.map(() => generateNodeId());
  const labelIds = stats.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, grid], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Trusted by thousands of creators worldwide' },
      { fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '48px', textAlign: 'center', letterSpacing: '-0.02em', maxWidth: '600px' }
    ),
    [grid]: node('container', grid, root, cardIds, {},
      { display: 'flex', flexDirection: 'row', gap: '32px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none', width: '100%', justifyContent: 'center', flexWrap: 'wrap' },
      { flexDirection: 'column', alignItems: 'center' }
    ),
  };
  stats.forEach((s, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [numIds[i], labelIds[i]], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '16px', flex: '1', minWidth: '160px', minHeight: '0', marginBottom: '0' }
    );
    nodes[numIds[i]] = node('heading', numIds[i], cardIds[i], [],
      { text: s.number },
      { fontSize: '40px', fontWeight: '900', color: '#4F46E5', marginBottom: '8px' }
    );
    nodes[labelIds[i]] = node('paragraph', labelIds[i], cardIds[i], [],
      { text: s.label },
      { fontSize: '14px', color: '#64748B', marginBottom: '0', fontWeight: '500', textAlign: 'center' }
    );
  });
  return { sectionRootId: root, nodes };
}

function buildHowItWorksSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const sub = generateNodeId();
  const grid = generateNodeId();
  const steps = [
    { num: '01', title: 'Choose Your Template', desc: 'Pick from 30+ professionally designed section templates tailored to your industry.' },
    { num: '02', title: 'Customize With Ease', desc: 'Drag, drop, resize and restyle every element with our intuitive visual canvas.' },
    { num: '03', title: 'Publish Instantly', desc: 'One click exports clean, SEO-optimized static HTML ready for any hosting platform.' },
  ];
  const cardIds = steps.map(() => generateNodeId());
  const numIds = steps.map(() => generateNodeId());
  const titleIds = steps.map(() => generateNodeId());
  const descIds = steps.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, sub, grid], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'From idea to live website in 3 steps' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'No coding. No designers. No waiting.' },
      { fontSize: '18px', color: '#64748B', marginBottom: '56px', textAlign: 'center' }
    ),
    [grid]: node('container', grid, root, cardIds, {},
      { display: 'flex', flexDirection: 'row', gap: '32px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none', width: '100%' },
      { flexDirection: 'column' }
    ),
  };
  steps.forEach((s, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [numIds[i], titleIds[i], descIds[i]], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', backgroundColor: '#ffffff', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)', flex: '1', minHeight: '0', marginBottom: '0' }
    );
    nodes[numIds[i]] = node('heading', numIds[i], cardIds[i], [],
      { text: s.num },
      { fontSize: '48px', fontWeight: '900', color: '#E0E7FF', marginBottom: '16px', lineHeight: '1' }
    );
    nodes[titleIds[i]] = node('heading', titleIds[i], cardIds[i], [],
      { text: s.title },
      { fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }
    );
    nodes[descIds[i]] = node('paragraph', descIds[i], cardIds[i], [],
      { text: s.desc },
      { fontSize: '15px', color: '#64748B', marginBottom: '0', lineHeight: '1.65' }
    );
  });
  return { sectionRootId: root, nodes };
}

function buildFaqSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const sub = generateNodeId();
  const list = generateNodeId();
  const faqs = [
    { q: 'Do I need to know how to code?', a: 'Absolutely not. BuildStack is designed for non-technical creators. Everything is visual and drag-and-drop.' },
    { q: 'Can I export my website as static HTML?', a: 'Yes! Every site you build can be exported as a clean ZIP file containing HTML, CSS, and JavaScript.' },
    { q: 'Is there a free plan?', a: 'Yes. The Starter plan is free forever for personal websites and side projects with no credit card required.' },
    { q: 'Can I use a custom domain?', a: 'Custom domains are available on the Pro and Agency plans. You can connect any domain you own.' },
  ];
  const itemIds = faqs.map(() => generateNodeId());
  const qIds = faqs.map(() => generateNodeId());
  const aIds = faqs.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, sub, list], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Frequently asked questions' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: "Can't find the answer you're looking for? Reach out to our support team." },
      { fontSize: '18px', color: '#64748B', marginBottom: '56px', textAlign: 'center' }
    ),
    [list]: node('container', list, root, itemIds, {},
      { display: 'flex', flexDirection: 'column', gap: '0', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none', width: '100%', maxWidth: '720px' },
    ),
  };
  faqs.forEach((f, i) => {
    nodes[itemIds[i]] = node('container', itemIds[i], list, [qIds[i], aIds[i]], {},
      { display: 'flex', flexDirection: 'column', backgroundColor: 'transparent', paddingTop: '24px', paddingBottom: '24px', paddingLeft: '0', paddingRight: '0', borderBottom: '1px solid #E2E8F0', minHeight: '0', marginBottom: '0' }
    );
    nodes[qIds[i]] = node('heading', qIds[i], itemIds[i], [],
      { text: f.q },
      { fontSize: '17px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }
    );
    nodes[aIds[i]] = node('paragraph', aIds[i], itemIds[i], [],
      { text: f.a },
      { fontSize: '15px', color: '#64748B', marginBottom: '0', lineHeight: '1.7' }
    );
  });
  return { sectionRootId: root, nodes };
}

function buildTeamSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const sub = generateNodeId();
  const grid = generateNodeId();
  const team = [
    { name: 'Alex Morgan', role: 'CEO & Co-Founder', avatar: '👨‍💼', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { name: 'Priya Singh', role: 'Head of Design', avatar: '👩‍🎨', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
    { name: 'James Lee', role: 'Lead Engineer', avatar: '👨‍💻', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  ];
  const cardIds = team.map(() => generateNodeId());
  const imgIds = team.map(() => generateNodeId());
  const nameIds = team.map(() => generateNodeId());
  const roleIds = team.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, sub, grid], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Meet the team' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'Passionate builders dedicated to making the web more accessible.' },
      { fontSize: '18px', color: '#64748B', marginBottom: '56px', textAlign: 'center' }
    ),
    [grid]: node('container', grid, root, cardIds, {},
      { display: 'flex', flexDirection: 'row', gap: '32px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none' },
      { flexDirection: 'column', alignItems: 'center' }
    ),
  };
  team.forEach((t, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [imgIds[i], nameIds[i], roleIds[i]], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '20px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)', flex: '1', minHeight: '0', marginBottom: '0', textAlign: 'center' }
    );
    nodes[imgIds[i]] = node('image', imgIds[i], cardIds[i], [],
      { src: t.img, alt: t.name },
      { width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }
    );
    nodes[nameIds[i]] = node('heading', nameIds[i], cardIds[i], [],
      { text: t.name },
      { fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }
    );
    nodes[roleIds[i]] = node('paragraph', roleIds[i], cardIds[i], [],
      { text: t.role },
      { fontSize: '14px', color: '#6366f1', marginBottom: '0', fontWeight: '600' }
    );
  });
  return { sectionRootId: root, nodes };
}

function buildNewsletterSection() {
  const root = generateNodeId();
  const headline = generateNodeId();
  const sub = generateNodeId();
  const formRow = generateNodeId();
  const emailInput = generateNodeId();
  const btn = generateNodeId();
  const note = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [headline, sub, formRow, note], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0F172A', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [headline]: node('heading', headline, root, [],
      { text: 'Stay in the loop' },
      { fontSize: '40px', fontWeight: '800', color: '#ffffff', marginBottom: '12px', textAlign: 'center', letterSpacing: '-0.02em' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'Get the latest news, templates, and design tips delivered to your inbox every week.' },
      { fontSize: '17px', color: '#94A3B8', marginBottom: '36px', textAlign: 'center', maxWidth: '480px' }
    ),
    [formRow]: node('container', formRow, root, [emailInput, btn], {},
      { display: 'flex', flexDirection: 'row', gap: '12px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '16px', minHeight: '0', border: 'none', maxWidth: '520px', width: '100%' },
      { flexDirection: 'column', width: '100%' }
    ),
    [emailInput]: node('paragraph', emailInput, formRow, [],
      { text: '📧 you@example.com' },
      { fontSize: '15px', color: '#94A3B8', backgroundColor: '#1E293B', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '10px', marginBottom: '0', flex: '1', border: '1px solid rgba(255,255,255,0.1)' }
    ),
    [btn]: node('button', btn, formRow, [],
      { text: 'Subscribe', url: '#' },
      { backgroundColor: '#6366f1', color: '#ffffff', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', marginBottom: '0', display: 'inline-block', border: 'none', whiteSpace: 'nowrap' }
    ),
    [note]: node('paragraph', note, root, [],
      { text: 'No spam ever. Unsubscribe with 1 click.' },
      { fontSize: '12px', color: '#475569', marginBottom: '0', textAlign: 'center' }
    ),
  };
  return { sectionRootId: root, nodes };
}

function buildPortfolioGallerySection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const sub = generateNodeId();
  const grid = generateNodeId();
  const photos = [
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80',
  ];
  const imgIds = photos.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, sub, grid], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Selected Work' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'A curated collection of projects we are most proud of.' },
      { fontSize: '18px', color: '#64748B', marginBottom: '48px', textAlign: 'center' }
    ),
    [grid]: node('container', grid, root, imgIds, {},
      { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none', width: '100%' }
    ),
  };
  photos.forEach((src, i) => {
    nodes[imgIds[i]] = node('image', imgIds[i], grid, [],
      { src, alt: `Portfolio work ${i + 1}` },
      { width: 'calc(33.333% - 14px)', height: '240px', objectFit: 'cover', borderRadius: '12px', flexShrink: '0' }
    );
  });
  return { sectionRootId: root, nodes };
}

function buildProductShowcaseSection() {
  const root = generateNodeId();
  const left = generateNodeId();
  const right = generateNodeId();
  const badge = generateNodeId();
  const headline = generateNodeId();
  const desc = generateNodeId();
  const features = generateNodeId();
  const feat1 = generateNodeId();
  const feat2 = generateNodeId();
  const feat3 = generateNodeId();
  const btn = generateNodeId();
  const img = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [left, right], {},
      { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '64px', backgroundColor: '#0F172A', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '64px', paddingRight: '64px', width: '100%' },
      { flexDirection: 'column', paddingLeft: '24px', paddingRight: '24px', paddingTop: '48px', paddingBottom: '48px' }
    ),
    [left]: node('container', left, root, [badge, headline, desc, features, btn], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: '1', backgroundColor: 'transparent', minHeight: '0', border: 'none' }
    ),
    [badge]: node('paragraph', badge, left, [],
      { text: '🛍️ NEW PRODUCT' },
      { fontSize: '11px', fontWeight: '700', color: '#818cf8', backgroundColor: '#312e81', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '999px', marginBottom: '20px', display: 'inline-block', letterSpacing: '0.08em' }
    ),
    [headline]: node('heading', headline, left, [],
      { text: 'The Product Your Customers Will Love' },
      { fontSize: '40px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-0.02em' }
    ),
    [desc]: node('paragraph', desc, left, [],
      { text: 'High-quality craftsmanship, intuitive design, and seamless performance. Everything you need in one package.' },
      { fontSize: '17px', color: '#94A3B8', marginBottom: '28px', lineHeight: '1.65' }
    ),
    [features]: node('container', features, left, [feat1, feat2, feat3], {},
      { display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '36px', minHeight: '0', border: 'none' }
    ),
    [feat1]: node('paragraph', feat1, features, [], { text: '✓  Free shipping on all orders over $50' }, { fontSize: '14px', color: '#CBD5E1', marginBottom: '0' }),
    [feat2]: node('paragraph', feat2, features, [], { text: '✓  30-day hassle-free return policy' }, { fontSize: '14px', color: '#CBD5E1', marginBottom: '0' }),
    [feat3]: node('paragraph', feat3, features, [], { text: '✓  2-year manufacturer warranty included' }, { fontSize: '14px', color: '#CBD5E1', marginBottom: '0' }),
    [btn]: node('button', btn, left, [],
      { text: 'Shop Now →', url: '#' },
      { backgroundColor: '#6366f1', color: '#ffffff', paddingTop: '14px', paddingBottom: '14px', paddingLeft: '28px', paddingRight: '28px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', marginBottom: '0', display: 'inline-block', border: 'none' }
    ),
    [right]: node('container', right, root, [img], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1', backgroundColor: 'transparent', minHeight: '0', border: 'none' }
    ),
    [img]: node('image', img, right, [],
      { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', alt: 'Product' },
      { width: '100%', height: 'auto', borderRadius: '20px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)' }
    ),
  };
  return { sectionRootId: root, nodes };
}

function buildTrustBadgesSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const grid = generateNodeId();
  const badges = [
    { icon: '🔒', title: 'SSL Secured', desc: 'End-to-end encrypted checkout' },
    { icon: '↩️', title: '30-Day Returns', desc: 'No questions asked guarantee' },
    { icon: '🚚', title: 'Free Shipping', desc: 'On all orders over $50' },
    { icon: '💳', title: 'Secure Payment', desc: 'Visa, Mastercard, PayPal accepted' },
  ];
  const cardIds = badges.map(() => generateNodeId());
  const iconIds = badges.map(() => generateNodeId());
  const titleIds = badges.map(() => generateNodeId());
  const descIds = badges.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, grid], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC', paddingTop: '48px', paddingBottom: '48px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [],
      { text: 'Shop With Confidence' },
      { fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '32px', textAlign: 'center' }
    ),
    [grid]: node('container', grid, root, cardIds, {},
      { display: 'flex', flexDirection: 'row', gap: '24px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none', flexWrap: 'wrap', justifyContent: 'center' },
      { flexDirection: 'column', alignItems: 'center' }
    ),
  };
  badges.forEach((b, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [iconIds[i], titleIds[i], descIds[i]], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', paddingTop: '28px', paddingBottom: '28px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '180px', flex: '1', minHeight: '0', marginBottom: '0', textAlign: 'center' }
    );
    nodes[iconIds[i]] = node('heading', iconIds[i], cardIds[i], [], { text: b.icon }, { fontSize: '32px', marginBottom: '12px' });
    nodes[titleIds[i]] = node('heading', titleIds[i], cardIds[i], [], { text: b.title }, { fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' });
    nodes[descIds[i]] = node('paragraph', descIds[i], cardIds[i], [], { text: b.desc }, { fontSize: '13px', color: '#64748B', marginBottom: '0' });
  });
  return { sectionRootId: root, nodes };
}

function buildBlogGridSection() {
  const root = generateNodeId();
  const header = generateNodeId();
  const sub = generateNodeId();
  const grid = generateNodeId();
  const posts = [
    { cat: 'Design', title: '10 Web Design Trends Dominating 2025', date: 'Aug 5, 2025', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80' },
    { cat: 'Business', title: 'How to Launch a Side Project Without Code', date: 'Jul 28, 2025', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80' },
    { cat: 'Tutorial', title: 'The Ultimate Guide to Website Performance', date: 'Jul 15, 2025', img: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80' },
  ];
  const cardIds = posts.map(() => generateNodeId());
  const imgIds = posts.map(() => generateNodeId());
  const catIds = posts.map(() => generateNodeId());
  const titleIds = posts.map(() => generateNodeId());
  const dateIds = posts.map(() => generateNodeId());

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [header, sub, grid], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '48px', paddingRight: '48px', width: '100%' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [header]: node('heading', header, root, [], { text: 'From Our Blog' },
      { fontSize: '40px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', textAlign: 'center', letterSpacing: '-0.02em' }
    ),
    [sub]: node('paragraph', sub, root, [], { text: 'Insights, tutorials, and updates from the BuildStack team.' },
      { fontSize: '18px', color: '#64748B', marginBottom: '56px', textAlign: 'center' }
    ),
    [grid]: node('container', grid, root, cardIds, {},
      { display: 'flex', flexDirection: 'row', gap: '28px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none', width: '100%' },
      { flexDirection: 'column' }
    ),
  };
  posts.forEach((p, i) => {
    nodes[cardIds[i]] = node('container', cardIds[i], grid, [imgIds[i], catIds[i], titleIds[i], dateIds[i]], {},
      { display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', borderRadius: '16px', overflow: 'hidden', flex: '1', minHeight: '0', marginBottom: '0' }
    );
    nodes[imgIds[i]] = node('image', imgIds[i], cardIds[i], [],
      { src: p.img, alt: p.title },
      { width: '100%', height: '200px', objectFit: 'cover' }
    );
    nodes[catIds[i]] = node('paragraph', catIds[i], cardIds[i], [],
      { text: p.cat.toUpperCase() },
      { fontSize: '11px', fontWeight: '700', color: '#4F46E5', marginBottom: '8px', marginTop: '20px', paddingLeft: '20px', paddingRight: '20px', letterSpacing: '0.08em' }
    );
    nodes[titleIds[i]] = node('heading', titleIds[i], cardIds[i], [],
      { text: p.title },
      { fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', paddingLeft: '20px', paddingRight: '20px', lineHeight: '1.4' }
    );
    nodes[dateIds[i]] = node('paragraph', dateIds[i], cardIds[i], [],
      { text: p.date },
      { fontSize: '13px', color: '#94A3B8', marginBottom: '20px', paddingLeft: '20px', paddingRight: '20px' }
    );
  });
  return { sectionRootId: root, nodes };
}

function buildContactSectionWithForm() {
  const root = generateNodeId();
  const left = generateNodeId();
  const right = generateNodeId();
  const headline = generateNodeId();
  const sub = generateNodeId();
  const infoRow1 = generateNodeId();
  const infoRow2 = generateNodeId();
  const infoRow3 = generateNodeId();
  const formTitle = generateNodeId();
  const formNode = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [left, right], {},
      { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '64px', backgroundColor: '#F8FAFC', paddingTop: '88px', paddingBottom: '88px', paddingLeft: '64px', paddingRight: '64px', width: '100%' },
      { flexDirection: 'column', paddingLeft: '24px', paddingRight: '24px', paddingTop: '48px', paddingBottom: '48px' }
    ),
    [left]: node('container', left, root, [headline, sub, infoRow1, infoRow2, infoRow3], {},
      { display: 'flex', flexDirection: 'column', flex: '1', backgroundColor: 'transparent', minHeight: '0', border: 'none' }
    ),
    [headline]: node('heading', headline, left, [], { text: "Let's start a conversation" },
      { fontSize: '36px', fontWeight: '800', color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: '1.25' }
    ),
    [sub]: node('paragraph', sub, left, [], { text: "Have a project in mind? We'd love to hear about it. Send us a message and we'll get back within 24 hours." },
      { fontSize: '16px', color: '#64748B', marginBottom: '40px', lineHeight: '1.65' }
    ),
    [infoRow1]: node('paragraph', infoRow1, left, [], { text: '📧  hello@yourcompany.com' }, { fontSize: '15px', color: '#334155', marginBottom: '14px', fontWeight: '500' }),
    [infoRow2]: node('paragraph', infoRow2, left, [], { text: '📞  +1 (555) 000-0000' }, { fontSize: '15px', color: '#334155', marginBottom: '14px', fontWeight: '500' }),
    [infoRow3]: node('paragraph', infoRow3, left, [], { text: '📍  123 Main St, San Francisco, CA 94101' }, { fontSize: '15px', color: '#334155', marginBottom: '0', fontWeight: '500' }),
    [right]: node('container', right, root, [formTitle, formNode], {},
      { display: 'flex', flexDirection: 'column', flex: '1', backgroundColor: '#ffffff', paddingTop: '40px', paddingBottom: '40px', paddingLeft: '40px', paddingRight: '40px', borderRadius: '20px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)', minHeight: '0', border: 'none' }
    ),
    [formTitle]: node('heading', formTitle, right, [], { text: 'Send us a message' },
      { fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '24px' }
    ),
    [formNode]: node('form', formNode, right, [],
      { buttonText: 'Send Message →', successMessage: '✓ Thank you! Your message has been sent successfully.' },
      { width: '100%', backgroundColor: '#ffffff', border: 'none', boxShadow: 'none', padding: '0px' }
    ),
  };
  return { sectionRootId: root, nodes };
}

function buildGradientHeroSection() {
  const root = generateNodeId();
  const badge = generateNodeId();
  const headline = generateNodeId();
  const sub = generateNodeId();
  const btnRow = generateNodeId();
  const btn1 = generateNodeId();
  const btn2 = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [badge, headline, sub, btnRow], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)', paddingTop: '100px', paddingBottom: '100px', paddingLeft: '48px', paddingRight: '48px', textAlign: 'center', width: '100%', minHeight: '520px' },
      { paddingTop: '64px', paddingBottom: '64px', paddingLeft: '24px', paddingRight: '24px' }
    ),
    [badge]: node('paragraph', badge, root, [],
      { text: '🎨 Visual-first Design System' },
      { fontSize: '13px', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.15)', paddingTop: '6px', paddingBottom: '6px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '999px', marginBottom: '28px', display: 'inline-block', fontWeight: '600', backdropFilter: 'blur(10px)' }
    ),
    [headline]: node('heading', headline, root, [],
      { text: 'Create Beautiful Websites That Convert' },
      { fontSize: '58px', fontWeight: '900', color: '#ffffff', marginBottom: '24px', textAlign: 'center', lineHeight: '1.1', letterSpacing: '-0.03em' },
      { fontSize: '36px' }
    ),
    [sub]: node('paragraph', sub, root, [],
      { text: 'Pixel-perfect no-code builder for designers who want full creative freedom without engineering constraints.' },
      { fontSize: '19px', color: 'rgba(255,255,255,0.85)', marginBottom: '48px', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }
    ),
    [btnRow]: node('container', btnRow, root, [btn1, btn2], {},
      { display: 'flex', flexDirection: 'row', gap: '16px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none', justifyContent: 'center' },
      { flexDirection: 'column', width: '100%' }
    ),
    [btn1]: node('button', btn1, btnRow, [],
      { text: 'Start for Free →', url: '#' },
      { backgroundColor: '#ffffff', color: '#4F46E5', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', display: 'inline-block', border: 'none' }
    ),
    [btn2]: node('button', btn2, btnRow, [],
      { text: 'Watch Demo', url: '#' },
      { backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)' }
    ),
  };
  return { sectionRootId: root, nodes };
}

function buildAgencyBoldHeroSection() {
  const root = generateNodeId();
  const tag = generateNodeId();
  const headline = generateNodeId();
  const btnRow = generateNodeId();
  const btn = generateNodeId();
  const scroll = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [tag, headline, btnRow, scroll], {},
      { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', backgroundColor: '#ffffff', paddingTop: '120px', paddingBottom: '120px', paddingLeft: '80px', paddingRight: '48px', width: '100%', minHeight: '600px', borderBottom: '1px solid #E2E8F0' },
      { paddingLeft: '24px', paddingRight: '24px', paddingTop: '72px', paddingBottom: '72px' }
    ),
    [tag]: node('paragraph', tag, root, [],
      { text: '— DIGITAL AGENCY' },
      { fontSize: '12px', fontWeight: '700', color: '#94A3B8', marginBottom: '24px', letterSpacing: '0.12em' }
    ),
    [headline]: node('heading', headline, root, [],
      { text: 'We Build Digital Experiences That Move People.' },
      { fontSize: '72px', fontWeight: '900', color: '#0F172A', marginBottom: '48px', lineHeight: '1.0', letterSpacing: '-0.04em', maxWidth: '800px' },
      { fontSize: '40px' }
    ),
    [btnRow]: node('container', btnRow, root, [btn], {},
      { display: 'flex', flexDirection: 'row', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '64px', minHeight: '0', border: 'none' }
    ),
    [btn]: node('button', btn, btnRow, [],
      { text: 'See Our Work →', url: '#' },
      { backgroundColor: '#0F172A', color: '#ffffff', paddingTop: '16px', paddingBottom: '16px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '4px', fontSize: '15px', fontWeight: '700', display: 'inline-block', border: 'none', letterSpacing: '0.02em' }
    ),
    [scroll]: node('paragraph', scroll, root, [],
      { text: '↓ Scroll to explore' },
      { fontSize: '12px', color: '#CBD5E1', marginBottom: '0', letterSpacing: '0.08em' }
    ),
  };
  return { sectionRootId: root, nodes };
}

function buildLightMinimalFooter() {
  const root = generateNodeId();
  const top = generateNodeId();
  const brand = generateNodeId();
  const links = generateNodeId();
  const l1 = generateNodeId(); const l2 = generateNodeId(); const l3 = generateNodeId(); const l4 = generateNodeId();
  const divider = generateNodeId();
  const copy = generateNodeId();

  const nodes: Record<string, BuilderNode> = {
    [root]: node('container', root, null, [top, divider, copy], {},
      { display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', paddingTop: '48px', paddingBottom: '32px', paddingLeft: '48px', paddingRight: '48px', width: '100%', borderTop: '1px solid #E2E8F0' },
      { paddingLeft: '24px', paddingRight: '24px' }
    ),
    [top]: node('container', top, root, [brand, links], {},
      { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '32px', minHeight: '0', border: 'none' },
      { flexDirection: 'column', gap: '24px' }
    ),
    [brand]: node('heading', brand, top, [], { text: 'YourBrand' },
      { fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '0', letterSpacing: '-0.02em' }
    ),
    [links]: node('container', links, top, [l1, l2, l3, l4], {},
      { display: 'flex', flexDirection: 'row', gap: '32px', backgroundColor: 'transparent', paddingTop: '0', paddingBottom: '0', paddingLeft: '0', paddingRight: '0', marginBottom: '0', minHeight: '0', border: 'none' }
    ),
    [l1]: node('paragraph', l1, links, [], { text: 'About' }, { fontSize: '14px', color: '#64748B', marginBottom: '0', cursor: 'pointer' }),
    [l2]: node('paragraph', l2, links, [], { text: 'Blog' }, { fontSize: '14px', color: '#64748B', marginBottom: '0', cursor: 'pointer' }),
    [l3]: node('paragraph', l3, links, [], { text: 'Careers' }, { fontSize: '14px', color: '#64748B', marginBottom: '0', cursor: 'pointer' }),
    [l4]: node('paragraph', l4, links, [], { text: 'Contact' }, { fontSize: '14px', color: '#64748B', marginBottom: '0', cursor: 'pointer' }),
    [divider]: node('spacer', divider, root, [], {}, { height: '1px', backgroundColor: '#E2E8F0', marginBottom: '24px', width: '100%' }),
    [copy]: node('paragraph', copy, root, [],
      { text: `© ${new Date().getFullYear()} YourBrand. All rights reserved.` },
      { fontSize: '13px', color: '#94A3B8', marginBottom: '0', textAlign: 'center' }
    ),
  };
  return { sectionRootId: root, nodes };
}

// ─── EXPORTED TEMPLATE REGISTRY ─────────────────────────────────────────────

const RAW_SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'navbar',
    name: 'Navbar (Light Minimal)',
    description: 'White navbar with brand logo, nav links, and Indigo CTA',
    category: 'navigation',
    thumbnail: '🧭',
    build: buildNavbarSection,
  },
  {
    id: 'navbar-dark',
    name: 'Navbar (Dark Glass)',
    description: 'Sleek dark mode navbar with subtle glass border',
    category: 'navigation',
    thumbnail: '🌙',
    build: buildDarkGlassNavbarSection,
  },
  // ── Hero ──
  {
    id: 'hero',
    name: 'Modern Hero (Centered)',
    description: 'Bold headline, subtitle, and primary/secondary CTA buttons',
    category: 'hero',
    thumbnail: '🚀',
    build: buildHeroSection,
  },
  {
    id: 'hero-dark',
    name: 'Dark SaaS Hero',
    description: 'Dark mode hero section with cyan highlight badge',
    category: 'hero',
    thumbnail: '✨',
    build: buildDarkHeroSection,
  },
  {
    id: 'hero-split',
    name: 'Split Image Hero',
    description: 'Two-column hero with left text and right image showcase',
    category: 'hero',
    thumbnail: '🖼️',
    build: buildSplitHeroSection,
  },
  {
    id: 'hero-gradient',
    name: 'Gradient Mesh Hero',
    description: 'Full-bleed indigo→violet→pink gradient hero with glass badge',
    category: 'hero',
    thumbnail: '🌈',
    build: buildGradientHeroSection,
  },
  {
    id: 'hero-agency-bold',
    name: 'Agency Bold Hero',
    description: 'Massive left-aligned typographic hero for creative agencies',
    category: 'hero',
    thumbnail: '🔥',
    build: buildAgencyBoldHeroSection,
  },
  // ── Content ──
  {
    id: 'features',
    name: 'Feature Grid (3-Col)',
    description: 'Three-column feature cards with subtle ambient shadows',
    category: 'content',
    thumbnail: '⚡',
    build: buildFeaturesSection,
  },
  {
    id: 'pricing',
    name: 'Pricing Table (3-Tier)',
    description: 'Three pricing tiers with popular plan highlighted',
    category: 'content',
    thumbnail: '💳',
    build: buildPricingSection,
  },
  {
    id: 'testimonials',
    name: 'Testimonials Grid',
    description: 'Three customer review cards with avatars and quotes',
    category: 'content',
    thumbnail: '💬',
    build: buildTestimonialsSection,
  },
  {
    id: 'cta',
    name: 'CTA Banner',
    description: 'Full-width indigo call-to-action banner',
    category: 'content',
    thumbnail: '📣',
    build: buildCtaSection,
  },
  {
    id: 'stats',
    name: 'Stats / Numbers Row',
    description: '4 key business metrics displayed in bold stat cards',
    category: 'content',
    thumbnail: '📊',
    build: buildStatsSection,
  },
  {
    id: 'how-it-works',
    name: 'How It Works (3-Step)',
    description: 'Numbered steps explaining your product or process',
    category: 'content',
    thumbnail: '🔢',
    build: buildHowItWorksSection,
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    description: 'Frequently asked questions in a clean accordion-style list',
    category: 'content',
    thumbnail: '❓',
    build: buildFaqSection,
  },
  // ── E-Commerce ──
  {
    id: 'product-hero',
    name: 'Product Showcase (Split)',
    description: 'Product image on left, title, price badge, specs & Buy Now CTA on right',
    category: 'ecommerce',
    thumbnail: '🛍️',
    build: buildProductShowcaseSection,
  },
  {
    id: 'product-grid-4',
    name: 'Product Grid (4 Cards)',
    description: 'Section header + 4 item cards with badges, prices, and Add to Cart buttons',
    category: 'ecommerce',
    thumbnail: '🏷️',
    build: buildProductGridSection,
  },
  // ── Blog ──
  {
    id: 'blog-3col',
    name: 'Blog Grid (3 Articles)',
    description: 'Header + 3 article cards with category pills, dates, titles & Read More links',
    category: 'blog',
    thumbnail: '📰',
    build: buildBlogGridSection,
  },
  // ── Contact ──
  {
    id: 'contact-form',
    name: 'Contact Form + Info',
    description: 'Split contact section with info on left and form card on right',
    category: 'contact',
    thumbnail: '✉️',
    build: buildContactSectionWithForm,
  },
  // ── Footer ──
  {
    id: 'footer',
    name: 'Footer (Dark Studio)',
    description: 'Dark slate footer with logo, links, and copyright',
    category: 'footer',
    thumbnail: '🌑',
    build: buildFooterSection,
  },
  {
    id: 'footer-light',
    name: 'Footer (Light Minimal)',
    description: 'Clean white footer with brand, nav links, and copyright',
    category: 'footer',
    thumbnail: '☀️',
    build: buildLightMinimalFooter,
  },
];

export const SECTION_TEMPLATES: SectionTemplate[] = RAW_SECTION_TEMPLATES.map((t) => ({
  ...t,
  build: (theme?: any) => {
    const res = t.build(theme);
    return {
      ...res,
      nodes: applyThemeToNodes(res.nodes, theme),
    };
  },
}));

// ─── FULL STARTER SITE TEMPLATES ──────────────────────────────────────────────
export function createStarterSiteTemplate(templateId: string): { rootNodeId: string; nodes: Record<string, BuilderNode> } {
  const rootId = generateNodeId();
  const isDarkTheme = templateId === 'saas';

  const rootNode: BuilderNode = {
    id: rootId,
    type: 'root',
    parentId: null,
    children: [],
    content: {},
    style: {
      desktop: {
        minHeight: '100%',
        width: '100%',
        backgroundColor: isDarkTheme ? '#09090b' : '#ffffff',
        color: isDarkTheme ? '#f4f4f5' : '#18181b',
        display: 'flex',
        flexDirection: 'column',
      },
      tablet: {},
      mobile: {},
    },
    settings: {},
  };

  const allNodes: Record<string, BuilderNode> = { [rootId]: rootNode };

  let sectionsToBuild: Array<() => { sectionRootId: string; nodes: Record<string, BuilderNode> }> = [];

  if (templateId === 'saas') {
    sectionsToBuild = [
      buildNavbarSection,
      buildDarkHeroSection,
      buildFeaturesSection,
      buildTestimonialsSection,
      buildPricingSection,
      buildCtaSection,
      buildFooterSection,
    ];
  } else if (templateId === 'agency') {
    sectionsToBuild = [
      buildNavbarSection,
      buildHeroSection,
      buildFeaturesSection,
      buildTestimonialsSection,
      buildFooterSection,
    ];
  } else if (templateId === 'store') {
    sectionsToBuild = [
      buildNavbarSection,
      buildHeroSection,
      buildPricingSection,
      buildCtaSection,
      buildFooterSection,
    ];
  }

  sectionsToBuild.forEach((builderFn) => {
    const { sectionRootId, nodes: sectionNodes } = builderFn();
    // Reparent sectionRootId under rootNode
    sectionNodes[sectionRootId].parentId = rootId;
    rootNode.children.push(sectionRootId);

    // Merge nodes into allNodes map
    Object.assign(allNodes, sectionNodes);
  });

  return { rootNodeId: rootId, nodes: allNodes };
}

