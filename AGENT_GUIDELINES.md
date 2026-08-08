# BuildStack — AI Agent Guideline
**Read this entire file before doing anything.**

---

## 1. Project Vision (CRITICAL — Read First)

BuildStack is a **no-code website builder for non-technical users**.

The target user is someone who has **zero coding knowledge**. They want to build a website by:
1. Clicking a page panel to create pages
2. Clicking sections from a section library (Navbar, Hero, Features, Footer etc.)
3. Double-clicking text on the canvas to edit it
4. Changing colors/fonts in the right-side Property Panel
5. Publishing the website

**DO NOT** build this like Webflow (developer-first). Build it like **Wix or Squarespace** (non-coder first).

The core UX is: **Section blocks → Click to add → Edit inline → Publish**

---

## 2. What Is Already Built (DO NOT MODIFY UNLESS ASKED)

Every item below is production-ready and working. Do not redesign, refactor, or "improve" these unless the user explicitly asks.

### Backend (Spring Boot 3 / Java 21 / PostgreSQL)
- `Authentication` — JWT login/register, `JwtAuthenticationFilter`, `GlobalExceptionHandler`
- `Organizations` — CRUD, member roles (OWNER, ADMIN, MEMBER)
- `Workspaces` — Belong to organizations
- `Projects` — Belong to workspaces
- `Pages` — Belong to projects, multi-page support
- `Builder State Persistence` — `page.builderData` stored as PostgreSQL JSONB
- `BuilderStateDto` — contains `version`, `schemaVersion`, `rootNodeId`, `nodes`
- `BuilderNodeDto` — contains `id`, `type`, `parentId`, `children`, `content`, `ResponsiveStyleDto style`, `settings`
- `ResponsiveStyleDto` — `{ desktop: Map, tablet: Map, mobile: Map }`
- `PageServiceImpl.saveBuilderState` — saves the JSON, returns updated version

### Frontend (React 18 + TypeScript + Redux Toolkit + Vite)
**State: `builderSlice.ts`** contains:
- `nodes: Record<string, BuilderNode>` — the entire component tree
- `rootNodeId: string | null`
- `version`, `schemaVersion`
- `selectedNodeId`
- `isDirty`, `saveStatus`
- `viewport: 'desktop' | 'tablet' | 'mobile'`
- `past`, `future`, `lastSnapshot` — for Undo/Redo

**Reducers (all working):**
- `loadBuilderState` — loads from backend, migrates flat styles to responsive
- `initializeCanvas` — creates a blank root node for new pages
- `addNode` — adds a single element to root
- `addSection` — adds a complete pre-built section node tree to root
- `moveNode` — for drag-and-drop reordering
- `updateNodeProperty` — edits content/style/settings per viewport
- `clearNodeStyleProperty` — removes a viewport style override (resumes inheritance)
- `removeNode` — deletes a node
- `selectNode` — sets selectedNodeId
- `undo` / `redo` — history navigation
- `setSaveStatus`, `clearDirty`, `setViewport`

**Key Components (all working):**
- `BuilderShell.tsx` — main layout grid, auto-save (1s debounce), page loading
- `TopToolbar.tsx` — viewport switcher (Desktop/Tablet/Mobile), undo/redo, save status
- `LeftSidebar.tsx` — icon nav bar with tabs: Pages, Sections, Elements
- `SectionsPanel.tsx` — click-to-add pre-built section blocks
- `ComponentsPanel.tsx` — drag-to-add individual elements
- `CanvasArea.tsx` — zoom controls, viewport label, renders the node tree
- `RendererNode.tsx` — recursive renderer, handles selection, DnD, **inline text editing** (double-click)
- `PropertyPanel.tsx` — responsive property editing with viewport badge, inheritance indicators, clear-override button
- `LayersPanel` — node tree view with renaming, reordering

**Hooks (all working):**
- `useResolvedStyle(node, viewport)` — centralized, memoized style resolution with inheritance
- `useUndoRedo()` — Ctrl+Z / Ctrl+Y keyboard shortcuts

**Section Templates (all working):**
- Located in `frontend/src/features/builder/sections/SectionTemplates.ts`
- 6 templates: `navbar`, `hero`, `features`, `testimonials`, `cta`, `footer`
- Each is a factory function returning `{ sectionRootId, nodes }`

**Node Types (all registered in ComponentRegistry):**
- `root`, `container`, `heading`, `paragraph`, `button`, `image`, `spacer`
- `video` — YouTube/Vimeo embed with auto URL conversion (watch → embed), builder overlay for click-to-select
- `icon` — Lucide icon with visual grid picker in Property Panel (64 curated icons)
- `divider` — Horizontal rule with color, thickness, border-radius controls
- `form` — Contact form (Name/Email/Subject/Message/Submit), inputs are readOnly + pointer-events:none in builder

**Responsive System (fully working):**
- Style stored as `{ desktop: {}, tablet: {}, mobile: {} }`
- Inheritance chain: Desktop → Tablet → Mobile
- Canvas width: Desktop=1200px, Tablet=768px, Mobile=390px
- Property Panel shows "(inherited)" for values from larger breakpoints

---

## 3. The Roadmap (Work In This Order)

Refer to `BuildStack-SRS.md` in the project root for full details.

### ✅ Completed Sprints (All Sprints Complete)
- Sprints 1–5: All backend + builder infrastructure ✅
- Sprint 6: Inline text editing ✅, Section Block Library ✅, Preview Mode ✅
- Sprint 7: Video embed ✅, Icon component ✅, Divider ✅, Contact Form ✅
- Sprint 8: Live Site Publishing (`/published/:pageId`) ✅, Static HTML & CSS Export (`exportHtml.ts`) ✅, Global Theme & Palette System (`ThemePanel.tsx`) ✅
- Sprint 9: Page SEO & Settings Modal (`PageSeoModal.tsx`) ✅, Interactive Link Targets (`_blank`/`_self`, URLs, anchors for Buttons & Images) ✅
- Sprint 10: Starter Site Templates (SaaS Landing, Agency Portfolio, E-Commerce Store, Blank Canvas) ✅, Scroll Entrance Animations (`fadeIn`, `slideUp`, `slideDown`, `zoomIn`) ✅
- Multi-Page Navigation: Interactive page-picker in Property Panel allowing buttons, text links, and images to route between pages in Preview & Published websites ✅

---

## 4. Architecture Rules (NEVER VIOLATE THESE)

### Data Model
```typescript
interface BuilderNode {
  id: string;
  type: NodeType;  // 'root' | 'container' | 'heading' | 'paragraph' | 'button' | 'image' | 'spacer'
  parentId: string | null;
  children: string[];  // ordered list of child node IDs
  content: Record<string, any>;   // type-specific content (text, src, alt...)
  style: {
    desktop: Record<string, any>; // CSS properties
    tablet: Record<string, any>;  // overrides only
    mobile: Record<string, any>;  // overrides only
  };
  settings: Record<string, any>;
}
```

**Never** flatten the style object. **Never** store duplicate trees per breakpoint.

### Component Registration
Every new node type MUST be:
1. Added to `NodeType` in `builder.ts`
2. Given a `ComponentConfig` in `registry/components/`
3. Registered in `registry/index.ts`
4. Have `defaultStyle`, `defaultContent`, `defaultSettings`
5. Have `propertySchemas` with `responsive: true` on style properties

### Style Resolution
Always use `useResolvedStyle(node, viewport)` to get the effective CSS. Never resolve manually inline.

### Redux
- Never bypass Redux for state. All mutations go through `builderSlice` reducers.
- Every mutation that changes the visual output must set `isDirty = true`.
- Every mutation that is undoable must call `commitHistory`.

### Backend
- The `saveBuilderState` endpoint only accepts the fields in `BuilderStateDto`:  `version`, `schemaVersion`, `rootNodeId`, `nodes`
- Do NOT send `past`, `future`, `lastSnapshot`, `selectedNodeId`, `isDirty`, `saveStatus`, or `viewport` to the backend — these are frontend-only UI state.

---

## 5. File Structure Reference

```
frontend/src/features/builder/
├── BuilderShell.tsx           ← main layout, auto-save logic
├── components/
│   ├── TopToolbar.tsx         ← toolbar with viewport switcher + undo/redo
│   ├── CanvasArea.tsx         ← canvas with zoom + viewport label
│   ├── LeftSidebar.tsx        ← icon nav (Pages / Sections / Elements tabs)
│   └── BottomStatusBar.tsx
├── dnd/
│   └── BuilderDndContext.tsx  ← all drag-and-drop logic
├── hooks/
│   ├── useUndoRedo.ts
│   └── useResolvedStyle.ts    ← style inheritance resolution
├── panels/
│   ├── PropertyPanel.tsx      ← responsive property editor
│   ├── PagesPanel.tsx
│   └── LayersPanel.tsx
├── registry/
│   ├── ComponentRegistry.ts
│   ├── index.ts               ← registers all components
│   ├── types.ts               ← PropertySchema, ComponentConfig
│   └── components/
│       ├── root.tsx, container.tsx, heading.tsx, paragraph.tsx
│       ├── button.tsx, image.tsx, spacer.tsx
├── renderer/
│   └── RendererNode.tsx       ← recursive renderer + inline text editing
├── sections/
│   ├── SectionTemplates.ts    ← 6 pre-built section factories
│   └── SectionsPanel.tsx      ← section browser UI
├── sidebar/
│   └── ComponentsPanel.tsx    ← individual element drag panel
├── state/
│   └── builderSlice.ts        ← ALL Redux state + reducers
├── types/
│   └── builder.ts             ← BuilderNode, NodeType, ResponsiveStyle interfaces
└── utils/
    ├── nodeFactory.ts         ← creates fresh nodes with defaults
    └── idGenerator.ts        ← generates unique node IDs

backend/src/main/java/com/buildstack/
├── project/
│   ├── dto/
│   │   ├── BuilderStateDto.java
│   │   ├── BuilderNodeDto.java
│   │   └── ResponsiveStyleDto.java
│   ├── service/impl/PageServiceImpl.java   ← saveBuilderState method
│   └── controller/PageController.java
└── exception/GlobalExceptionHandler.java
```

---

## 6. How to Work on This Project

### Before Starting Any Task
1. Read this entire file first
2. Read `BuildStack-SRS.md` in the project root
3. Check what is already built (Section 2 above) — never rebuild what exists
4. Ask the user which sprint/feature to work on

### When Adding a New Feature
1. Identify which files need changes (minimum possible)
2. Write a short plan and wait for user approval on complex tasks
3. Implement with the existing patterns (don't reinvent)
4. Run `npm run build` and fix any TypeScript errors
5. If backend changes are needed, run `mvnw compile` and check for errors

### When Fixing Bugs
1. Read the backend task log or browser console error first
2. Do not add debug `alert()` calls to the production UI
3. Check `GlobalExceptionHandler.java` logs on the backend for 500 errors

### Rules for the User Experience
- Sections panel is the **default active panel** (non-coders start by adding sections)
- Double-click on text = inline edit (do not break this)
- Every style property that can vary by breakpoint must have `responsive: true`
- The Property Panel MUST show the viewport badge (Desktop/Tablet/Mobile)
- Undo/Redo must work for all canvas mutations

### Do NOT
- Do NOT add alert() popups to the UI (use console.error for debugging)
- Do NOT redesign the layout without asking
- Do NOT flatten style to `{ color: '#000' }` — it must stay `{ desktop: { color: '#000' }, tablet: {}, mobile: {} }`
- Do NOT send Redux UI-only state to the backend
- Do NOT call `initializeCanvas()` on every mount — only call it when a blank/new page is loaded
- Do NOT create duplicate files or duplicate type definitions
- Do NOT remove or rename existing Redux actions without updating ALL callers

---

## 7. Current Known Issues / Things to Watch

- The `CanvasArea.tsx` no longer calls `initializeCanvas()` on mount (this was a bug that was fixed)
- The backend `PageServiceImpl.saveBuilderState` does NOT do version checking anymore (was removed to prevent 409 errors during rapid auto-save)
- Style properties use camelCase CSS (`backgroundColor`, not `background-color`) — this is correct for React inline styles

---

## 8. Tech Stack Quick Reference

| | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| State | Redux Toolkit (RTK Query for API) |
| UI Components | Custom components in `src/components/ui/` |
| Icons | Lucide React |
| DnD | @dnd-kit/core, @dnd-kit/sortable |
| Backend | Spring Boot 3, Java 21 |
| Database | PostgreSQL with JSONB |
| Auth | JWT (Spring Security) |
| Migrations | Flyway |
| API | REST, CORS configured for localhost:5173 |

---

*Last updated: August 2026 — All Sprints (1 to 10) Completed & Production Ready*
