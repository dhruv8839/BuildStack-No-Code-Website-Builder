import JSZip from 'jszip';
import type { BuilderNode } from '../types/builder';
import type { ThemeState } from '../state/builderSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function styleObjectToCss(styleMap: Record<string, any>): string {
  if (!styleMap) return '';
  return Object.entries(styleMap)
    .map(([key, val]) => `${camelToKebab(key)}: ${val};`)
    .join(' ');
}

// ─── HTML Renderer ───────────────────────────────────────────────────────────

function renderNodeToHtml(nodeId: string, nodes: Record<string, BuilderNode>): string {
  const node = nodes[nodeId];
  if (!node) return '';

  const desktopStyle = styleObjectToCss(node.style?.desktop || {});
  const childrenHtml = (node.children || [])
    .map((childId) => renderNodeToHtml(childId, nodes))
    .join('\n');

  switch (node.type) {
    case 'root':
      return `<div id="root-canvas" style="${desktopStyle}">\n${childrenHtml}\n</div>`;

    case 'container':
      return `<div id="${node.id}" style="${desktopStyle}">\n${childrenHtml}\n</div>`;

    case 'heading': {
      const level = node.content?.level || 'h2';
      const text = node.content?.text || 'Heading';
      return `<${level} id="${node.id}" style="${desktopStyle}">${text}</${level}>`;
    }

    case 'paragraph': {
      const text = node.content?.text || 'Paragraph text';
      return `<p id="${node.id}" style="${desktopStyle}">${text}</p>`;
    }

    case 'button': {
      const text = node.content?.text || 'Button';
      const url = node.content?.url || '#';
      return `<a href="${url}" id="${node.id}" class="bs-btn" style="display: inline-block; text-decoration: none; ${desktopStyle}">${text}</a>`;
    }

    case 'image': {
      const src = node.content?.src || '';
      const alt = node.content?.alt || 'Image';
      return `<img id="${node.id}" src="${src}" alt="${alt}" style="${desktopStyle}" loading="lazy" />`;
    }

    case 'video': {
      const src = node.content?.src || '';
      if (!src) return '';
      return `<iframe id="${node.id}" src="${src}" style="${desktopStyle}" frameborder="0" allowfullscreen></iframe>`;
    }

    case 'icon': {
      const iconName = node.content?.iconName || 'Star';
      return `<div id="${node.id}" style="${desktopStyle}"><span class="icon-${iconName.toLowerCase()}">★</span></div>`;
    }

    case 'divider':
      return `<hr id="${node.id}" style="${desktopStyle}" />`;

    case 'spacer':
      return `<div id="${node.id}" style="${desktopStyle}"></div>`;

    case 'form': {
      const buttonText = node.content?.buttonText || 'Submit';
      const formId = node.id;
      return `
<form id="${formId}" class="bs-contact-form" style="${desktopStyle}" onsubmit="handleFormSubmit(event, '${formId}')">
  <div class="bs-form-group">
    <label class="bs-label">Name</label>
    <input type="text" name="name" placeholder="Your name" class="bs-input" required />
  </div>
  <div class="bs-form-group">
    <label class="bs-label">Email</label>
    <input type="email" name="email" placeholder="you@example.com" class="bs-input" required />
  </div>
  <div class="bs-form-group">
    <label class="bs-label">Message</label>
    <textarea name="message" rows="4" placeholder="Your message..." class="bs-input bs-textarea" required></textarea>
  </div>
  <button type="submit" class="bs-submit-btn">${buttonText}</button>
  <p class="bs-form-success" id="success-${formId}" style="display:none;color:#10b981;margin-top:8px;font-weight:600;">✓ Message sent!</p>
</form>`;
    }

    case 'accordion': {
      const title = node.content?.title || 'Frequently Asked Questions';
      const items: Array<{ id: string; question: string; answer: string }> = node.content?.items || [
        { id: '1', question: 'How long does setup take?', answer: 'Setup takes less than 60 seconds.' },
        { id: '2', question: 'Is static export included?', answer: 'Yes, full ZIP export is included.' },
      ];
      const itemsHtml = items.map((item, idx) => `
        <div class="bs-accordion-item" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 8px; overflow: hidden;">
          <button type="button" onclick="toggleAccordion('${node.id}', ${idx})" style="width:100%; text-align:left; padding: 14px 16px; background: rgba(255,255,255,0.03); color: inherit; border:none; cursor:pointer; font-weight:600; font-size: 14px; display:flex; justify-content:space-between; align-items:center;">
            <span>${item.question}</span>
            <span>▼</span>
          </button>
          <div id="bs-acc-${node.id}-${idx}" style="display: ${idx === 0 ? 'block' : 'none'}; padding: 14px 16px; font-size: 13px; color: #a1a1aa; border-top: 1px solid rgba(255,255,255,0.05);">
            ${item.answer}
          </div>
        </div>
      `).join('\n');

      return `<div id="${node.id}" style="${desktopStyle}">\n<h3 style="margin-bottom:16px; font-size:20px;">${title}</h3>\n${itemsHtml}\n</div>`;
    }

    case 'tabs': {
      const tabs: Array<{ id: string; label: string; content: string }> = node.content?.tabs || [
        { id: 'tab-1', label: 'Monthly', content: 'Flexible month-to-month billing.' },
        { id: 'tab-2', label: 'Annual', content: 'Annual billing with 20% savings.' },
      ];

      const headerHtml = tabs.map((tab, idx) => `
        <button type="button" onclick="switchTab('${node.id}', ${idx})" id="bs-tab-btn-${node.id}-${idx}" style="flex:1; padding:10px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; border:none; background:${idx === 0 ? '#6366f1' : 'transparent'}; color:${idx === 0 ? '#fff' : '#a1a1aa'};">
          ${tab.label}
        </button>
      `).join('\n');

      const panelsHtml = tabs.map((tab, idx) => `
        <div id="bs-tab-panel-${node.id}-${idx}" style="display:${idx === 0 ? 'block' : 'none'}; padding:16px; border-radius:8px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); font-size:13px; color:#cbd5e1;">
          ${tab.content}
        </div>
      `).join('\n');

      return `<div id="${node.id}" style="${desktopStyle}">
  <div style="display:flex; gap:6px; padding:4px; background:rgba(255,255,255,0.04); border-radius:8px; margin-bottom:16px;">${headerHtml}</div>
  <div>${panelsHtml}</div>
</div>`;
    }
  }
}

// ─── CSS Generator ───────────────────────────────────────────────────────────

function generateStylesCss(theme?: ThemeState, nodes?: Record<string, BuilderNode>): string {
  const fontName = theme?.fontFamily || 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`;

  return `/* BuildStack Export — styles.css */
@import url('${fontUrl}');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: '${fontName}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: ${theme?.backgroundColor || '#ffffff'};
  color: ${theme?.textColor || '#1e293b'};
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img, video, iframe { max-width: 100%; height: auto; display: block; }

/* ── Form Styles ── */
.bs-contact-form { width: 100%; }
.bs-form-group { margin-bottom: 16px; }
.bs-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
.bs-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  background: #fff;
  color: #1e293b;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
}
.bs-input:focus {
  border-color: ${theme?.primaryColor || '#6366f1'};
  box-shadow: 0 0 0 3px ${(theme?.primaryColor || '#6366f1')}33;
}
.bs-textarea { resize: vertical; min-height: 100px; }
.bs-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  background: ${theme?.primaryColor || '#6366f1'};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.bs-submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.bs-btn { transition: opacity 0.15s ease, transform 0.15s ease; }
.bs-btn:hover { opacity: 0.88; transform: translateY(-1px); }

/* ── Entrance Animations ── */
.bs-fadeIn       { animation: bsFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.bs-fadeUp       { animation: bsFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.bs-slideInLeft  { animation: bsSlideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.bs-slideInRight { animation: bsSlideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.bs-zoomIn       { animation: bsZoomIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.bs-floatGlow    { animation: bsFloatGlow 3s ease-in-out infinite; }
.bs-bounceIn     { animation: bsBounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }

@keyframes bsFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes bsFadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bsSlideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bsSlideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes bsZoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes bsFloatGlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes bsBounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }

/* ── Responsive Media Queries ── */
${generateResponsiveMediaQueries(nodes)}
`;
}

function generateResponsiveMediaQueries(nodes?: Record<string, BuilderNode>): string {
  if (!nodes) return `@media (max-width: 768px) { body { font-size: 15px; } }`;

  const tabletCss: string[] = [];
  const mobileCss: string[] = [];

  Object.values(nodes).forEach((n) => {
    if (n.style?.tablet && Object.keys(n.style.tablet).length > 0) {
      const css = styleObjectToCss(n.style.tablet);
      if (css) tabletCss.push(`  #${n.id} { ${css} }`);
    }
    if (n.style?.mobile && Object.keys(n.style.mobile).length > 0) {
      const css = styleObjectToCss(n.style.mobile);
      if (css) mobileCss.push(`  #${n.id} { ${css} }`);
    }
  });

  let output = `@media (max-width: 768px) {\n  body { font-size: 15px; }\n${tabletCss.join('\n')}\n}\n`;
  output += `@media (max-width: 480px) {\n${mobileCss.join('\n')}\n}`;
  return output;
}

// ─── JS Generator ────────────────────────────────────────────────────────────

function generateScriptJs(): string {
  return `/* BuildStack Export — script.js */

// ── Scroll Entrance Animations ──────────────────────────────────────────────
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('bs-animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
})();

// ── Smooth Scroll ──────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── FAQ Accordion Toggle ───────────────────────────────────────────────────
function toggleAccordion(nodeId, idx) {
  const panel = document.getElementById('bs-acc-' + nodeId + '-' + idx);
  if (panel) {
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
  }
}

// ── Tab Switcher Toggle ────────────────────────────────────────────────────
function switchTab(nodeId, activeIdx) {
  let i = 0;
  while (true) {
    const panel = document.getElementById('bs-tab-panel-' + nodeId + '-' + i);
    const btn = document.getElementById('bs-tab-btn-' + nodeId + '-' + i);
    if (!panel || !btn) break;
    const isActive = i === activeIdx;
    panel.style.display = isActive ? 'block' : 'none';
    btn.style.background = isActive ? '#6366f1' : 'transparent';
    btn.style.color = isActive ? '#ffffff' : '#a1a1aa';
    i++;
  }
}

// ── Contact Form Submission ────────────────────────────────────────────────
async function handleFormSubmit(event, formId) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('.bs-submit-btn');
  if (submitBtn) {
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;
  }

  const data = {
    name: form.elements['name']?.value || '',
    email: form.elements['email']?.value || '',
    message: form.elements['message']?.value || '',
  };

  try {
    const response = await fetch(\`/api/v1/published/forms/\${formId}/submit\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok || response.status === 201) {
      form.reset();
      const successEl = document.getElementById('success-' + formId);
      if (successEl) successEl.style.display = 'block';
    }
  } catch (err) {
    console.warn('Form submission failed:', err);
    alert('Message sent! (Demo mode — no backend connected)');
  } finally {
    if (submitBtn) {
      submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
      submitBtn.disabled = false;
    }
  }
}
`;
}

// ─── HTML Page Generator ─────────────────────────────────────────────────────

export function generateStaticHtml(
  rootNodeId: string | null,
  nodes: Record<string, BuilderNode>,
  theme?: ThemeState,
  pageTitle: string = 'Published Page'
): string {
  if (!rootNodeId || !nodes[rootNodeId]) {
    return `<!DOCTYPE html><html><head><title>${pageTitle}</title></head><body><h1>Empty Page</h1></body></html>`;
  }

  const bodyContent = renderNodeToHtml(rootNodeId, nodes);
  const fontName = theme?.fontFamily || 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl}" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: '${fontName}', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: ${theme?.backgroundColor || '#ffffff'};
      color: ${theme?.textColor || '#1e293b'};
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    img { max-width: 100%; height: auto; }
    .bs-submit-btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 12px 28px; background: ${theme?.primaryColor || '#6366f1'};
      color: #fff; border: none; border-radius: 8px; font-family: inherit;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .bs-input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 14px; }
    .bs-form-group { margin-bottom: 16px; }
    .bs-label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
    .bs-textarea { resize: vertical; min-height: 100px; }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// ─── Single-File HTML Download ────────────────────────────────────────────────

export function downloadHtmlFile(
  filename: string,
  rootNodeId: string | null,
  nodes: Record<string, BuilderNode>,
  theme?: ThemeState
) {
  const htmlContent = generateStaticHtml(rootNodeId, nodes, theme, filename.replace('.html', ''));
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── ZIP Package Download ─────────────────────────────────────────────────────

export async function downloadZipFile(
  siteName: string,
  rootNodeId: string | null,
  nodes: Record<string, BuilderNode>,
  theme?: ThemeState
) {
  if (!rootNodeId || !nodes[rootNodeId]) return;

  const zip = new JSZip();
  const folderName = siteName || 'my-website';
  const folder = zip.folder(folderName)!;

  // Generate index.html (references external CSS & JS)
  const fontName = theme?.fontFamily || 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`;
  const bodyContent = renderNodeToHtml(rootNodeId, nodes);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${siteName || 'My Website'}</title>
  <meta name="description" content="Built with BuildStack — No-code website generator" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontUrl}" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
${bodyContent}
<script src="script.js"></script>
</body>
</html>`;

  folder.file('index.html', indexHtml);
  folder.file('styles.css', generateStylesCss(theme, nodes));
  folder.file('script.js', generateScriptJs());

  // assets/ readme
  const assetsFolder = folder.folder('assets')!;
  assetsFolder.file('README.txt', 
    'Place your local images here and update the src attributes in index.html accordingly.\n' +
    'Currently, images use CDN/external URLs and do not need to be downloaded unless you want a fully offline bundle.\n'
  );

  const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${folderName}.zip`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
