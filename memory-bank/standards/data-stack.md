# Data Stack

## Overview

All persistent data lives in Firebase Firestore — a NoSQL document database. There is no traditional ORM; data access is done directly through the Firebase client SDK (`firebase/firestore`).

---

## Database

**Firebase Firestore (NoSQL Document Store)**

- **Model**: Collections → Documents → Fields (JSON-like)
- **Access**: Client-side SDK (no server; rules enforce security)
- **Security**: Firestore security rules in `firestore.rules`
- **Indexes**: Composite indexes defined in `firestore.indexes.json`
- **Real-time**: Firestore listeners available (`onSnapshot`) but not currently used project-wide

### Key Collections

| Collection | Description |
|-----------|-------------|
| `topics` | Interview topics (e.g., "JavaScript", "System Design") |
| `questions` | Interview questions, nested under topics or flat with `topicId` |
| `users` | User profiles with `role` field for admin differentiation |

> Add new collections to this table when introduced.

---

## ORM / Database Client

**Firebase JS SDK v12 (`firebase/firestore`)**

No ORM. Data access patterns:

```js
// Read a document
import { doc, getDoc } from 'firebase/firestore';
const snap = await getDoc(doc(db, 'topics', topicId));

// Query a collection
import { collection, query, where, getDocs } from 'firebase/firestore';
const q = query(collection(db, 'questions'), where('topicId', '==', topicId));

// Write
import { setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
```

Firebase client is initialised in `src/lib/firebase.js` (or similar) and exported as `db`.

---

## Data Conventions

- **Document IDs**: Use Firestore auto-generated IDs for user-created docs; use human-readable slugs for content docs (topics, etc.) where possible.
- **Timestamps**: Store as Firestore `Timestamp` objects, not raw strings. Use `serverTimestamp()` for `createdAt` / `updatedAt`.
- **Soft deletes**: Prefer `isDeleted: true` flag over hard deletes for content docs.
- **Markdown content**: Stored as plain Markdown strings in Firestore fields; rendered client-side.

---

## Firestore Rules

Security rules are the sole enforcement layer. Rules live in `firestore.rules`:

- Public reads for `topics` and `questions`
- Authenticated reads/writes for `users` (own doc only)
- Admin-only writes for `topics` and `questions` (check `role == 'admin'` via custom claims or a user doc lookup)

Always test rule changes with the Firebase emulator before deploying.

