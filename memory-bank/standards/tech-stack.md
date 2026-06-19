# Tech Stack

## Overview

Dev Interview Prep is a React 18 SPA (Single Page Application) with a Firebase backend. The stack prioritises fast development iteration, zero-ops infrastructure, and a clean reading experience for interview content served as Markdown.

---

## Languages

**JavaScript (JSX)**

The project uses plain JavaScript with JSX — no TypeScript. This keeps tooling minimal (no tsc compilation step) and aligns with the current codebase. The trade-off is less type safety, compensated by disciplined prop usage and ESLint rules.

- Frontend: JavaScript / JSX
- No server-side language (Firebase handles backend logic via Firestore rules + client SDK)

---

## Framework

**React 18 + Vite**

- **React 18**: Component-based UI with hooks. No class components. Concurrent features available but not yet used.
- **Vite 5**: Build tool and dev server. Fast HMR, ES module native, replaces CRA.
- **React Router v7**: Client-side routing (SPA mode). File-based page components under `src/pages/`.

No SSR / SSG — this is a client-rendered SPA hosted as static files.

---

## Authentication

**Firebase Authentication**

- Provider: Email/password (primary)
- Admin role differentiation: Firestore `users` collection with `role: admin` field
- Auth state managed via React Context (`src/contexts/`)
- Protected routes via `<AdminRoute>` component wrapper

---

## Infrastructure & Deployment

**Firebase Hosting + Docker (dev)**

- **Production**: Firebase Hosting (static SPA + Firestore)
- **Development**: Docker Compose (`docker-compose.dev.yml`) for local environment
- **CI/CD**: GitHub Actions (`.github/` workflows)
- **Config**: `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`

Firebase emulator suite available for local Firestore/Auth testing.

---

## Package Manager

**npm** (with `package-lock.json`)

Root-level `package.json` for scripts/Docker orchestration; `client/package.json` for the React app.

---

## Key Libraries

| Library | Purpose |
|---------|---------|
| `react-markdown@10` | Render Markdown content for questions/answers |
| `rehype-highlight` | Syntax highlighting in Markdown code blocks |
| `remark-gfm` | GitHub Flavored Markdown support (tables, strikethrough) |
| `highlight.js@11` | Code highlighting engine |
| `lucide-react` | Icon set |
| `@uiw/react-md-editor` | Rich Markdown editor for admin content creation |
| `firebase@12` | Firestore client SDK + Firebase Auth |

---

## Decision Relationships

- Firebase Auth drives the admin panel access model (role-based, not route-based permissions)
- React Router v7 routing must be SPA-aware (all paths rewrite to `index.html` in Firebase Hosting config)
- Vite build output goes to `dist/` which is the Firebase Hosting public directory

