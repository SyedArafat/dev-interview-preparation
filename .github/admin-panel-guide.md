# Admin Panel Development Guide

**Dev Interview Prep Admin Panel** — Complete CRUD system for managing topics and questions.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Management Pages](#management-pages)
3. [Query Architecture](#query-architecture)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Best Practices](#best-practices)
6. [Quick Reference](#quick-reference)

---

## Architecture Overview

The admin panel has a complete CRUD (Create, Read, Update, Delete) system for managing topics and questions:

**Management Pages:**
- **ManageTopics** (`/admin/topics`) — Simple searchable table view of all topics
- **ManageQuestions** (`/admin/questions`) — Advanced interface with topic filtering, backend search, and pagination

**Key Features:**
1. ✅ Search & Filter — Real-time search with debouncing (300ms)
2. ✅ Backend Topic Filtering — Click topic card → fetches questions for that topic only
3. ✅ Pagination — Loads 100 questions at a time (configurable via `QUESTIONS_PER_PAGE`)
4. ✅ Soft Delete — Sets `deletedAt` timestamp instead of permanent deletion
5. ✅ Dark Mode Optimized — All UI elements are theme-aware
6. ✅ Count Tracking — Shows "Showing X of Y questions" with `getCountFromServer()`

---

## Management Pages

### ManageTopics (`/admin/topics`)

**Features:**
- Searchable table of all topics
- Edit/delete actions per row
- Displays: title, slug, category, questions count, created date
- No pagination (typically < 50 topics)

**State Management:**
```javascript
const [topics, setTopics] = useState([])
const [filteredTopics, setFilteredTopics] = useState([])
const [search, setSearch] = useState('')
const [loading, setLoading] = useState(true)
const [deleteConfirm, setDeleteConfirm] = useState(null)
```

---

### ManageQuestions (`/admin/questions`)

**Features:**
- Topic grid filter at top
- Backend search with topic awareness
- Pagination (100 questions per page)
- Shows: question text, topic badge, difficulty, priority, created date
- Edit/delete actions per row

**State Management:**
```javascript
const [topics, setTopics] = useState([])           // All topics
const [questions, setQuestions] = useState([])     // Currently loaded questions
const [filteredQuestions, setFilteredQuestions] = useState([])  // After search/filter
const [selectedTopic, setSelectedTopic] = useState(null)  // Active topic filter
const [search, setSearch] = useState('')           // Search term
const [totalCount, setTotalCount] = useState(0)    // Total questions for current filter
const [hasMore, setHasMore] = useState(false)      // Pagination flag
const [lastDoc, setLastDoc] = useState(null)       // Firestore pagination cursor
const [isSearching, setIsSearching] = useState(false)  // Search loading state
```

**Data Flow:**
1. User clicks topic → `handleTopicClick(topic)`
2. Reset state: `setQuestions([])`, `setLastDoc(null)`
3. Fetch: `loadQuestions(true, topic.id)`
4. Fetch count: `fetchTotalCount(topic.id)`
5. Display: "Showing X of Y Laravel questions"

---

## Query Architecture

**Critical Design Decision:** To avoid Firestore composite index requirements, the system uses two different query strategies:

### Strategy 1: Topic-Specific Queries (e.g., Laravel, PHP)

```javascript
// When user clicks a topic card
if (topicId) {
  // Fetch ALL questions for that topic at once
  q = query(
    collection(db, 'questions'),
    where('topicId', '==', topicId)  // ✅ Simple WHERE, no orderBy
  )
  // Sort by priority client-side
  questions.sort((a, b) => (a.priority || 0) - (b.priority || 0))
}
```

**Why:** Most topics have < 100 questions, so fetching all at once is faster and simpler than pagination.  
**Benefit:** No composite index needed for `where + orderBy + startAfter`.

### Strategy 2: All Topics Query (No Filter)

```javascript
// When no topic is selected
else {
  q = query(
    collection(db, 'questions'),
    orderBy('topicId'),           // ✅ Only orderBy, no where
    limit(QUESTIONS_PER_PAGE),
    startAfter(lastDoc)            // Pagination cursor
  )
}
```

**Why:** Paginate when showing all questions (potentially 2500+).  
**Benefit:** Standard Firestore pagination without composite index.

---

## Search Functionality

**Backend Search with Topic Awareness:**

```javascript
// Search respects selected topic filter
if (selectedTopic) {
  q = query(
    collection(db, 'questions'),
    where('topicId', '==', selectedTopic.id)  // Fetch only topic questions
  )
} else {
  q = collection(db, 'questions')  // Fetch all questions
}
// Then filter client-side for search term
const filtered = allQuestions.filter(q =>
  q.question.toLowerCase().includes(searchTerm) ||
  q.topicId.toLowerCase().includes(searchTerm) ||
  q.difficulty.toLowerCase().includes(searchTerm)
)
```

**Features:**
- 300ms debounce to prevent excessive queries
- Min 2 characters to trigger search
- Shows "Searching..." indicator during fetch
- Respects topic filter if active

---

## Soft Delete System

**Implementation:**
- Adds `deletedAt: serverTimestamp()` field to document
- Public queries filter out deleted items: `.filter(q => !q.deletedAt)`
- Admin queries can optionally show deleted items
- Deleted content is recoverable (just remove `deletedAt` field)

**Question Deletion Side Effect:**
```javascript
// When deleting a question, decrement topic's questionsCount
await runTransaction(db, async (transaction) => {
  const topicRef = doc(db, 'topics', question.topicId)
  transaction.update(topicRef, {
    questionsCount: increment(-1)
  })
  transaction.update(questionRef, {
    deletedAt: serverTimestamp()
  })
})
```

---

## Pagination Configuration

**Constant:** `QUESTIONS_PER_PAGE = 100` (top of `ManageQuestions.jsx`)

Change this value to adjust batch size:
- Lower (e.g., 50) = More frequent loads, faster initial load
- Higher (e.g., 200) = Fewer loads, but slower initial render

---

## Common Issues & Solutions

### ❌ Issue: Composite Index Required Error

```
FirebaseError: The query requires an index...
```

**Cause:** Using `where()` + `orderBy()` + `startAfter()` together requires a composite index.

**Solution:** Remove `orderBy()` from Firestore query and sort client-side:

```javascript
// ❌ BAD - Requires composite index
query(collection(db, 'questions'),
  where('topicId', '==', 'laravel'),
  orderBy('priority'),      // ← Causes index requirement
  startAfter(lastDoc)
)

// ✅ GOOD - No index needed
query(collection(db, 'questions'),
  where('topicId', '==', 'laravel')
)
// Sort in JavaScript instead
questions.sort((a, b) => a.priority - b.priority)
```

---

### ❌ Issue: `where is not defined` Error

**Cause:** Missing import from `firebase/firestore`.

**Solution:** Always import all needed Firestore functions:

```javascript
import { 
  getDocs, 
  collection, 
  query, 
  limit, 
  orderBy, 
  startAfter, 
  where,              // ← Don't forget this
  getCountFromServer  // ← For count queries
} from 'firebase/firestore'
```

---

### ❌ Issue: Topic Card Count Shows "0 loaded" Instead of Total

**Cause:** Displaying count from `questions.filter()` instead of topics collection.

**Solution:** Use `questionsCount` from topics collection:

```javascript
// ❌ BAD - Shows loaded count (varies by pagination)
<span>{questions.filter(q => q.topicId === topic.id).length} loaded</span>

// ✅ GOOD - Shows total from database
<span>{topic.questionsCount || 0} questions</span>
```

---

## Best Practices

### 1. Always Filter Deleted Items

```javascript
const questions = snap.docs
  .map(d => ({ id: d.id, ...d.data() }))
  .filter(q => !q.deletedAt)
```

---

### 2. Use `getCountFromServer()` for Efficiency

```javascript
// ❌ Don't fetch all docs just for count
const snap = await getDocs(collection(db, 'questions'))
const count = snap.size  // Wasteful!

// ✅ Use getCountFromServer
const countQuery = query(
  collection(db, 'questions'),
  where('topicId', '==', topicId)
)
const snapshot = await getCountFromServer(countQuery)
const count = snapshot.data().count  // Efficient!
```

---

### 3. Debounce Search Input

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    if (search.length >= 2) {
      performSearch(search)
    }
  }, 300)
  return () => clearTimeout(timer)
}, [search])
```

---

### 4. Sort Client-Side to Avoid Indexes

```javascript
// After fetching questions
questions.sort((a, b) => (a.priority || 0) - (b.priority || 0))
```

---

### 5. Show Loading States

```javascript
{isSearching ? 'Searching...' : `${results.length} results`}
```

---

### 6. Clear Dependent State When Switching Filters

```javascript
function handleTopicClick(topic) {
  setSearch('')     // Clear search when changing topics
  setLastDoc(null)  // Reset pagination
  setQuestions([])  // Clear loaded questions
}
```

---

## Quick Reference

### Essential Firestore Imports

```javascript
import { 
  getDocs,           // Fetch documents
  collection,        // Reference collection
  query,             // Build query
  limit,             // Limit results
  orderBy,           // Sort (avoid with where)
  startAfter,        // Pagination cursor
  where,             // Filter documents
  getCountFromServer // Get count without fetching all docs
} from 'firebase/firestore'
```

---

### Pagination Patterns

**For All Topics (large dataset):**
```javascript
query(
  collection(db, 'questions'),
  orderBy('topicId'),
  limit(100),
  startAfter(lastDoc)
)
```

**For Specific Topic (< 100 questions):**
```javascript
// Fetch all at once, no pagination
query(
  collection(db, 'questions'),
  where('topicId', '==', topicId)
)
```

---

### Search Implementation Pattern

```javascript
// Debounced search with topic awareness
useEffect(() => {
  const timer = setTimeout(() => {
    if (search.length >= 2) {
      performBackendSearch(search)
    }
  }, 300)
  return () => clearTimeout(timer)
}, [search])

async function performBackendSearch(searchTerm) {
  let constraints = []
  if (selectedTopic) {
    constraints.push(where('topicId', '==', selectedTopic.id))
  }
  const q = query(collection(db, 'questions'), ...constraints)
  const snap = await getDocs(q)
  // Filter client-side for text matching
  const filtered = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase()))
}
```

---

### Common State Pattern

```javascript
const [items, setItems] = useState([])              // Loaded items
const [filteredItems, setFilteredItems] = useState([])  // After search/filter
const [search, setSearch] = useState('')            // Search term
const [loading, setLoading] = useState(true)        // Initial load
const [hasMore, setHasMore] = useState(false)       // More items available?
const [lastDoc, setLastDoc] = useState(null)        // Pagination cursor
const [totalCount, setTotalCount] = useState(0)     // Total items count
```

---

### Soft Delete Pattern

```javascript
// Delete
await updateDoc(doc(db, 'questions', questionId), {
  deletedAt: serverTimestamp()
})

// Query (exclude deleted)
const questions = snap.docs
  .map(d => ({ id: d.id, ...d.data() }))
  .filter(q => !q.deletedAt)
```

---

## Checklist for New Admin Features

- [ ] Add route to `App.jsx`
- [ ] Add navigation link to `AdminLayout.jsx`
- [ ] Add dashboard tile to `AdminDashboard.jsx` (if applicable)
- [ ] Create component file in `client/src/pages/admin/`
- [ ] Create corresponding CSS file
- [ ] Wrap with `AdminRoute` guard
- [ ] Import all needed Firestore functions (especially `where`, `getCountFromServer`)
- [ ] Filter out `deletedAt` items in queries
- [ ] Add loading states for all async operations
- [ ] Test in both light and dark mode
- [ ] Verify Firestore security rules allow the operation
- [ ] Check for composite index requirements (avoid `where + orderBy + startAfter`)
- [ ] Add console.log for debugging (remove before commit)
- [ ] Update navigation count badges if applicable

---

## Architecture Decisions

### Why No Composite Indexes?

**Problem:** Composite indexes add complexity:
- Must be manually created in Firebase Console
- Takes time to build for large datasets
- Deployment requires index management

**Solution:** Design queries to avoid them:
- Use only `where` OR `orderBy`, not both
- Sort client-side in JavaScript
- Fetch all for small datasets (< 100 items)

### Why Two Query Strategies?

**Topic-Specific:**
- Topics rarely have > 100 questions
- Fetching all at once is faster
- No pagination UI needed
- Simpler code

**All Topics:**
- Potentially 2500+ questions
- Must paginate for performance
- Standard Firestore pagination works

### Why Soft Delete?

**Benefits:**
- Recoverable if deleted by mistake
- Audit trail (when was it deleted?)
- Can show "Recently deleted" view
- No cascade delete logic needed

**Tradeoffs:**
- Must filter `.filter(q => !q.deletedAt)` in all queries
- Deleted items still count toward Firestore storage/reads

