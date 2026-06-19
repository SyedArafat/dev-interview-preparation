# System Architecture

## Overview

Dev Interview Prep is a **client-rendered SPA** with a **BaaS (Backend-as-a-Service)** architecture. Firebase provides auth, database, and hosting — eliminating the need for a custom backend server.

---

## Architecture Style

**SPA + BaaS (Firebase)**

```text
┌─────────────────────────────────────┐
│           Browser (React SPA)        │
│                                     │
│  Pages → Components → Hooks/Context │
│           │                         │
│    Firebase Client SDK              │
└─────────┬───────────────────────────┘
          │  HTTPS (SDK)
┌─────────▼───────────────────────────┐
│           Firebase Platform          │
│                                     │
│  ┌──────────────┐ ┌───────────────┐ │
│  │  Firestore   │ │  Auth         │ │
│  │  (Database)  │ │  (Email/Pass) │ │
│  └──────────────┘ └───────────────┘ │
│  ┌──────────────────────────────┐   │
│  │  Firebase Hosting (CDN)      │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

No Express/Node backend. No REST API. All data access via Firestore client SDK, governed by Firestore Security Rules.

---

## State Management

**React Context + useState/useEffect (No external state library)**

- Auth state: `AuthContext` (wraps Firebase `onAuthStateChanged`)
- Feature state: Local `useState` within page/component
- Data fetching: `useEffect` + `useState` in custom hooks or page components
- No Redux, Zustand, or Jotai — complexity not warranted for current scope

**Data flow**:
```text
Firebase → Custom Hook (useTopics, useQuestions) → Page Component → Child Components
```

---

## API Design

N/A — no custom API. Direct Firestore SDK calls.

**Firestore access pattern**:
- All Firestore imports come from `src/lib/firebase.js` (single init)
- Data fetching logic lives in custom hooks (`src/hooks/`) or page-level `useEffect`
- Write operations (admin) triggered by form submit handlers in admin page components

---

## Routing

**React Router v7 (Client-side, SPA)**

```text
/                     → HomePage
/login                → LoginPage
/profile              → ProfilePage (authenticated)
/topics/:topicId      → TopicPage
/admin/*              → Admin pages (AdminRoute wrapper)
```

- `<AdminRoute>` component checks `isAdmin` from `AuthContext` and redirects non-admins
- Firebase Hosting rewrites all routes to `index.html` (SPA fallback)

---

## Security Patterns

- **Auth enforcement**: `<AdminRoute>` wrapper in React for UI; Firestore rules for data
- **Firestore rules**: Public read for content, admin-only writes, user-own-doc writes
- **No secrets in client code**: Firebase config (API key etc.) is public by design — security enforced via rules
- **Input sanitisation**: Markdown rendered with `react-markdown` (safe by default — no `dangerouslySetInnerHTML`)
- **Auth tokens**: Managed entirely by Firebase SDK (never stored manually)

---

## Caching Strategy

- **No explicit caching layer** — Firestore SDK has a built-in offline cache (`enableIndexedDbPersistence` if needed)
- Static assets cached by Firebase Hosting CDN
- Consider memoising expensive derived data with `useMemo` if list rendering becomes slow

---

## Deployment Architecture

```text
GitHub → GitHub Actions → vite build → firebase deploy

Dev:    docker-compose.dev.yml (local Vite + Firebase emulator)
Prod:   Firebase Hosting (CDN-distributed static files)
```

