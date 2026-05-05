# Copilot Instructions — Dev Interview Prep

## Project Overview

**Dev Interview Prep** is a single-page React application that displays curated technical interview questions across 25+ topics. Data is fetched from **Google Cloud Firestore** and rendered with Vite + React 18. User progress is tracked in `localStorage`.

---

## Tech Stack

| Layer        | Technology                                         |
| ------------ | -------------------------------------------------- |
| Framework    | React 18 (JSX, function components, hooks)         |
| Routing      | react-router-dom v7 (`<Routes>`, `useParams`)      |
| Build tool   | Vite 5                                             |
| Styling      | Plain CSS (BEM-ish conventions, CSS custom props)  |
| Icons        | lucide-react + Devicon (via CDN class names)       |
| Markdown     | react-markdown                                     |
| Backend/DB   | Firebase Firestore (client SDK v12)                |
| Hosting      | Docker (multi-stage: dev with Vite, prod with nginx) |
| Auth         | None yet (Sign In / Get Pro buttons are placeholders) |

---

## Firebase Configuration

| Property   | Value                              |
| ---------- | ---------------------------------- |
| Project ID | `dev-interview-preparation`        |
| Project #  | `1018018163951`                    |
| Database   | `(default)`                        |
| Region     | Not specified                      |

- Firebase is initialised in `client/src/lib/firebase.js` using **client SDK** (not Admin SDK).
- Config values come from Vite env vars: `VITE_FIREBASE_*` (see `docker-compose.dev.yml` for the full list).
- The root `package.json` has `firebase-admin` as a devDependency (for scripting/seeding only — not used at runtime).

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /topics/{topicId} {
      allow read: if true;
      allow write: if false;
    }
    match /questions/{questionId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

> Collections are **read-only** from the client. Writes are done via the `scripts/` CLI tools using Firebase CLI authentication.

---

## Firestore Database Structure

The database has **2 root-level collections**: `topics` and `questions`.

### Collection: `topics`

Each document represents a technology/topic card shown on the home page.

| Field              | Type      | Description                                                    | Example                          |
| ------------------ | --------- | -------------------------------------------------------------- | -------------------------------- |
| **Document ID**    | `string`  | Slug identifier, matches `topicId` in the `questions` collection | `php`, `laravel`, `javascript`   |
| `title`            | `string`  | Display name of the topic                                      | `"PHP"`, `"Laravel"`             |
| `category`         | `string`  | One of: `frontend`, `backend`, `language`, `database`, `devops` | `"backend"`                      |
| `color`            | `string`  | Hex colour code (without `#` prefix)                           | `"ff2d20"`, `"777bb4"`           |
| `icon`             | `string`  | Devicon CSS class string                                       | `"devicon-laravel-plain colored"` |
| `questionsCount`   | `integer` | Number of questions for this topic (synced via script)         | `5`, `10`                        |

> **Note:** `color` is stored without `#` in Firestore. The client prepends `#` in `useTopics.js`.
> `questionsCount` is kept in sync by running `npm run sync-counts` (see Scripts section).

#### Example Topic Document (`topics/laravel`)

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

Each document represents a single interview question belonging to a topic.

| Field              | Type      | Description                                           | Example                                        |
| ------------------ | --------- | ----------------------------------------------------- | ---------------------------------------------- |
| **Document ID**    | `string`  | Auto-generated Firestore ID                           | `fehi3RDJhBX1QMqIBXUs`                        |
| `topicId`          | `string`  | References the topic's Document ID in `topics`        | `"php"`, `"javascript"`                        |
| `question`         | `string`  | The interview question text                           | `"What is a Trait in PHP?"`                    |
| `answer`           | `string`  | The answer (supports Markdown formatting)             | `"Traits are a mechanism for code reuse"`      |
| `difficulty`       | `string`  | One of: `beginner`, `intermediate`, `advanced` (may be capitalised in some docs) | `"Intermediate"` |
| `priority`         | `integer` | Sort order within the topic (lower = first)           | `1`, `2`, `3`                                  |

#### Example Question Document (`questions/fehi3RDJhBX1QMqIBXUs`)

```json
{
  "topicId": "php",
  "question": "What is a Trait in PHP?",
  "answer": "Traits are a mechanism for code reuse",
  "difficulty": "Intermediate",
  "priority": 1
}
```

---

## Data Flow

```
Firestore (topics collection)
    │
    ▼
useTopics() hook ──► getDocs(collection(db, 'topics'))
    │                   maps: id, name (from title), category, devicon (from icon), color, questionsCount
    ▼
HomePage ──► TopicCard components (grid)
    │
    │  user clicks a card → navigates to /topic/:topicId
    ▼
Firestore (questions collection, filtered by topicId)
    │
    ▼
useQuestions(topicId) hook ──► query(collection(db, 'questions'), where('topicId', '==', topicId))
    │                            sorts by priority on client side
    ▼
TopicPage ──► QuestionItem components (list)
    │
    ▼
useProgress() hook ──► localStorage key: 'dip_read_questions'
                        tracks { [questionId]: true } for "done" status
```

### Field Mapping (Firestore → Component Props)

**Topics:**
- `doc.id` → `topic.id`
- `title` or `name` → `topic.name` / `topic.title`
- `category` → `topic.category`
- `icon` or `devicon` → `topic.devicon`
- `color` → `topic.color` (client prepends `#` if missing)
- `questionsCount` → `topic.questionsCount` (defaults to `0`)

**Questions:**
- `doc.id` → `question.id`
- `question` → `question.question`
- `difficulty` → `question.difficulty` (normalised to lowercase by `useQuestions.js`)
- `answer` → `question.answer` (rendered as Markdown)
- `priority` → used for sort order

---

## Client-Side Data (Legacy / Fallback)

There are **static data files** at `client/src/data/topics.js` and `client/src/data/questions.js`. These are **NOT used at runtime** — they served as the original dummy data before Firestore was integrated. The `categories` array from `topics.js` is still used for the filter tabs on the home page:

```js
// Categories used for filtering (still imported from data/topics.js)
['all', 'frontend', 'backend', 'language', 'database', 'devops']
```

---

## Project Structure

```
interview-questions/
├── .github/
│   └── copilot-instructions.md      ← this file
├── firebase.json                    ← Firebase project config (Firestore only)
├── firestore.rules                  ← Security rules (read-only for clients)
├── firestore.indexes.json           ← Composite indexes (empty)
├── package.json                     ← Root: firebase deps + sync-counts script
├── docker-compose.yml               ← Production (nginx)
├── docker-compose.dev.yml           ← Development (Vite HMR)
├── scripts/
│   └── sync-question-counts.js      ← CLI: syncs questionsCount to Firestore topics
├── docker/
│   └── client/
│       ├── Dockerfile               ← Multi-stage: base → dev → build → prod
│       └── nginx.conf               ← SPA fallback config
└── client/                          ← React SPA
    ├── package.json                 ← App dependencies
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx                 ← Entry (BrowserRouter wraps App)
        ├── App.jsx                  ← Routes: / and /topic/:topicId
        ├── lib/
        │   └── firebase.js          ← Firebase init (client SDK, env vars)
        ├── hooks/
        │   ├── useTopics.js         ← Fetches all topics from Firestore
        │   ├── useQuestions.js       ← Fetches questions by topicId from Firestore
        │   ├── useProgress.js       ← Read/done tracking via localStorage
        │   └── useTheme.js          ← Dark/light theme toggle
        ├── components/
        │   ├── Header.jsx           ← Nav bar, theme toggle, logo
        │   └── TopicCard.jsx        ← Topic grid card with progress bar
        ├── pages/
        │   ├── HomePage.jsx         ← Hero, search, category tabs, topic grid
        │   └── TopicPage.jsx        ← Topic detail, question list, progress ring
        └── data/
            ├── topics.js            ← Static topics (legacy, categories still used)
            └── questions.js         ← Static questions (legacy, not used)
```

---

## Key Patterns & Conventions

1. **Hooks for data** — Each data concern has its own custom hook (`useTopics`, `useQuestions`, `useProgress`, `useTheme`).
2. **No global state** — No Redux/Zustand/Context. Progress is localStorage-based. Firestore data is fetched per-page.
3. **BEM-ish CSS** — Classes follow `block__element--modifier` naming (e.g. `q-card__header`, `diff-tab--active`).
4. **CSS custom properties** — Theme colours via `data-theme` attribute; topic accent via `--tc` custom prop.
5. **No auth yet** — "Sign In" and "Get Pro" are placeholder buttons. Firestore rules are fully open.
6. **Markdown answers** — Question answers support full Markdown (rendered via `react-markdown`).
7. **Docker multi-stage** — Dev: Vite dev server on port 3000 with HMR. Prod: `npm run build` → nginx on port 80.

---

## Environment Variables

Required in `.env` (used by Docker and Vite):

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

### `npm run sync-counts`

Syncs the `questionsCount` field on every topic document in Firestore. Run this after adding or removing questions.

```bash
cd /path/to/interview-questions
npm run sync-counts
```

- Uses the Firebase CLI login token for authentication (no service account needed).
- Reads all `questions` docs, tallies by `topicId`, patches each `topics/{id}` doc.
- Safe to re-run — skips topics whose count hasn't changed.

---

## Known Issues / TODOs

- ✅ ~~**Firestore rules are wide open**~~ — Now locked to read-only for clients.
- ✅ ~~**`difficulty` casing inconsistency**~~ — `useQuestions.js` normalises to lowercase.
- ✅ ~~**`questionsCount` missing from Firestore topics**~~ — Synced via `npm run sync-counts`.
- ✅ ~~**`color` stored without `#` prefix**~~ — `useTopics.js` prepends `#` if missing.
- 📝 **Static data files** (`data/questions.js`, `data/topics.js`) are no longer primary data sources but are still in the codebase.
- 📝 **No authentication** — Sign In / Get Pro are non-functional.
- 📝 **No Firestore indexes** — Only simple queries used (single `where` clause on `topicId`), so no composite indexes needed yet.
- 📝 **`questionsCount` must be manually synced** — Run `npm run sync-counts` after adding/removing questions. There is no Cloud Function auto-sync (project is frontend-only).

---

## MCP Integration

Firebase MCP is configured at `~/.config/github-copilot/intellij/mcp.json`:

```json
{
  "servers": {
    "firebase": {
      "command": "firebase",
      "args": ["experimental:mcp", "--dir", "<project-root>"],
      "type": "stdio"
    }
  }
}
```

This allows AI assistants (Copilot) to interact with the Firebase project directly from the editor — reading/writing Firestore data, managing rules, etc.

