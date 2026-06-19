# Dev Interview Preparation

A React application (Vite 5) built as a clone of [devinterview.io](https://devinterview.io), containerised with Docker and Docker Compose.

**26 topics · 130 curated Q&A · Progress tracking · Fully dark-themed**

---

## Project Structure

```
interview-questions/
├── client/                         # Vite 5 + React source
│   ├── src/
│   │   ├── components/             # Header, TopicCard
│   │   ├── data/                   # categories.js, questions.js (dummy → Firebase later)
│   │   ├── hooks/                  # useProgress (localStorage)
│   │   └── pages/                  # HomePage, TopicPage
│   └── vite.config.js
├── docker/
│   └── client/
│       ├── Dockerfile              # Multi-stage: base → dev | base → build → production
│       └── nginx.conf
├── .env  /  .env.example
├── docker-compose.yml              # Production (nginx)
└── docker-compose.dev.yml          # Development (hot-reload)
```

---

## Docker — one command always

```bash
docker compose up --build
```

Switch by editing `.env`:

| Mode | `.env` |
|---|---|
| **Development** | `COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml` · `WEB_HTTP_PUBLISH_PORT=3000` |
| **Production** | `COMPOSE_FILE=docker-compose.yml` · `WEB_HTTP_PUBLISH_PORT=80` |

---

## Local Dev (without Docker)

```bash
cd client && npm install && npm run dev
# → http://localhost:3000
```

---

## Site Analysis — devinterview.io Reference

### Design System

| Token | Value |
|---|---|
| Page background | `#060d1f` — very dark navy |
| Nav background | `#08112b` |
| Card background | `#0d1526` |
| Card hover | `#121d35` |
| Accent | `#6366f1` (indigo) |
| Green (progress) | `#10b981` |
| Primary text | `#e8edf5` |
| Secondary text | `#8b9ab5` |
| Muted text | `#4a5568` |
| Border | `rgba(255,255,255,0.07)` |
| Border radius | 10px card, 16px large, 9999px pill |
| Font | Inter (Google Fonts) |
| Tech icons | devicons CDN v2.16.0 |

### Pages

**Home (`/`)**
- Sticky header: `</>` logo + site name, GitHub link, Sign In, Get Pro
- Hero: badge · large title · subtitle · search bar · stats row
- Category filter tabs: All | Frontend | Backend | Languages | Database | DevOps
- Responsive topic grid (`auto-fill minmax(155px, 1fr)`)
- Footer

**Topic (`/topic/:topicId`)**
- Back button
- Topic header: devicon + name + question count + animated progress bar
- Numbered accordion question list
- Each question: read indicator · question text · difficulty badge · chevron
- Answer rendered as Markdown (code blocks, lists, tables)
- "Mark as done" button — persisted in localStorage
- Completion banner when all questions are done

### Key UX Patterns

- **Progress tracking** — `localStorage` key `dip_read_questions` → `{ [questionId]: true }`
- **Category filter + search** — AND logic, both active simultaneously
- **Topic cards** — coloured accent bar on hover / if started; progress bar at bottom when started
- **Difficulty badges** — Beginner (green), Intermediate (amber), Advanced (red)

### Data Architecture

```
categories.js       — id, name, category, devicon, color, questionsCount
questions.js    — { [topicId]: [{ id, question, difficulty, answer }] }
useProgress.js  — localStorage read/write with React state sync
```

### Planned Features

- [ ] Firebase Firestore for topics and questions
- [ ] Firebase Auth (Google sign-in)
- [ ] Per-user cloud progress sync
- [ ] Bookmarks / favourites
- [ ] Full-text search across question bodies
- [ ] Filter by difficulty
- [ ] Dark / light theme toggle
---
## 🎨 Site Analysis — devinterview.io Reference
> Internal notes for building a faithful clone.
### Design System
| Token | Value |
|---|---|
| Page background | `#060d1f` — very dark navy |
| Nav background | `#08112b` — slightly lighter |
| Card background | `#0d1526` — dark card |
| Card hover | `#121d35` |
| Accent | `#6366f1` (indigo) |
| Green (progress) | `#10b981` |
| Primary text | `#e8edf5` |
| Secondary text | `#8b9ab5` |
| Muted text | `#4a5568` |
| Border | `rgba(255,255,255,0.07)` |
| Border radius | 10px (card), 16px (large), 9999px (pill) |
| Font | Inter (Google Fonts) |
| Tech icons | devicons CDN v2.16.0 |
### Pages
1. **Home** (`/`)
   - Sticky header: logo (`</>` icon + name), GitHub link, Sign In, Get Pro
   - Hero: badge · large title · subtitle · search bar · stats row
   - Category filter tabs: All | Frontend | Backend | Languages | Database | DevOps
   - Responsive topic grid (a---
## 🎨 Site Analysis — devinterview.io Reference
> Internal notes for building a T##ic> Internal notes for building a faithful clone.
## N### Design System
| Token | Value |
|---|---|
ac| Token | Value  i|---|---|
| Pageti| Page b·| Nav background | `#08112b` — slightly lighter a| Card background | `#0d1526` — dark card |
| Ca a| Card hover | `#121d35` |
| Accent | `#6366
#| Accent | `#6366f1` (indog| Green (progress) | `#10b981`ag| Primary text | `#e8edf5` |
| re| Secondary text | `#8b9ab5
-| Muted text | `#4a5568` |
|  ? Border | `rgba(255,255,ly| Border radius | 10px (card), 16px co| Font | Inter (Google Fonts) |
| Tech icons | devicons CDNss| Tech icons | devicons CDN v2 *### Pages
1. **Home** (`/`)
   - Stire1. **Homer   - Sticky head A   - Hero: badge · large title · subtitle · search bar · stats row
   op   - Category filter tabs: All | Frontend | Backend | Languages | Datre   - Responsive topic grid (a---
## 🎨 Site Analysis — devinterview.io Referenor## 🎨 Site Analysis — devinec> Internal notes for building a T##ic> Internal nodi## N### Design System
| Token | Value |
|---|---|
ac| Token | Value  i|---|---|
| Pto| Token | Value |
|-??---|---|
ac| To]:ac| Toke``| Pageti| Page b·| Nav backre| Ca a| Card hover | `#121d35` |
| Accent | `#6366
#| Accent | `#6366f1` (indog| Green (progress) | `#10b981`ag| cl| Accent | `#6366
#| Accent | `ks#| Accent | `#63[ | re| Secondary text | `#8b9ab5
-| Muted text | `#4a5568` |
|  ? Border | `rgba(255,25e
-| Mtail -5 /Users/sayedyeaminarafat/Projects/Personal/interview-questions/README.md 2>&1
echo "=== .env ===" && cat /Users/sayedyeaminarafat/Projects/Personal/interview-questions/.env
echo ""
echo "=== docker-compose.dev.yml ===" && cat /Users/sayedyeaminarafat/Projects/Personal/interview-questions/docker-compose.dev.yml
echo ""
echo "=== vite.config.js ===" && cat /Users/sayedyeaminarafat/Projects/Personal/interview-questions/client/vite.config.js
cat /Users/sayedyeaminarafat/Projects/Personal/interview-questions/.env && echo "---" && cat /Users/sayedyeaminarafat/Projects/Personal/interview-questions/docker-compose.dev.yml 2>&1
head -5 /Users/sayedyeaminarafat/Projects/Personal/interview-questions/.env 2>&1
ls /Users/sayedyeaminarafat/Projects/Personal/interview-questions/ 2>&1; echo "exit:$?"
node --input-type=module < /Users/sayedyeaminarafat/Projects/Personal/interview-questions/client/src/data/questions.js 2>&1 | head -20
cd /Users/sayedyeaminarafat/Projects/Personal/interview-questions/client && node -e "import('./src/data/questions.js').then(() => console.log('OK')).catch(e => console.error(e.message, 'line', e.stack?.split('\n')[1]))" 2>&1
cd /Users/sayedyeaminarafat/Projects/Personal/interview-questions/client && npm run build 2>&1
cd /Users/sayedyeaminarafat/Projects/Personal/interview-questions/client && npm run build 2>&1
