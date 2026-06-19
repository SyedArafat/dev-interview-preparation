# Coding Standards

## Overview

JavaScript + JSX codebase using ESLint for quality enforcement and Prettier-style conventions enforced manually/via editor. Standards are kept practical — this is a solo/small-team project.

---

## Code Formatting

**Tool**: ESLint (existing config in `client/eslint.config.js`) + manual Prettier-compatible style

**Key Settings**:
- Indentation: 2 spaces
- Quotes: Single quotes for JS strings, double quotes in JSX attributes
- Semicolons: Yes
- Trailing commas: ES5 (where valid)
- Line length: ~100 characters (soft limit)
- Arrow functions: Always, no `function` keyword for component logic

**Enforcement**: ESLint on `npm run lint`. Editor format-on-save recommended (`.vscode/settings.json`).

---

## Linting

**Tool**: ESLint 9 (flat config)
**Base Config**: `eslint:recommended` + `react/recommended` + `react-hooks/recommended`
**Strictness**: Balanced

**Key Rules**:
- `react/prop-types`: warn (no TypeScript so prop-types helps document intent)
- `no-unused-vars`: error
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn
- `no-console`: warn in production builds (console.log OK in dev)
- `no-debugger`: error

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | `topicId`, `isLoading` |
| Functions | camelCase | `fetchTopics`, `handleSubmit` |
| React components | PascalCase | `TopicCard`, `AdminRoute` |
| Custom hooks | camelCase with `use` prefix | `useAuth`, `useTopics` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| CSS class names | kebab-case | `.topic-card`, `.header-nav` |
| Event handlers | `handle` prefix | `handleClick`, `handleSubmit` |
| Boolean props/vars | `is`, `has`, `can` prefix | `isAdmin`, `hasError` |

**File Naming**:
- React components: `PascalCase.jsx` + co-located `PascalCase.css` (e.g., `TopicCard.jsx`)
- Utilities / lib: `camelCase.js` (e.g., `firebase.js`)
- Hooks: `useHookName.js` (e.g., `useAuth.js`)
- Pages: `PascalCasePage.jsx` (e.g., `TopicPage.jsx`)
- Admin pages: in `pages/admin/` subdirectory

---

## File Organization

**Pattern**: Type-based (current) — appropriate for project size

**Current Structure**:
```text
client/src/
  components/      # Shared/reusable UI components
  contexts/        # React context providers (auth, etc.)
  data/            # Static data or seed data
  hooks/           # Custom React hooks
  lib/             # Firebase init and utility modules
  pages/           # Route-level page components
    admin/         # Admin-only pages
  assets/          # Images, fonts
  App.jsx          # Root component + routing
  main.jsx         # Entry point
```

**Conventions**:
- Each component gets its own `.jsx` + `.css` file (no CSS-in-JS, no global CSS classes for layout)
- No barrel `index.js` files (explicit imports)
- Admin functionality isolated in `pages/admin/`
- Firebase SDK only imported from `lib/firebase.js` (single init point)

---

## Testing Strategy

**Framework**: None currently (deferred)
**Coverage Target**: N/A

When tests are added, the recommended approach is:
- **Vitest** + **React Testing Library** for unit/component tests
- Test files co-located: `ComponentName.test.jsx` next to `ComponentName.jsx`
- Focus on user-behaviour tests, not implementation details

---

## Error Handling

**Pattern**: try/catch for async Firebase operations

```jsx
// Standard async Firebase pattern
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

try {
  setLoading(true);
  const data = await fetchFromFirestore();
  setState(data);
} catch (err) {
  setError(err.message);
  console.error('Context:', err);
} finally {
  setLoading(false);
}
```

**Custom Errors**: No — use standard `Error` with descriptive messages
**API Errors**: Firebase SDK throws typed errors (`FirebaseError`) — check `err.code` for specific handling
**React Error Boundaries**: Add to admin pages and top-level routes for graceful degradation

---

## Logging

**Tool**: `console` (browser console)
**Format**: Text (no structured logging needed for SPA)

**Levels**:

| Level | Usage |
|-------|-------|
| `console.error` | Caught exceptions, Firebase errors |
| `console.warn` | Unexpected-but-handled situations |
| `console.log` | Development debugging only — remove before PR |
| `console.info` | Significant user events (optional) |

**Rules**:
- Never log: passwords, Firebase tokens, auth credentials, user PII
- Always log errors with context: `console.error('fetchTopics failed:', err)`
- Strip `console.log` before merging to main (ESLint `no-console: warn` enforces this)

