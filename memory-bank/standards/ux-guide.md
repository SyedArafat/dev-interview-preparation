# UX Guide

## Overview

Dev Interview Prep is a **content-reading application**. The UX prioritises legibility, focus, and a calm reading experience. The design is intentionally minimal — no complex animations, no heavy UI frameworks. Recent work has focused on Markdown rendering quality and typography polish.

---

## Design System / Component Library

**Custom components + Vanilla CSS (no external UI framework)**

- No Tailwind, no Material UI, no Chakra
- Each component has a co-located `.css` file (`ComponentName.css`)
- `index.css` for global resets and CSS custom properties (design tokens)
- Icons: `lucide-react` (consistent icon set, tree-shakeable)

**Component inventory**:

| Component | Purpose |
|-----------|---------|
| `Header` | Global navigation, auth state display |
| `TopicCard` | Topic listing card on HomePage |
| `NoteEditor` | User note-taking with Markdown editor |
| `AdminRoute` | Route guard for admin pages |

---

## Styling Approach

**Vanilla CSS with CSS Custom Properties (CSS Variables)**

```css
/* Pattern: BEM-lite class names, scoped to component */
.topic-card { }
.topic-card__title { }
.topic-card--featured { }
```

**Key principles**:
- CSS variables for design tokens (colours, spacing, type scale) defined in `:root` in `index.css`
- No inline styles except for dynamic values (e.g., computed widths)
- No `!important`
- Mobile-first media queries

**Markdown rendering styles**:
- Markdown content rendered inside a `.prose` or `.markdown-body` wrapper class
- Custom CSS to style `h1–h6`, `p`, `code`, `pre`, `blockquote`, `table` within Markdown containers
- Code blocks styled with `highlight.js` theme (e.g., `github-dark` or `atom-one-dark`)

---

## Accessibility Standards

- Semantic HTML: use `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>` appropriately
- All interactive elements keyboard-navigable
- Colour contrast: minimum WCAG AA (4.5:1 for text)
- `alt` text on all meaningful images
- Form inputs paired with `<label>` (no `placeholder`-only labels)
- Focus styles: never remove `:focus` outline without a visible replacement
- Lucide icons used decoratively must have `aria-hidden="true"`

---

## Responsive Design Strategy

**Mobile-first, two breakpoints**

```css
/* Base: mobile (<768px) */
/* Tablet/desktop: */
@media (min-width: 768px) { }
@media (min-width: 1200px) { }
```

- Layout: CSS Flexbox and Grid (no float/positioning hacks)
- Typography scales up on larger screens (fluid or stepped)
- Content max-width: `~800px` for reading comfort on topic/question pages
- Sidebar patterns avoided in favour of single-column reading flow

---

## Typography

- Font stack: System font stack for body (`-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`) or a loaded web font
- Code font: Monospace system stack (`'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`)
- Line height: 1.6–1.75 for body text, 1.2 for headings
- Font size base: 16px (1rem)
- Heading scale: defined in CSS variables or type scale utility

**Markdown typography**:
- Heading hierarchy respected (`h1` = article title, `h2`/`h3` = sections)
- `pre > code` blocks: distinct background, padding, border-radius, overflow scroll
- `inline code`: subtle background, slightly smaller font, no wrapping

---

## Interaction Patterns

- Loading states: show spinner or skeleton, never leave blank screen
- Error states: inline error message near the relevant content, not modal popups
- Empty states: friendly message + action suggestion (e.g., "No topics yet — add one in admin")
- Form feedback: immediate validation where possible, clear success/error after submit
- Admin forms: confirm before destructive actions (delete)
- Page transitions: none currently — keep simple, no animation overhead

---

## Tone & Content

- Interface copy: concise, professional, developer-friendly
- Error messages: actionable, not just "Something went wrong"
- Admin labels: match the data model terms (Topic, Question, not "Post", "Article")

