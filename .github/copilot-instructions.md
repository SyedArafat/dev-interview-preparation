# Copilot Instructions — Dev Interview Prep

## Project Overview

**Dev Interview Prep** is a React SPA displaying curated technical interview questions across 25+ topics. Data lives in **Google Cloud Firestore**. Users can sign in with Google to save private notes per question. An admin panel (`/admin`) lets authorised users manage topics and questions directly from the browser — no backend required.

---

## Tech Stack

| Layer          | Technology                                                      |
| -------------- | --------------------------------------------------------------- |
| Framework      | React 18 (JSX, function components, hooks)                      |
| Routing        | react-router-dom v7 (`<Routes>`, `useParams`, `<Outlet>`)       |
| Build tool     | Vite 5                                                          |
| Styling        | Plain CSS (BEM-ish conventions, CSS custom properties)          |
| Icons          | lucide-react + Devicon (CDN class names)                        |
| Markdown       | react-markdown (answer display) + @uiw/react-md-editor (admin input) |
| Backend/DB     | Firebase Firestore (client SDK v12)                             |
| Auth           | Firebase Auth (Google OAuth + Email/Password for admin)         |
| Hosting        | Docker multi-stage: dev with Vite HMR, prod with nginx          |

---

## Firebase Configuration

| Property   | Value                       |
| ---------- | --------------------------- |
| Project ID | `dev-interview-preparation` |
| Project #  | `1018018163951`             |
| Database   | `(default)`                 |

- Initialised in `client/src/lib/firebase.js` using the **client SDK** (never Admin SDK).
- Exports: `db` (Firestore), `auth` (Firebase Auth), `googleProvider` (GoogleAuthProvider instance).
- Config values from Vite env vars: `VITE_FIREBASE_*`.
- Root `package.json` has `firebase-admin` as a devDependency for the `sync-counts` CLI script only — not used at runtime.

### Firestore Security Rules (live)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /topics/{topicId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    match /questions/{questionId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    // Users can read their own doc; Google sign-in auto-creates with role:'user'
    match /users/{uid} {
      allow read:   if request.auth != null && request.auth.uid == uid;
      allow create: if request.auth != null && request.auth.uid == uid
                    && request.resource.data.role == 'user';
      allow update: if false;
      allow delete: if false;
    }

    // Notes: owner-only CRUD; doc ID = {userId}_{questionId}
    match /notes/{noteId} {
      allow read, delete: if request.auth != null
                          && resource.data.userId == request.auth.uid;
      allow create:       if request.auth != null
                          && request.resource.data.userId == request.auth.uid;
      allow update:       if request.auth != null
                          && resource.data.userId == request.auth.uid
                          && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Firestore Database Structure

The database has **4 root-level collections**: `topics`, `questions`, `users`, `notes`.

---

### Collection: `topics`

Each document is a technology card on the home page.

| Field            | Type      | Description                                                    | Example                           |
| ---------------- | --------- | -------------------------------------------------------------- | --------------------------------- |
| **Document ID**  | `string`  | Slug — matches `topicId` in `questions`                        | `php`, `laravel`, `javascript`    |
| `title`          | `string`  | Display name                                                   | `"PHP"`, `"Laravel"`              |
| `category`       | `string`  | `frontend` \| `backend` \| `language` \| `database` \| `devops` | `"backend"`                     |
| `color`          | `string`  | Hex without `#`                                                | `"ff2d20"`, `"777bb4"`            |
| `icon`           | `string`  | Devicon CSS class                                              | `"devicon-laravel-plain colored"` |
| `questionsCount` | `integer` | Synced by script OR auto-incremented via admin panel           | `5`, `10`                         |

> `color` is stored without `#`. `useTopics.js` prepends `#` when mapping.
> `questionsCount` is auto-incremented client-side when a question is added via the admin panel. Run `npm run sync-counts` to reconcile if questions are added/removed outside the admin UI.

```json
{
  "title": "Laravel",
  "category": "backend",
  "color": "ff2d20",
  "icon": "devicon-laravel-plain colored",
  "questionsCount": 5
}
```

---

### Collection: `questions`

Each document is one interview question.

| Field           | Type      | Description                                              | Example                       |
| --------------- | --------- | -------------------------------------------------------- | ----------------------------- |
| **Document ID** | `string`  | Auto-generated Firestore ID                              | `fehi3RDJhBX1QMqIBXUs`       |
| `topicId`       | `string`  | Matches a `topics` document ID                           | `"php"`                       |
| `question`      | `string`  | Question text                                            | `"What is a Trait in PHP?"`   |
| `answer`        | `string`  | Markdown-formatted answer                                | `"Traits are a mechanism..."` |
| `difficulty`    | `string`  | `beginner` \| `intermediate` \| `advanced` (normalised to lowercase by `useQuestions.js`) | `"intermediate"` |
| `priority`      | `integer` | Sort order within topic (lower = first)                  | `1`, `2`, `3`                 |

```json
{
  "topicId": "php",
  "question": "What is a Trait in PHP?",
  "answer": "Traits are a mechanism for code reuse...",
  "difficulty": "intermediate",
  "priority": 1
}
```

---

### Collection: `users`

Created automatically on first Google sign-in, or manually in Firebase Console for admin accounts.

| Field           | Type        | Description                             | Example                 |
| --------------- | ----------- | --------------------------------------- | ----------------------- |
| **Document ID** | `string`    | Firebase Auth UID                       | `abc123XYZdef456`       |
| `uid`           | `string`    | Same as document ID                     | `abc123XYZdef456`       |
| `email`         | `string`    | User email                              | `"user@example.com"`    |
| `displayName`   | `string`    | Display name (editable on profile page) | `"Jane Dev"`            |
| `photoURL`      | `string`    | Avatar URL (Google photo or custom)     | `"https://..."`         |
| `role`          | `string`    | `"user"` (default) or `"admin"`         | `"user"`                |
| `createdAt`     | `timestamp` | Server timestamp on first sign-in       | Firestore Timestamp     |

> **Admin users** must be manually provisioned: create in Firebase Console → Authentication (email/password), then create `users/{uid}` doc in Firestore with `role: "admin"`. Google sign-in always produces `role: "user"` — cannot self-promote to admin.

```json
{
  "uid": "abc123XYZdef456",
  "email": "admin@devinterviewprep.com",
  "displayName": "Admin",
  "photoURL": "",
  "role": "admin",
  "createdAt": "Timestamp"
}
```

---

### Collection: `notes`

Private per-user notes attached to specific questions.

| Field           | Type        | Description                             | Example                          |
| --------------- | ----------- | --------------------------------------- | -------------------------------- |
| **Document ID** | `string`    | `{userId}_{questionId}` — deterministic | `abc123_fehi3RDJhBX1QMqIBXUs`   |
| `userId`        | `string`    | Firebase Auth UID of the owner          | `abc123XYZdef456`                |
| `questionId`    | `string`    | Firestore question document ID          | `fehi3RDJhBX1QMqIBXUs`          |
| `content`       | `string`    | Plain text note (supports pasted code)  | `"Remember: traits != classes"`  |
| `createdAt`     | `timestamp` | Server timestamp on first save          | Firestore Timestamp              |
| `updatedAt`     | `timestamp` | Server timestamp on last update         | Firestore Timestamp              |

```json
{
  "userId": "abc123XYZdef456",
  "questionId": "fehi3RDJhBX1QMqIBXUs",
  "content": "Remember: traits solve the diamond problem in PHP",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

## Authentication Flow

```
Google OAuth / Email+Password
    │
    ▼
Firebase Auth (onAuthStateChanged)
    │
    ▼
AuthContext.jsx
    ├── setUser(firebaseUser)
    ├── getDoc('users/{uid}')
    │     ├── exists?  → setRole(data.role)      [admin | user]
    │     └── missing? → setDoc({role:'user'})   [Google sign-in auto-provision]
    └── exposes: { user, userDoc, role, loading, signIn, signInWithGoogle, signOut }
    │
    ▼
AdminRoute.jsx  (role guard)
    ├── loading || role===null → spinner (wait for Firestore role fetch)
    ├── !user                  → /login
    ├── role !== 'admin'       → / (home)
    └── role === 'admin'       → <Outlet /> (admin panel)
```

### Auth Methods

| Method            | Used by                        | Provider                                    |
| ----------------- | ------------------------------ | ------------------------------------------- |
| Google OAuth      | Public users, header Sign In   | `signInWithPopup` + `GoogleAuthProvider`    |
| Email + Password  | Admin login at `/login`        | `signInWithEmailAndPassword`                |

---

## Data Flow

```
Firestore (topics)
    │
    ▼
useTopics() ──► getDocs(collection(db,'topics'))
    │           maps: id, name, title, category, devicon, color (#-prefixed), questionsCount
    ▼
HomePage ──► TopicCard grid
    │
    │  click → /topic/:topicId
    ▼
Firestore (questions, where topicId==topicId, sorted by priority)
    │
    ▼
useQuestions(topicId) ──► difficulty normalised to lowercase
    ▼
TopicPage ──► QuestionItem list (expandable)
    │
    ├── useProgress()  ──► localStorage 'dip_read_questions' { [questionId]: true }
    │
    └── NoteEditor (per question, collapsible)
            │
            ▼ signed-in users only
        useNote(questionId) ──► getDoc/setDoc 'notes/{uid}_{questionId}'
```

---

## Routes

| Path | Component | Guard | Description |
|------|-----------|-------|-------------|
| `/` | `HomePage` | public | Hero, search, category tabs, topic grid |
| `/topic/:topicId` | `TopicPage` | public | Question list, progress, notes |
| `/login` | `LoginPage` | public (redirect to /admin if already admin) | Admin email/password login |
| `/profile` | `ProfilePage` | public (shows sign-in prompt if unauthed) | Edit profile, view all notes |
| `/admin` | `AdminDashboard` | `AdminRoute` (admin only) | Dashboard: counts + action tiles |
| `/admin/topics/new` | `AddTopic` | `AdminRoute` | Create a new topic |
| `/admin/questions/new` | `AddQuestion` | `AdminRoute` | Create a new question with MD editor |

---

## Project Structure

```
interview-questions/
├── .github/
│   └── copilot-instructions.md      ← this file
├── firebase.json                    ← Firebase project config
├── firestore.rules                  ← Security rules (deployed to Firebase)
├── firestore.indexes.json           ← Composite indexes (empty — simple queries only)
├── package.json                     ← Root: firebase-admin + sync-counts script
├── docker-compose.yml               ← Production (nginx on :80)
├── docker-compose.dev.yml           ← Development (Vite HMR; no package-lock.json)
├── scripts/
│   └── sync-question-counts.js      ← CLI: reconcile questionsCount on all topics
├── docker/
│   └── client/
│       ├── Dockerfile               ← Multi-stage: base → dev → build → prod
│       └── nginx.conf               ← SPA fallback (try_files $uri /index.html)
└── client/
    ├── package.json                 ← App deps (includes @uiw/react-md-editor)
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx                 ← Entry: <BrowserRouter><App/>
        ├── App.jsx                  ← All routes + <AuthProvider> wrapper
        ├── lib/
        │   └── firebase.js          ← Exports: db, auth, googleProvider
        ├── contexts/
        │   └── AuthContext.jsx      ← Auth state, role lookup, signIn/signOut/signInWithGoogle
        ├── hooks/
        │   ├── useTopics.js         ← Fetches all topics from Firestore
        │   ├── useQuestions.js      ← Fetches + sorts questions by topicId
        │   ├── useProgress.js       ← localStorage done-state tracking
        │   ├── useTheme.js          ← Dark/light theme toggle (data-theme on <html>)
        │   ├── useNote.js           ← Get/save single note for one question
        │   └── useUserNotes.js      ← Fetch all notes for the signed-in user (profile page)
        ├── components/
        │   ├── AdminRoute.jsx       ← Route guard: spinner → /login → / → <Outlet>
        │   ├── Header.jsx           ← Navbar, theme toggle, Google sign-in, avatar dropdown
        │   ├── Header.css
        │   ├── TopicCard.jsx        ← Home page grid card with progress bar
        │   ├── TopicCard.css
        │   ├── NoteEditor.jsx       ← Collapsible per-question note, Ctrl+Enter save
        │   └── NoteEditor.css
        ├── pages/
        │   ├── HomePage.jsx         ← Hero, search, category filter, topic grid
        │   ├── HomePage.css
        │   ├── TopicPage.jsx        ← Question list, difficulty tabs, progress ring, NoteEditor
        │   ├── TopicPage.css
        │   ├── LoginPage.jsx        ← Admin email/password login form
        │   ├── LoginPage.css
        │   ├── ProfilePage.jsx      ← Edit name/avatar, view all notes grouped by question
        │   ├── ProfilePage.css
        │   └── admin/
        │       ├── AdminLayout.jsx  ← Sidebar nav + topbar (wraps admin pages via <Outlet>)
        │       ├── AdminLayout.css
        │       ├── AdminDashboard.jsx ← Live topic/question counts + quick-action tiles
        │       ├── AdminDashboard.css
        │       ├── AddTopic.jsx     ← Form: title, slug, category pills, color picker, devicon
        │       ├── AddTopic.css
        │       ├── AddQuestion.jsx  ← Form: topic dropdown, difficulty, priority, MD editor
        │       └── AddQuestion.css
        └── data/
            ├── topics.js            ← Legacy static (categories array used for filter tabs)
            └── questions.js         ← Legacy static (not used at runtime)
```

---

## Key Patterns & Conventions

1. **Hooks for data** — Every data concern has its own hook: `useTopics`, `useQuestions`, `useProgress`, `useTheme`, `useNote`, `useUserNotes`.
2. **AuthContext for auth state** — Single context wraps the whole app. All components use `useAuth()` for `{ user, role, loading, signIn, signInWithGoogle, signOut }`. No prop drilling.
3. **BEM-ish CSS** — `block__element--modifier` (e.g. `q-card__header`, `diff-tab--active`, `note-editor--open`).
4. **CSS custom properties** — Theme via `data-theme` on `<html>`. Topic accent via `--tc` inline per card.
5. **Admin writes auto-sync `questionsCount`** — `AddQuestion.jsx` uses a Firestore transaction to increment `questionsCount` on the parent topic after saving. No manual script needed for admin-added content.
6. **Note IDs are deterministic** — `{userId}_{questionId}` — one note per user per question, directly addressable.
7. **Docker — no package-lock.json in container** — prevents `@rollup/rollup-linux-x64-musl` native binding mismatch (macOS host vs. Linux Alpine). `npm install` runs fresh inside the container.
8. **Markdown in answers** — Stored as Markdown strings. Displayed via `react-markdown`. Authored via `@uiw/react-md-editor` split-pane editor in admin.

---

## Field Mapping (Firestore → Component Props)

**Topics (`useTopics.js`):**
| Firestore field | Prop | Notes |
|----------------|------|-------|
| `doc.id` | `topic.id` | slug |
| `title` / `name` | `topic.name`, `topic.title` | |
| `category` | `topic.category` | defaults `'other'` |
| `icon` / `devicon` | `topic.devicon` | |
| `color` | `topic.color` | `#` prepended if missing |
| `questionsCount` | `topic.questionsCount` | defaults `0` |

**Questions (`useQuestions.js`):**
| Firestore field | Prop | Notes |
|----------------|------|-------|
| `doc.id` | `question.id` | |
| `question` | `question.question` | |
| `difficulty` | `question.difficulty` | `.toLowerCase()` applied |
| `answer` | `question.answer` | rendered as Markdown |
| `priority` | (sort key) | sorted ascending client-side |

---

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=dev-interview-preparation
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

---

## Scripts

### `npm run sync-counts` (run from root)

Reconciles `questionsCount` on every topic document by counting all questions in Firestore.

- Uses Firebase CLI refresh token — no service account needed.
- Safe to re-run — skips topics whose count is already correct.
- **When to run:** after bulk imports, manual Firestore edits, or question deletions outside the admin UI.
- **Not needed** for questions added via the admin panel (auto-incremented client-side in `AddQuestion.jsx`).

---

## Admin Panel

### Access
- URL: `/admin` — protected by `AdminRoute` (role guard)
- Login via `/login` using **email + password** (not Google)
- `users/{uid}.role` must equal `"admin"` in Firestore

### Provisioning an admin user (manual)
1. Firebase Console → **Authentication** → Add user (email + password) → copy UID
2. Firestore → `users` collection → new doc with ID = UID, fields:
   - `uid` (string), `email` (string), `displayName` (string), `role: "admin"` (string), `createdAt` (timestamp)

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Live counts + quick-action tiles |
| Add Topic | `/admin/topics/new` | Title, slug (auto-derived, editable), category pills, hex color picker + live preview, Devicon class + live icon preview |
| Add Question | `/admin/questions/new` | Topic dropdown, difficulty segmented control, priority input, question textarea, **split-pane Markdown editor** for answer |
| Manage Topics | `/admin/topics` | Searchable table: edit/delete topics, shows all topic metadata |
| Manage Questions | `/admin/questions` | Topic grid filter + searchable table: edit/delete questions, pagination, backend filtering |
| Edit Topic | `/admin/topics/:topicId/edit` | Full form to update topic (slug is read-only) |
| Edit Question | `/admin/questions/:questionId/edit` | Full form to update question with markdown editor |
| Delete Topic | `/admin/topics/:topicId/delete` | Soft delete handler (sets `deletedAt` timestamp) |
| Delete Question | `/admin/questions/:questionId/delete` | Soft delete handler + decrements topic's `questionsCount` |

### Admin Panel Development

**📘 For detailed admin panel documentation, see:** [`admin-panel-guide.md`](./admin-panel-guide.md)

The separate guide includes:
- Complete architecture overview & design decisions
- Query strategies (avoiding composite indexes)
- Search & pagination patterns with code examples
- Soft delete implementation
- Common issues & solutions (composite index errors, missing imports, etc.)
- Best practices (debouncing, client-side sorting, count fetching)
- Quick reference with reusable patterns
- Development checklist

**Quick notes:**
- Topics/Questions use soft delete (`deletedAt` timestamp)
- ManageQuestions uses two query strategies to avoid composite indexes
- Pagination: 100 items per page (configurable `QUESTIONS_PER_PAGE`)
- Search: 300ms debounce, min 2 characters
- Always import: `where`, `getCountFromServer` from firebase/firestore

---

## User Features (signed-in via Google)

### Sign-In
- Header "Sign In" → Google popup. Avatar + dropdown shows on success.
- First-time: `users/{uid}` doc auto-created with `role: "user"`.
- Dropdown: View Profile → `/profile`, Sign Out.

### Private Notes (NoteEditor)
- Collapsible bar below every expanded question answer.
- Not signed in → inline Google sign-in prompt.
- Signed in → monospace textarea, auto-resize, `Ctrl/Cmd+Enter` to save, unsaved dot indicator, `Saved ✓` feedback.
- Collapsed bar shows 60-char note preview.
- `notes/{userId}_{questionId}` — owner-only, Firestore rules enforced.

### Profile Page (`/profile`)
- **Left:** Avatar (editable URL), display name (inline edit), email, joined date, stats (notes + done count), sign out.
- **Right → My Notes tab:** All notes grouped by question; topic badge, difficulty, question text (links to topic), expandable note content.
## Known Issues / TODOs

- ✅ ~~Firestore rules wide open~~ — admin-only writes + owner-only notes.
- ✅ ~~`difficulty` casing mismatch~~ — normalised to lowercase in `useQuestions.js`.
- ✅ ~~`questionsCount` missing~~ — auto-incremented via admin + `sync-counts` script.
- ✅ ~~`color` missing `#` prefix~~ — prepended in `useTopics.js`.
- ✅ ~~No authentication~~ — Google OAuth + Email/Password implemented.
- 📝 **"Get Pro" button** — disabled, "Coming Soon" badge. No premium tier yet.
- 📝 **Static data files** (`data/questions.js`, `data/topics.js`) still in codebase. `categories` array from `topics.js` still used for filter tabs on home page.
- 📝 **No question/topic editing or deletion** in admin panel — only add is implemented.
- 📝 **`questionsCount` not decremented** on delete — no delete feature yet.
- 📝 **Profile notes pagination** — no limit applied; may need pagination for users with many notes.
- 📝 **No Firestore composite indexes** — only single `where` clauses used so far.

---

## MCP Integration

Firebase MCP is configured at `~/.config/github-copilot/intellij/mcp.json`:

```json
{
  "servers": {
    "firebase": {
      "command": "/Users/sayedyeaminarafat/.nvm/versions/node/v22.11.0/bin/firebase",
      "args": ["experimental:mcp", "--dir", "/Users/sayedyeaminarafat/Projects/Personal/interview-questions"],
      "type": "stdio"
    }
  }
}
```


`firebase experimental:mcp` starts a local MCP (Model Context Protocol) server that exposes Firebase tools — Firestore read/write, Auth management, rule deployment — to AI assistants like GitHub Copilot via stdio. This is how Copilot can directly query/modify Firestore from the editor.
