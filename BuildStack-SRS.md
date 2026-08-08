# BuildStack — Software Requirements Specification (SRS)
**Version:** 1.0  
**Date:** August 2026  
**Author:** Dhruv  
**Project Type:** No-Code Website Builder (SaaS)

---

## 1. Project Overview

### 1.1 Vision
BuildStack is a no-code website builder designed for **non-technical users** who want to create professional websites without writing any code.

The core experience is:
> Drag a complete, pre-styled section (Navbar, Hero, Pricing, Footer) onto the canvas → customize text and colors → publish.

### 1.2 Target Users
- Small business owners
- Freelancers and creators
- Students and hobbyists
- Anyone with zero coding knowledge

### 1.3 Inspired By
- Wix (section-block drag & drop)
- Squarespace (clean, beautiful defaults)
- Carrd (simplicity)
- Framer (modern animations)

---

## 2. Current Status (Completed ✅)

The following modules are production-ready:

| Module | Status |
|---|---|
| User Authentication (Login / Register / JWT) | ✅ Complete |
| Organizations | ✅ Complete |
| Workspaces | ✅ Complete |
| Projects | ✅ Complete |
| Pages (Multi-page support) | ✅ Complete |
| Builder Shell (Layout) | ✅ Complete |
| Component Library (Heading, Para, Button, Image, Container, Spacer) | ✅ Complete |
| Recursive Canvas Renderer | ✅ Complete |
| Property Panel (Right sidebar editing) | ✅ Complete |
| Drag & Drop (Elements from sidebar to canvas) | ✅ Complete |
| Layer Reordering (DnD within canvas) | ✅ Complete |
| Layers Panel (Node tree view) | ✅ Complete |
| Layer Renaming | ✅ Complete |
| Auto-Save (Debounced, 1s) | ✅ Complete |
| JSON Persistence (PostgreSQL JSONB) | ✅ Complete |
| Undo / Redo History | ✅ Complete |
| Responsive Builder (Desktop / Tablet / Mobile viewports) | ✅ Complete |
| Responsive Property Inheritance (Desktop → Tablet → Mobile) | ✅ Complete |

---

## 3. Planned Features (Backlog)

### 3.1 Priority 1 — Core Vision (Must Have)

---

#### FR-01: Pre-built Section Block Library
**Sprint:** 6  
**Priority:** 🔴 Critical

**Description:**  
Users can drag complete, pre-designed sections from a "Sections" panel onto the canvas. Each section is a fully styled group of elements.

**Required Sections:**
- `Navbar` — Logo + Navigation links + CTA Button
- `Hero` — Headline + Subtitle + CTA Button + Background Image
- `Features` — 3-column icon + heading + description grid
- `Testimonials` — Quote cards with avatar
- `Pricing` — 2–3 plan cards with features list
- `Contact Form` — Name + Email + Message + Submit button
- `CTA Banner` — Full-width text + button
- `Footer` — Logo + Links + Social icons + Copyright

**Acceptance Criteria:**
- User drags a section from the left sidebar onto canvas
- Section appears fully styled and ready to use
- All text inside is editable via inline editing or Property Panel
- Section is stored as a group of nodes in the builder JSON

---

#### FR-02: Inline Text Editing (Double-Click to Edit)
**Sprint:** 6  
**Priority:** 🔴 Critical

**Description:**  
Users can double-click any text element (Heading, Paragraph, Button label) directly on the canvas to enter edit mode and type.

**Acceptance Criteria:**
- Double-click activates a `contentEditable` field on the element
- Pressing `Escape` or clicking outside exits edit mode
- Changes are saved to the node's `content.text` in Redux
- Auto-save triggers after editing

---

#### FR-03: Preview Mode
**Sprint:** 7  
**Priority:** 🔴 Critical

**Description:**  
A "Preview" button opens the current page in a clean, full-screen view — no builder chrome, no selection rings, no toolbars.

**Acceptance Criteria:**
- Preview button is in the Top Toolbar (currently disabled)
- Opens a new route/tab showing the rendered page only
- Responsive — respects active viewport (Desktop/Tablet/Mobile)
- Works without saving first (reads from current Redux state)

---

### 3.2 Priority 2 — Makes It Usable (Should Have)

---

#### FR-04: Image Upload
**Sprint:** 7  
**Priority:** 🟡 High

**Description:**  
Users can upload images from their device instead of pasting a URL.

**Acceptance Criteria:**
- Image element in Property Panel shows an "Upload" button
- Supports JPEG, PNG, WebP, GIF
- Image is stored on the server (or cloud bucket)
- A public URL is returned and saved to the node's `content.src`
- Maximum file size: 5MB

---

#### FR-05: Publishing / Export
**Sprint:** 8  
**Priority:** 🟡 High

**Description:**  
Users can publish their website and share a live URL.

**Options (choose one for MVP):**
- Option A: Export as a static HTML/CSS/JS zip file for self-hosting
- Option B: Publish to a subdomain `username.buildstack.app`

**Acceptance Criteria:**
- "Publish" button in Top Toolbar (currently disabled)
- Generates a clean, standalone HTML file from the builder JSON
- All styles are inlined (no dependency on the builder's CSS)
- Published site is responsive based on stored viewport styles

---

#### FR-06: Global Theme / Brand Settings
**Sprint:** 8  
**Priority:** 🟡 High

**Description:**  
Users define a brand palette and typography that applies site-wide.

**Settings:**
- Primary Color
- Secondary Color
- Background Color
- Heading Font (Google Fonts picker)
- Body Font
- Base Font Size

**Acceptance Criteria:**
- Accessible from a "Theme" panel or Project Settings
- Changing primary color updates all elements using it
- Persisted in the project's settings JSON

---

#### FR-07: More Element Types
**Sprint:** 7–8  
**Priority:** 🟡 High

**New Elements:**
| Element | Description |
|---|---|
| Video Embed | YouTube or Vimeo URL → rendered iframe |
| Icon | Pick from Lucide or Heroicons library |
| Divider | Horizontal line with color/thickness controls |
| Form | Name + Email + Message + Submit (static for now) |
| Map Embed | Google Maps iframe |
| Social Links | Row of social media icon buttons |

---

### 3.3 Priority 3 — Polish & Growth (Nice to Have)

---

#### FR-08: Page Settings (SEO)
**Sprint:** 9  
**Priority:** 🟢 Medium

Per-page settings:
- Page title (browser tab title)
- Meta description
- Social share image (OG image)
- Favicon (project-wide)

---

#### FR-09: Navigation Links Between Pages
**Sprint:** 9  
**Priority:** 🟢 Medium

**Description:**  
Buttons and navbar links can route to other pages within the same project.

---

#### FR-10: Scroll Animations
**Sprint:** 10  
**Priority:** 🟢 Medium

**Description:**  
Simple entrance animations when sections scroll into view.

**Options:** Fade In, Slide Up, Zoom In  
**Settings:** Delay, Duration

---

#### FR-11: Starter Templates
**Sprint:** 10  
**Priority:** 🟢 Medium

**Description:**  
When creating a new project, users can choose from a starter template.

**Templates:**
- Portfolio (Landing page for freelancers)
- Business (Small business homepage)
- Restaurant (Menu + Location + Hours)
- Coming Soon (Single page with email capture)
- Blank (Current default)

---

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Builder auto-saves within 1 second of any change |
| NFR-02 | Canvas renders pages up to 100 nodes without lag |
| NFR-03 | All pages must be mobile-responsive |
| NFR-04 | User data is isolated per organization |
| NFR-05 | API response time < 500ms for all builder operations |
| NFR-06 | Undo/Redo history stores up to 100 states |

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| State Management | Redux Toolkit |
| Styling | Vanilla CSS + Tailwind utilities |
| Backend | Spring Boot 3 (Java 21) |
| Database | PostgreSQL (JSONB for builder data) |
| ORM | Hibernate / Spring Data JPA |
| Auth | JWT (Bearer tokens) |
| API | REST (RTK Query on frontend) |
| Migrations | Flyway |

---

## 6. Recommended Sprint Roadmap

| Sprint | Features |
|---|---|
| **Sprint 6** | FR-01 Section Block Library + FR-02 Inline Text Editing |
| **Sprint 7** | FR-03 Preview Mode + FR-04 Image Upload + FR-07 More Elements |
| **Sprint 8** | FR-05 Publishing + FR-06 Global Theme |
| **Sprint 9** | FR-08 SEO Settings + FR-09 Navigation Links |
| **Sprint 10** | FR-10 Scroll Animations + FR-11 Starter Templates |

---

## 7. Out of Scope (Current Version)

- AI-generated content or layouts
- E-commerce / payment integration
- Real-time collaboration (multiple users editing simultaneously)
- Custom domain connection (beyond Sprint 8 subdomain)
- Mobile app

---

*This document will be updated as features are completed or priorities change.*
