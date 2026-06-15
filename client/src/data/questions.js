// Dummy Q&A data — will be replaced by Firebase Firestore
// Format: { id, question, difficulty, answer (markdown) }

const q = (id, question, difficulty, answer) => ({ id, question, difficulty, answer })

const questions = {

  // ── JavaScript ────────────────────────────────────────────────────
  javascript: [
    q('js_1', 'What is the difference between var, let, and const?', 'beginner',
`**\`var\`** is function-scoped and hoisted to the top of its function. It can be re-declared and updated.

**\`let\`** is block-scoped. It cannot be re-declared in the same scope but can be updated.

**\`const\`** is block-scoped and cannot be re-assigned. However, objects/arrays declared with \`const\` can still be mutated.

\`\`\`js
var x = 1;  var x = 2; // ✅ OK

let y = 1;  let y = 2; // ❌ SyntaxError

const z = { a: 1 };
z.a = 99;   // ✅ mutation allowed
z = {};     // ❌ re-assignment not allowed
\`\`\``),

    q('js_2', 'What is a closure in JavaScript?', 'intermediate',
`A **closure** is a function that retains access to variables from its outer (enclosing) scope even after that scope has finished executing.

\`\`\`js
function makeCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}
const counter = makeCounter();
counter(); // 1
counter(); // 2
\`\`\`

Closures are widely used for data encapsulation, factory functions, and callbacks.`),

    q('js_3', 'Explain the JavaScript Event Loop.', 'intermediate',
`JavaScript is **single-threaded** — it executes one task at a time. The Event Loop enables asynchronous behaviour:

1. **Call Stack** — where currently executing functions live.
2. **Web APIs** — browser-provided APIs (setTimeout, fetch, DOM events) run outside the stack.
3. **Callback / Task Queue** — completed async callbacks wait here.
4. **Microtask Queue** — Promises and \`queueMicrotask\` callbacks (higher priority than the task queue).

The loop continuously checks: *if the call stack is empty*, it pulls from the microtask queue first, then the task queue.

\`\`\`js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
\`\`\``),

    q('js_4', 'What are Promises and how does async/await work?', 'intermediate',
`A **Promise** represents the eventual result of an async operation. It has three states: *pending*, *fulfilled*, or *rejected*.

\`\`\`js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve('done!'), 1000);
});
p.then(val => console.log(val)).catch(err => console.error(err));
\`\`\`

**\`async/await\`** is syntactic sugar over Promises that makes async code read like synchronous code:

\`\`\`js
async function fetchUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
\`\`\``),

    q('js_5', 'What is prototypal inheritance?', 'intermediate',
`In JavaScript, every object has an internal link to another object called its **prototype**. When you access a property, the engine first checks the object, then traverses the prototype chain.

\`\`\`js
const animal = { eat() { return 'nom nom'; } };
const dog = Object.create(animal);
dog.bark = function() { return 'woof'; };

dog.eat();  // 'nom nom' — inherited from animal
dog.bark(); // 'woof'
\`\`\`

ES6 \`class\` syntax is syntactic sugar over prototypal inheritance.`),

    q('js_6', 'What are callbacks in JavaScript?', 'beginner',
`A **callback** is a function passed into another function to be executed later, usually after an asynchronous operation completes.

Callbacks are commonly used for:
- Handling async work such as timers, file reads, and API requests.
- Reusing behaviour by passing custom logic into a function.
- Responding to events like clicks, form submissions, and network responses.

\`\`\`js
function fetchData(url, callback) {
  setTimeout(() => {
    callback({ url, status: 'ok' })
  }, 1000)
}

fetchData('/api/users', (result) => {
  console.log('Done:', result)
})
\`\`\`

Too many nested callbacks can lead to **callback hell**, so Promises and async/await are often preferred for complex async flows.`),
  ],

  // ── TypeScript ────────────────────────────────────────────────────
  typescript: [
    q('ts_1', 'What is TypeScript and why use it over JavaScript?', 'beginner',
`**TypeScript** is a statically-typed superset of JavaScript that compiles to plain JS. Benefits include:

- **Compile-time error detection** — catch bugs before runtime.
- **IntelliSense / autocomplete** — better IDE tooling.
- **Self-documenting code** — types serve as inline documentation.
- **Refactoring confidence** — type system highlights all affected code.`),

    q('ts_2', 'What is the difference between interface and type?', 'intermediate',
`Both describe object shapes, but they differ in flexibility:

\`\`\`ts
// interface — extendable, supports declaration merging
interface User { name: string; }
interface User { age: number; } // merged ✅

// type — more powerful for unions, intersections, mapped types
type ID = string | number;
type Admin = User & { role: 'admin' };
\`\`\`

**Rule of thumb:** use \`interface\` for object shapes; use \`type\` for unions, intersections, and complex types.`),

    q('ts_3', 'What are generics in TypeScript?', 'intermediate',
`**Generics** allow you to write reusable, type-safe code that works with multiple types.

\`\`\`ts
function identity<T>(arg: T): T {
  return arg;
}
identity<string>('hello'); // type: string
identity<number>(42);      // type: number

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
}
\`\`\``),

    q('ts_4', 'Explain union and intersection types.', 'intermediate',
`**Union** (\`|\`) — a value can be *one of* several types:
\`\`\`ts
type StringOrNumber = string | number;
function format(val: StringOrNumber) { return String(val); }
\`\`\`

**Intersection** (\`&\`) — a value must satisfy *all* types:
\`\`\`ts
type Named = { name: string };
type Aged  = { age: number };
type Person = Named & Aged;  // must have both name and age
\`\`\`\``),

  // ── React ─────────────────────────────────────────────────────────
  react: [
    q('react_1', 'What is the Virtual DOM and how does React use it?', 'beginner',
`The **Virtual DOM (VDOM)** is a lightweight, in-memory JavaScript representation of the actual DOM.

**How React uses it:**
1. When state changes, React re-renders the component into a *new* VDOM tree.
2. React **diffs** the new tree against the previous one (reconciliation).
3. Only the *minimal set of real DOM changes* is applied (patching).

This avoids expensive direct DOM manipulations and improves performance.`),

    q('react_2', 'What are React Hooks and why were they introduced?', 'beginner',
`**Hooks** let you use state and other React features in function components (previously only possible in class components).

Key built-in hooks:
- **\`useState\`** — manage local state.
- **\`useEffect\`** — side effects (data fetching, subscriptions).
- **\`useContext\`** — consume context without nesting.
- **\`useMemo\`** / **\`useCallback\`** — performance optimisation.
- **\`useRef\`** — persist a value without causing re-renders.

They were introduced in React 16.8 to simplify code reuse and remove the complexity of class lifecycles.`),

    q('react_3', 'What is the difference between props and state?', 'beginner',
`| | **Props** | **State** |
|---|---|---|
| Owned by | Parent component | The component itself |
| Mutable? | ❌ Read-only | ✅ Via setState / useState |
| Triggers re-render? | Yes (if parent re-renders) | Yes (on change) |

\`\`\`jsx
// Props — passed from parent
function Greeting({ name }) { return <h1>Hello, {name}</h1>; }

// State — owned locally
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\``),

    q('react_4', 'What is React.memo and when should you use it?', 'intermediate',
`**\`React.memo\`** is a higher-order component that memoises a component — it skips re-rendering if the props haven't changed (shallow comparison).

\`\`\`jsx
const Card = React.memo(function Card({ title }) {
  console.log('rendered');
  return <div>{title}</div>;
});
\`\`\`

**Use it when:**
- A component renders often with the same props.
- The render is computationally expensive.

**Don't overuse it** — memo itself has a cost (comparison). Only apply it when profiling confirms a performance problem.`),

    q('react_5', 'Explain the useEffect hook and its dependency array.', 'intermediate',
`\`useEffect\` runs a side effect after the component renders.

\`\`\`jsx
useEffect(() => {
  // runs after every render
});

useEffect(() => {
  // runs only once (on mount)
}, []);

useEffect(() => {
  // runs when userId changes
  fetchUser(userId);
}, [userId]);

useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup on unmount
}, []);
\`\`\`

The **dependency array** controls when the effect re-runs. Missing deps cause stale closure bugs; unnecessary deps cause excess re-runs.`),
  ],

  // ── Vue.js ────────────────────────────────────────────────────────
  vuejs: [
    q('vue_1', 'What is the difference between the Options API and Composition API?', 'beginner',
`**Options API** organises code by option type (\`data\`, \`methods\`, \`computed\`, etc.) — familiar and simple for small components.

**Composition API** organises code by *logical concern*, using \`setup()\` and composables — better for complex components and code reuse.

\`\`\`js
// Composition API
import { ref, computed } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    return { count, double }
  }
}
\`\`\``),

    q('vue_2', 'What are Vue directives?', 'beginner',
`Directives are special HTML attributes prefixed with \`v-\` that reactively apply side-effects to the DOM.

| Directive | Purpose |
|---|---|
| \`v-bind\` | Bind attribute to expression |
| \`v-model\` | Two-way data binding |
| \`v-if / v-else\` | Conditional rendering |
| \`v-for\` | List rendering |
| \`v-on\` | Event listener |
| \`v-show\` | Toggle visibility (CSS) |`),

    q('vue_3', 'What is the Vue reactivity system?', 'intermediate',
`Vue 3 uses **Proxy**-based reactivity. When you wrap a value with \`reactive()\` or \`ref()\`, Vue intercepts get/set operations to track dependencies and trigger updates.

\`\`\`js
import { reactive, ref } from 'vue'

const state = reactive({ count: 0 }) // object — accessed directly
const name  = ref('Alice')           // primitive — accessed via .value

state.count++ // triggers update
name.value = 'Bob' // triggers update
\`\`\``),

    q('vue_4', 'What is Vuex / Pinia and when do you need it?', 'intermediate',
`**Vuex** (Vue 2/3) and **Pinia** (Vue 3 recommended) are centralised state management libraries.

Use them when:
- State must be shared across many unrelated components.
- State changes need to be tracked (dev tools time-travel).
- Props drilling becomes unmanageable.

**Pinia** is simpler: no mutations, better TypeScript support, modular stores by default.`),

    q('vue_5', 'What is the difference between v-if and v-show?', 'beginner',
`**\`v-if\`** — conditionally *renders* the element. The DOM node is destroyed/created on toggle. Use when the condition rarely changes.

**\`v-show\`** — *always* renders the element but toggles \`display: none\`. Use for frequent toggles (e.g., modals).

\`\`\`html
<p v-if="isAdmin">Admin panel</p>   <!-- removed from DOM if false -->
<p v-show="isVisible">Tooltip</p>   <!-- CSS hidden, still in DOM -->
\`\`\``),
  ],

  // ── Angular ───────────────────────────────────────────────────────
  angular: [
    q('ng_1', 'What is Angular and what are its core building blocks?', 'beginner',
`**Angular** is a TypeScript-based front-end framework by Google. Core building blocks:

- **Modules** (\`NgModule\`) — group related code.
- **Components** — view + logic units with templates.
- **Services** — shared business logic, injected via DI.
- **Directives** — extend HTML behaviour.
- **Pipes** — transform data in templates.
- **Routing** — navigation between views.`),

    q('ng_2', 'What is dependency injection in Angular?', 'intermediate',
`**Dependency Injection (DI)** is a design pattern where a class receives its dependencies from an external source rather than creating them itself.

Angular's DI system:
1. Services are decorated with \`@Injectable({ providedIn: 'root' })\`.
2. Angular's injector creates a singleton instance.
3. Components declare the dependency in their constructor.

\`\`\`ts
@Injectable({ providedIn: 'root' })
export class UserService { getUser() { return { name: 'Alice' }; } }

@Component({ ... })
export class ProfileComponent {
  constructor(private userService: UserService) {}
}
\`\`\``),

    q('ng_3', 'What is the difference between Observable and Promise?', 'intermediate',
`| | **Promise** | **Observable** |
|---|---|---|
| Values | Single | Multiple (stream) |
| Lazy? | No — executes immediately | Yes — until subscribed |
| Cancellable? | ❌ | ✅ via unsubscribe |
| Operators | Limited (.then/.catch) | Rich (RxJS) |

Angular uses **RxJS Observables** heavily for HTTP, event handling, and forms.`),

    q('ng_4', 'What are Angular lifecycle hooks?', 'intermediate',
`Lifecycle hooks let you tap into key moments of a component's life:

| Hook | When |
|---|---|
| \`ngOnInit\` | After first \`ngOnChanges\`, component initialised |
| \`ngOnChanges\` | When input properties change |
| \`ngDoCheck\` | On every change detection run |
| \`ngOnDestroy\` | Just before component is destroyed |
| \`ngAfterViewInit\` | After component view is initialised |`),

    q('ng_5', 'What is Change Detection in Angular?', 'advanced',
`Angular's **Change Detection (CD)** checks component trees for data changes and updates the DOM accordingly.

Two strategies:
- **\`Default\`** — checks every component on any async event (zone.js-driven).
- **\`OnPush\`** — only checks when: input references change, an event originates from the component, or \`markForCheck()\` is called. More performant.

\`\`\`ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
\`\`\``),
  ],

  // ── Next.js ───────────────────────────────────────────────────────
  nextjs: [
    q('next_1', 'What is Next.js and what problems does it solve?', 'beginner',
`**Next.js** is a React framework that adds server-side capabilities. It solves:

- **SEO** — SSR/SSG produces HTML crawlable by search engines.
- **Performance** — pre-rendering, automatic code splitting, image optimisation.
- **DX** — file-based routing, API routes, built-in TypeScript support.
- **Deployment** — zero-config with Vercel, Edge runtime support.`),

    q('next_2', 'What is the difference between SSR, SSG, and ISR?', 'intermediate',
`| | **SSR** | **SSG** | **ISR** |
|---|---|---|---|
| Rendered | Per request | At build time | At build time + revalidated |
| Fresh data? | Always | Only on rebuild | After revalidation interval |
| Speed | Slower (server work) | Fastest (CDN cached) | Fast + fresh |
| Use case | User-specific pages | Marketing/blog | E-commerce, news |`),

    q('next_3', 'Explain the App Router vs Pages Router.', 'intermediate',
`**Pages Router** (legacy) — files in \`/pages\` export a React component. Simple and widely used.

**App Router** (Next.js 13+) — files in \`/app\` use **React Server Components (RSC)** by default. Key differences:

- Components are server-rendered unless marked \`'use client'\`.
- Layouts, loading, error, and not-found files are co-located.
- Server Actions replace API routes for mutations.
- Better data fetching patterns (async server components, \`fetch\` caching).`),

    q('next_4', 'What are Server Components and Client Components?', 'intermediate',
`**Server Components** run *only on the server*. They can:
- Access databases/file system directly.
- Keep sensitive keys off the client.
- Have zero JS bundle impact.

**Client Components** (\`'use client'\`) run in the browser. They can:
- Use state (\`useState\`), effects (\`useEffect\`).
- Handle user interactions.

\`\`\`tsx
// ServerComponent.tsx — no 'use client', no hooks
async function UserList() {
  const users = await db.getUsers(); // direct DB access
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\``),

    q('next_5', 'How does Next.js handle image optimisation?', 'beginner',
`The \`<Image>\` component from \`next/image\` provides:

- **Automatic WebP/AVIF** conversion.
- **Lazy loading** by default.
- **Responsive sizes** via \`sizes\` prop.
- **Preventing CLS** — reserves space with \`width\` and \`height\`.

\`\`\`tsx
import Image from 'next/image';
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
\`\`\``),
  ],

  // ── HTML ──────────────────────────────────────────────────────────
  html: [
    q('html_1', 'What is semantic HTML and why does it matter?', 'beginner',
`**Semantic HTML** uses elements that convey *meaning* about their content (\`<article>\`, \`<nav>\`, \`<main>\`, \`<aside>\`, etc.) rather than generic containers (\`<div>\`, \`<span>\`).

**Why it matters:**
- **Accessibility** — screen readers understand page structure.
- **SEO** — search engines better index meaningful content.
- **Maintainability** — self-documenting markup.

\`\`\`html
<!-- Non-semantic -->
<div class="nav"><div class="item">Home</div></div>

<!-- Semantic -->
<nav><a href="/">Home</a></nav>
\`\`\``),

    q('html_2', 'What is the difference between block and inline elements?', 'beginner',
`**Block elements** start on a new line and take up the full available width: \`<div>\`, \`<p>\`, \`<h1>-<h6>\`, \`<section>\`, \`<ul>\`.

**Inline elements** flow within text and only take up as much width as their content: \`<span>\`, \`<a>\`, \`<strong>\`, \`<img>\`.

CSS \`display\` property can override this behaviour.`),

    q('html_3', 'What are data attributes and when should you use them?', 'intermediate',
`**Data attributes** (\`data-*\`) store custom data directly on HTML elements without using non-standard attributes or JavaScript object properties.

\`\`\`html
<button data-user-id="42" data-action="delete">Delete</button>
\`\`\`

\`\`\`js
const btn = document.querySelector('button');
console.log(btn.dataset.userId);  // "42"
console.log(btn.dataset.action);  // "delete"
\`\`\`

Use them for small amounts of auxiliary data needed by JavaScript. For large data, prefer JavaScript variables.`),

    q('html_4', 'What is the purpose of the meta viewport tag?', 'beginner',
`The \`<meta name="viewport">\` tag controls how the browser scales and sizes the page on mobile devices.

\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
\`\`\`

Without it, mobile browsers render the page at a desktop width (~980px) and scale it down, making text tiny. This tag tells the browser to match the screen width and use 1:1 pixel ratio.`),

    q('html_5', 'What is ARIA and when should you use it?', 'intermediate',
`**ARIA (Accessible Rich Internet Applications)** is a set of HTML attributes that help assistive technologies understand UI components that don't have native semantic meaning.

\`\`\`html
<button aria-label="Close dialog" aria-pressed="false" onclick="closeModal()">✕</button>
<div role="alert" aria-live="polite">Form saved successfully!</div>
\`\`\`

**Rule:** First use the correct semantic HTML element. Only add ARIA when you can't achieve accessibility with native HTML. *"No ARIA is better than bad ARIA."*`),
  ],

  // ── CSS ───────────────────────────────────────────────────────────
  css: [
    q('css_1', 'What is the CSS Box Model?', 'beginner',
`Every element is represented as a rectangular box with four areas from inside out:

1. **Content** — the actual text/image.
2. **Padding** — space between content and border.
3. **Border** — the border line.
4. **Margin** — space outside the border.

By default, \`width\` and \`height\` apply only to the content area (\`box-sizing: content-box\`). With \`box-sizing: border-box\`, width/height include padding and border — much easier to work with.`),

    q('css_2', 'What is the difference between Flexbox and Grid?', 'intermediate',
`**Flexbox** is one-dimensional (row *or* column). Best for:
- Navigation bars, button groups, centering content.
- When you want children to grow/shrink fluidly.

**CSS Grid** is two-dimensional (rows *and* columns). Best for:
- Page layouts, card grids, complex 2D layouts.
- When you need precise control over both axes.

They complement each other: use Grid for layout, Flexbox for component internals.`),

    q('css_3', 'What are CSS custom properties (variables)?', 'intermediate',
`CSS custom properties (variables) are defined with \`--\` prefix and accessed with \`var()\`.

\`\`\`css
:root {
  --primary-color: #6366f1;
  --font-size-lg:  1.25rem;
}

.button {
  background: var(--primary-color);
  font-size: var(--font-size-lg, 1rem); /* 1rem is fallback */
}
\`\`\`

Unlike preprocessor variables (Sass/Less), CSS variables are live — they can be changed by JavaScript and cascade through the DOM.`),

    q('css_4', 'What is CSS specificity and how is it calculated?', 'intermediate',
`**Specificity** determines which CSS rule wins when multiple rules target the same element.

Specificity is scored as **(A, B, C)**:
- **A** — inline styles (1,0,0)
- **B** — ID selectors (0,1,0)
- **C** — class/pseudo-class/attribute selectors (0,0,1)
- Element selectors add 0,0,0 for tag names

\`\`\`css
#nav a.active   /* 0,1,1 */
.nav a          /* 0,0,1 */
a               /* 0,0,0 */
\`\`\`

\`!important\` overrides all specificity but should be avoided.`),

    q('css_5', 'What is the difference between position: relative, absolute, fixed, and sticky?', 'intermediate',
`| Value | Offset relative to | Stays in flow? | Scrolls with page? |
|---|---|---|---|
| \`relative\` | Itself (original position) | ✅ | ✅ |
| \`absolute\` | Nearest positioned ancestor | ❌ | ✅ |
| \`fixed\` | Viewport | ❌ | ❌ |
| \`sticky\` | Nearest scrolling ancestor | ✅ | Until threshold |

A common pattern: \`position: relative\` on a container + \`position: absolute\` on a child to place it precisely within that container.`),
  ],

  // ── Node.js ───────────────────────────────────────────────────────
  nodejs: [
    q('node_1', 'What is Node.js and how does its event-driven model work?', 'beginner',
`**Node.js** is a JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on the server.

Its **event-driven, non-blocking I/O** model:
- A single thread handles requests via the **Event Loop**.
- I/O operations (DB, file, network) are offloaded to **libuv** thread pool.
- Callbacks/Promises resolve when I/O completes — the main thread is never blocked.

This makes Node ideal for high-concurrency, I/O-bound workloads (APIs, real-time apps).`),

    q('node_2', 'What is the difference between require() and ES Modules (import)?', 'intermediate',
`| | **CommonJS (\`require\`)** | **ESM (\`import\`)** |
|---|---|---|
| Loading | Synchronous, dynamic | Asynchronous, static |
| Tree shaking | ❌ | ✅ |
| Top-level \`await\` | ❌ | ✅ |
| File extension | \`.js\` (default) | \`.mjs\` or \`"type": "module"\` |

Node supports both. For new projects, prefer ESM.`),

    q('node_3', 'What is middleware in Node.js/Express?', 'beginner',
`**Middleware** is a function with access to \`(req, res, next)\` that runs in the request-response cycle. It can modify req/res, end the cycle, or call \`next()\` to pass control.

\`\`\`js
// Logger middleware
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.url}\`);
  next(); // pass to next middleware
});

// Auth middleware
app.use('/api', (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ error: 'Unauthorized' });
  next();
});
\`\`\``),

    q('node_4', 'What are streams in Node.js?', 'advanced',
`**Streams** are objects that let you read or write data piece-by-piece (chunks) rather than loading everything into memory.

Four types:
- **Readable** — source of data (\`fs.createReadStream\`)
- **Writable** — destination for data (\`fs.createWriteStream\`)
- **Duplex** — both readable and writable (TCP sockets)
- **Transform** — duplex that transforms data (zlib compression)

\`\`\`js
const fs = require('fs');
fs.createReadStream('large.csv')
  .pipe(transform)
  .pipe(fs.createWriteStream('output.csv'));
\`\`\``),

    q('node_5', 'How does Node.js handle errors in async code?', 'intermediate',
`Three main patterns:

**1. Callbacks** — error-first convention:
\`\`\`js
fs.readFile('file.txt', (err, data) => {
  if (err) return console.error(err);
  console.log(data);
});
\`\`\`

**2. Promises / async-await:**
\`\`\`js
try {
  const data = await fs.promises.readFile('file.txt');
} catch (err) {
  console.error(err);
}
\`\`\`

**3. EventEmitter \`'error'\` event:** Always attach an error listener on streams/emitters to prevent uncaught exceptions from crashing the process.`),
  ],


        q('node_6', 'What is Node.js and what is NestJS?', 'beginner',
    `**Node.js** is an open-source, cross-platform JavaScript runtime environment. It allows JavaScript to run outside the browser on servers and local machines.

    Node.js itself is **not a framework** — it provides the runtime environment, not the application structure.

    **NestJS** is a framework built on top of Node.js and TypeScript/JavaScript. It gives you architecture, modules, controllers, dependency injection, and opinionated patterns for building backend applications.

    Think of it like this:

    | Layer | PHP Stack | JavaScript Stack |
    |---|---|---|
    | Language | PHP | JavaScript / TypeScript |
    | Runtime | PHP Zend Engine | Node.js / V8 |
    | Framework | Laravel | NestJS |`),

        q('node_7', 'How does Node.js work?', 'intermediate',
    `Node.js works on a **single-threaded, event-driven architecture** powered by the V8 JavaScript engine and libuv.

    1. **Main thread** — executes your JavaScript code and runs the event loop.
    2. **libuv thread pool** — handles expensive or blocking tasks such as file system access, crypto, compression, and DNS lookups.
    3. **Callback queues** — completed async work is queued and processed when the call stack is free.

    Because the main thread never waits on slow I/O, Node.js can handle many concurrent requests efficiently.`),

        q('node_8', 'What is the event loop?', 'intermediate',
    `The **event loop** is the mechanism that lets Node.js process asynchronous work without blocking the main thread.

    It continuously checks:
    - **Call stack** — synchronous code currently running.
    - **Callback queues** — completed async tasks waiting to run.

    Typical order of work:
    1. Run synchronous code.
    2. Process **nextTick** and microtasks.
    3. Handle timers and I/O callbacks.
    4. Run check-phase callbacks like \\`setImmediate\\`.

    This is what makes non-blocking I/O possible in Node.js.`),

        q('node_9', 'What is the difference between synchronous and asynchronous functions?', 'beginner',
    `| | **Synchronous** | **Asynchronous** |
    |---|---|---|
    | Execution | Blocks until the task completes | Continues running while waiting |
    | Flow | One task at a time | Can schedule work and continue |
    | Result | Returned immediately | Usually returned via callback, Promise, or async/await |
    | Best for | Small, predictable tasks | I/O, network requests, timers, long-running operations |

    ```js
    // Synchronous
    const value = calculate();

    // Asynchronous
    fetch('/api/data')
      .then(res => res.json())
      .then(data => console.log(data));
    ```

    Async code keeps Node responsive when work takes time.`),

        q('node_10', 'What is the purpose of the require keyword in Node.js?', 'beginner',
    `The **\`require\`** keyword loads modules in CommonJS.

    It is used to import:
    - Built-in modules like \\`http\\`, \\`fs\\`, and \\`path\\`.
    - Third-party packages from \\`node_modules\\`.
    - Local files in your project.

    ```js
    const http = require('http')
    const express = require('express')
    const helper = require('./helper')
    ```

    In modern Node.js, ES Modules (\`import\`) are also supported, but \\`require\\` remains common in existing codebases.`),

        q('node_11', 'What is package.json in Node.js?', 'beginner',
    `\`package.json\` is the manifest file for a Node.js project.

    It typically stores:
    - Project metadata such as name, version, and description.
    - Dependencies and devDependencies.
    - Scripts like \\`npm start\\` or \\`npm run build\\`.
    - Entry points and runtime settings.

    ```json
    {
      "name": "my-app",
      "version": "1.0.0",
      "scripts": {
        "start": "node server.js"
      },
      "dependencies": {
        "express": "^4.18.0"
      }
    }
    ```

    It is the main file npm uses to understand, install, and run your project.`),

  // ── Python ────────────────────────────────────────────────────────
  python: [
    q('py_1', 'What are Python list comprehensions?', 'beginner',
`**List comprehensions** provide a concise way to create lists.

\`\`\`python
# Traditional loop
squares = []
for i in range(10):
    squares.append(i ** 2)

# List comprehension
squares = [i ** 2 for i in range(10)]

# With condition
evens = [i for i in range(20) if i % 2 == 0]

# Nested
matrix = [[j for j in range(3)] for i in range(3)]
\`\`\``),

    q('py_2', 'What is the difference between a list, tuple, and set in Python?', 'beginner',
`| | **List** | **Tuple** | **Set** |
|---|---|---|---|
| Ordered | ✅ | ✅ | ❌ |
| Mutable | ✅ | ❌ | ✅ |
| Duplicates | ✅ | ✅ | ❌ |
| Syntax | \`[1, 2]\` | \`(1, 2)\` | \`{1, 2}\` |

Use tuples for immutable sequences, sets for unique membership testing (O(1)), and lists for ordered mutable collections.`),

    q('py_3', 'What are Python decorators?', 'intermediate',
`A **decorator** is a function that wraps another function to extend or modify its behaviour without changing its source code.

\`\`\`python
import functools, time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
\`\`\``),

    q('py_4', 'What is a generator and how is it different from a list?', 'intermediate',
`A **generator** is an iterator that yields values one at a time using the \`yield\` keyword. It does *not* store all values in memory.

\`\`\`python
# List — all values in memory
squares_list = [x**2 for x in range(1_000_000)]

# Generator — produces one value at a time
def squares_gen(n):
    for x in range(n):
        yield x**2

for s in squares_gen(1_000_000):
    print(s)  # uses almost no memory
\`\`\``),

    q('py_5', 'Explain Python\'s GIL (Global Interpreter Lock).', 'advanced',
`The **GIL** is a mutex in CPython that allows only one thread to execute Python bytecode at a time, even on multi-core CPUs.

**Implications:**
- **CPU-bound code** → threads don't benefit from multiple cores. Use \`multiprocessing\` or \`concurrent.futures.ProcessPoolExecutor\`.
- **I/O-bound code** → threads work fine because I/O releases the GIL.

Alternatives that avoid the GIL: PyPy, Jython, or Python 3.13's experimental free-threaded mode.`),
  ],

  // ── PHP ───────────────────────────────────────────────────────────
  php: [
    q('php_1', 'What are PHP traits and why are they useful?', 'intermediate',
`**Traits** are a mechanism for code reuse in single-inheritance languages like PHP. They allow you to include methods in multiple classes without inheritance.

\`\`\`php
trait Timestampable {
    public function createdAt(): string {
        return date('Y-m-d H:i:s');
    }
}

class User { use Timestampable; }
class Post { use Timestampable; }

$user = new User();
echo $user->createdAt();
\`\`\``),

    q('php_2', 'What is the difference between == and === in PHP?', 'beginner',
`**\`==\`** (loose comparison) converts types before comparing.
**\`===\`** (strict comparison) checks both value *and* type.

\`\`\`php
0 == "foo"   // true  (type juggling: "foo" → 0)
0 === "foo"  // false (different types)
null == false // true
null === false // false
\`\`\`

Always use \`===\` unless you intentionally need type coercion.`),

    q('php_3', 'What are PHP namespaces?', 'intermediate',
`**Namespaces** organise code into logical groups and prevent naming conflicts between classes, functions, or constants.

\`\`\`php
namespace App\\Controllers;

use App\\Models\\User;
use Illuminate\\Http\\Request;

class UserController {
    public function show(Request $request, int $id): User {
        return User::findOrFail($id);
    }
}
\`\`\``),

    q('php_4', 'What is Composer and how does autoloading work?', 'beginner',
`**Composer** is PHP's dependency manager. It downloads packages from Packagist and manages them in \`vendor/\`.

**Autoloading:** Composer generates a \`vendor/autoload.php\` file. When you call \`require 'vendor/autoload.php'\`, PHP automatically finds and loads class files on demand without manual \`require\` statements.

PSR-4 autoloading maps namespaces to directory paths:
\`\`\`json
"autoload": {
  "psr-4": { "App\\\\": "src/" }
}
\`\`\``),

    q('php_5', 'What are PHP generators?', 'intermediate',
`PHP generators let you iterate over data without building a full array in memory, using the \`yield\` keyword.

\`\`\`php
function fibonacci(): Generator {
    [$a, $b] = [0, 1];
    while (true) {
        yield $a;
        [$a, $b] = [$b, $a + $b];
    }
}

$gen = fibonacci();
for ($i = 0; $i < 10; $i++) {
    echo $gen->current() . ' ';
    $gen->next();
}
\`\`\``),
  ],

  // ── Laravel ───────────────────────────────────────────────────────
  laravel: [
    q('laravel_1', 'What is Laravel\'s service container?', 'intermediate',
`The **service container** is a powerful IoC (Inversion of Control) container for managing class dependencies and performing dependency injection.

\`\`\`php
// Binding
app()->bind(PaymentGateway::class, StripeGateway::class);

// Resolving
$gateway = app(PaymentGateway::class); // returns StripeGateway

// Auto-resolution in controllers
class OrderController extends Controller {
    public function __construct(private PaymentGateway $gateway) {}
}
\`\`\``),

    q('laravel_2', 'What is Eloquent ORM?', 'beginner',
`**Eloquent** is Laravel's ActiveRecord ORM. Each database table has a corresponding **Model** class.

\`\`\`php
// Model
class User extends Model {
    protected $fillable = ['name', 'email'];
    public function posts() { return $this->hasMany(Post::class); }
}

// Querying
User::where('active', true)->orderBy('name')->get();
User::find(1)->posts()->latest()->take(5)->get();

// Creating
User::create(['name' => 'Alice', 'email' => 'alice@example.com']);
\`\`\``),

    q('laravel_3', 'What are Laravel migrations?', 'beginner',
`**Migrations** are version-controlled database schema changes, allowing teams to keep DB structure in sync.

\`\`\`php
// database/migrations/2024_01_01_create_users_table.php
public function up(): void {
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->timestamps();
    });
}

public function down(): void {
    Schema::dropIfExists('users');
}
\`\`\`

Run: \`php artisan migrate\` / Roll back: \`php artisan migrate:rollback\``),

    q('laravel_4', 'What is Laravel middleware?', 'intermediate',
`**Middleware** filters HTTP requests entering the application. Common uses: authentication, CORS, rate limiting, logging.

\`\`\`php
// app/Http/Middleware/EnsureAdmin.php
public function handle(Request $request, Closure $next): Response {
    if (!$request->user()?->isAdmin()) {
        return redirect('/home');
    }
    return $next($request);
}

// Route
Route::get('/admin', AdminController::class)->middleware('admin');
\`\`\``),

    q('laravel_5', 'What are Laravel queues and jobs?', 'intermediate',
`**Queues** defer time-consuming tasks (sending emails, processing images) to run in the background.

\`\`\`php
// Create job: php artisan make:job SendWelcomeEmail
class SendWelcomeEmail implements ShouldQueue {
    public function __construct(public User $user) {}
    public function handle(): void {
        Mail::to($this->user)->send(new WelcomeMail($this->user));
    }
}

// Dispatch
SendWelcomeEmail::dispatch($user);

// Process queue
// php artisan queue:work
\`\`\``),
  ],

  // ── Django ────────────────────────────────────────────────────────
  django: [
    q('django_1', 'What is Django\'s MTV architecture?', 'beginner',
`Django follows **MTV (Model–Template–View)**, which is similar to MVC:

- **Model** — defines data structure (maps to DB tables via ORM).
- **Template** — HTML with Django template language for presentation.
- **View** — contains business logic, processes requests, returns responses.

The **URL dispatcher** routes incoming URLs to the appropriate view.`),

    q('django_2', 'What is the Django ORM?', 'beginner',
`Django's **ORM** lets you interact with your database using Python objects instead of SQL.

\`\`\`python
# models.py
class Article(models.Model):
    title = models.CharField(max_length=200)
    published = models.DateTimeField(auto_now_add=True)

# Querying
Article.objects.filter(title__contains='Django').order_by('-published')[:10]

# Creating
Article.objects.create(title='Django ORM Guide')
\`\`\``),

    q('django_3', 'What is Django middleware?', 'intermediate',
`**Middleware** is a hook framework of callable components that process requests and responses globally.

Built-in middleware includes: \`SecurityMiddleware\`, \`SessionMiddleware\`, \`AuthenticationMiddleware\`, \`CsrfViewMiddleware\`.

\`\`\`python
class TimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = time.time() - start
        response['X-Duration'] = f'{duration:.3f}s'
        return response
\`\`\``),

    q('django_4', 'What are Django signals?', 'intermediate',
`**Signals** allow decoupled applications to get notified when certain actions occur.

\`\`\`python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
\`\`\`

Common signals: \`pre_save\`, \`post_save\`, \`pre_delete\`, \`post_delete\`, \`request_started\`.`),

    q('django_5', 'What is Django REST Framework (DRF)?', 'beginner',
`**DRF** is a powerful toolkit for building Web APIs on top of Django.

Key components:
- **Serializers** — convert complex data (querysets, model instances) to/from JSON.
- **ViewSets** — combine CRUD logic into a single class.
- **Routers** — automatically generate URLs for ViewSets.
- **Authentication** — Token, JWT, Session.
- **Permissions** — fine-grained access control.`),
  ],

  // ── Express ───────────────────────────────────────────────────────
  express: [
    q('express_1', 'What is Express.js and what is it used for?', 'beginner',
`**Express.js** is a minimal, unopinionated web framework for Node.js. It provides a thin layer of fundamental web application features:

- Routing (GET, POST, PUT, DELETE).
- Middleware pipeline.
- Request/Response helpers.
- Template engine integration.

It's the foundation for many full-stack frameworks (NestJS, Sails.js) and is ideal for building REST APIs.`),

    q('express_2', 'How does routing work in Express?', 'beginner',
`\`\`\`js
const express = require('express');
const router = express.Router();

router.get('/users',       getUsers);
router.get('/users/:id',   getUserById);
router.post('/users',      createUser);
router.put('/users/:id',   updateUser);
router.delete('/users/:id', deleteUser);

// Route parameters
router.get('/users/:id', (req, res) => {
  const { id } = req.params;   // /users/42 → id = "42"
  const { limit } = req.query; // /users/42?limit=10
  res.json({ id, limit });
});

module.exports = router;
\`\`\``),

    q('express_3', 'What is Express error handling middleware?', 'intermediate',
`Error-handling middleware has **four parameters**: \`(err, req, res, next)\`. Express recognises the 4-arg signature as an error handler.

\`\`\`js
// Must be defined AFTER all routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Trigger error from a route
app.get('/fail', (req, res, next) => {
  const err = new Error('Something went wrong');
  err.statusCode = 400;
  next(err); // pass to error handler
});
\`\`\``),

    q('express_4', 'How do you implement authentication in Express?', 'intermediate',
`Common approaches:

**1. JWT (stateless):**
\`\`\`js
const jwt = require('jsonwebtoken');

// Issue token on login
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Middleware to verify
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}
\`\`\``),

    q('express_5', 'What is CORS and how do you handle it in Express?', 'intermediate',
`**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that blocks requests from a different origin unless the server explicitly allows it.

\`\`\`js
const cors = require('cors');

// Allow all origins (development)
app.use(cors());

// Restrict to specific origin (production)
app.use(cors({
  origin: 'https://myapp.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
\`\`\``),
  ],

  // ── Java ──────────────────────────────────────────────────────────
  java: [
    q('java_1', 'What is the difference between JDK, JRE, and JVM?', 'beginner',
`- **JVM (Java Virtual Machine)** — executes Java bytecode. Platform-specific but provides platform independence for Java code.
- **JRE (Java Runtime Environment)** — JVM + standard libraries. Needed to *run* Java programs.
- **JDK (Java Development Kit)** — JRE + compiler (\`javac\`) + dev tools. Needed to *develop* Java programs.`),

    q('java_2', 'What is the difference between == and .equals() in Java?', 'beginner',
`**\`==\`** compares *object references* (memory addresses).
**\`.equals()\`** compares *object content* (overridden in most classes).

\`\`\`java
String a = new String("hello");
String b = new String("hello");

a == b        // false — different objects in memory
a.equals(b)   // true  — same content

// String literals are interned
String c = "hello";
String d = "hello";
c == d        // true — same reference in string pool
\`\`\``),

    q('java_3', 'What are Java generics?', 'intermediate',
`**Generics** enable classes and methods to operate on typed parameters, providing compile-time type safety.

\`\`\`java
// Generic class
public class Box<T> {
    private T value;
    public void set(T val) { this.value = val; }
    public T get() { return value; }
}

Box<String> box = new Box<>();
box.set("hello");

// Bounded type parameter
public <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}
\`\`\``),

    q('java_4', 'What are Java Streams?', 'intermediate',
`Java 8 **Streams** provide a declarative, functional-style pipeline for processing collections.

\`\`\`java
List<String> names = List.of("Alice", "Bob", "Charlie", "Dave");

List<String> result = names.stream()
    .filter(name -> name.length() > 3)    // intermediate
    .map(String::toUpperCase)              // intermediate
    .sorted()                              // intermediate
    .collect(Collectors.toList());         // terminal

// ALICE, CHARLIE, DAVE
\`\`\``),

    q('java_5', 'What is the difference between abstract class and interface?', 'intermediate',
`| | **Abstract Class** | **Interface** |
|---|---|---|
| Multiple inheritance | ❌ (extends one) | ✅ (implements many) |
| Constructors | ✅ | ❌ |
| Fields | Any | Only \`public static final\` |
| Methods | Abstract + concrete | Abstract + default + static (Java 8+) |
| Use when | Shared base with state | Defining a contract/capability |`),
  ],

  // ── C# ───────────────────────────────────────────────────────────
  csharp: [
    q('cs_1', 'What is the difference between value types and reference types in C#?', 'beginner',
`**Value types** store data directly. Stored on the stack. Copying creates an independent copy: \`int\`, \`double\`, \`bool\`, \`struct\`, \`enum\`.

**Reference types** store a reference (pointer) to heap memory. Copying copies the reference, not the data: \`class\`, \`string\`, \`interface\`, \`delegate\`, arrays.

\`\`\`csharp
int a = 10; int b = a; b = 20; // a is still 10

var list1 = new List<int> { 1, 2 };
var list2 = list1; // same reference
list2.Add(3);      // list1 also has 3
\`\`\``),

    q('cs_2', 'What is LINQ?', 'intermediate',
`**LINQ (Language Integrated Query)** allows querying collections, databases, and XML using C# syntax.

\`\`\`csharp
var numbers = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// Query syntax
var evens = from n in numbers
            where n % 2 == 0
            select n * n;

// Method syntax (more common)
var evens2 = numbers
    .Where(n => n % 2 == 0)
    .Select(n => n * n)
    .ToList();
\`\`\``),

    q('cs_3', 'What are async/await and Tasks in C#?', 'intermediate',
`**\`Task\`** represents an asynchronous operation. **\`async/await\`** is syntactic sugar for Task-based asynchronous code.

\`\`\`csharp
public async Task<string> FetchDataAsync(string url) {
    using var client = new HttpClient();
    var response = await client.GetAsync(url);       // non-blocking wait
    return await response.Content.ReadAsStringAsync();
}

// Calling it
var data = await FetchDataAsync("https://api.example.com/data");
\`\`\``),

    q('cs_4', 'What is dependency injection in ASP.NET Core?', 'intermediate',
`ASP.NET Core has a **built-in DI container**. Services are registered in \`Program.cs\` and injected via constructor.

\`\`\`csharp
// Register service
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();

// Inject into controller
public class UserController : ControllerBase {
    private readonly IUserService _userService;
    public UserController(IUserService userService) {
        _userService = userService;
    }
}
\`\`\``),

    q('cs_5', 'What are the differences between IEnumerable, ICollection, and IList?', 'intermediate',
`- **\`IEnumerable<T>\`** — forward-only read. Only \`GetEnumerator()\`. Supports \`foreach\` and LINQ.
- **\`ICollection<T>\`** — adds \`Count\`, \`Add\`, \`Remove\`, \`Contains\`.
- **\`IList<T>\`** — adds indexed access (\`list[0]\`), \`Insert\`, \`IndexOf\`.

Use the most abstract type in method parameters to maximise flexibility (e.g., accept \`IEnumerable<T>\` if you only need to iterate).`),
  ],

  // ── Go ────────────────────────────────────────────────────────────
  go: [
    q('go_1', 'What makes Go different from other languages?', 'beginner',
`Go is designed for simplicity and performance:

- **Compiled** — fast binary output, no VM.
- **Goroutines** — lightweight concurrent functions (managed by Go runtime, not OS threads).
- **Garbage collected** but with low-latency GC.
- **No classes or inheritance** — uses structs and interfaces.
- **Explicit error handling** — no exceptions; errors are values.
- **Fast compilation** — even large codebases compile in seconds.`),

    q('go_2', 'What are goroutines and channels?', 'intermediate',
`**Goroutines** are lightweight threads managed by the Go runtime (started with \`go\` keyword).

**Channels** are typed conduits for goroutines to communicate and synchronise.

\`\`\`go
func sum(s []int, ch chan int) {
    total := 0
    for _, v := range s { total += v }
    ch <- total // send to channel
}

nums := []int{1, 2, 3, 4, 5}
ch := make(chan int)
go sum(nums[:3], ch)
go sum(nums[3:], ch)
a, b := <-ch, <-ch // receive from channel
fmt.Println(a + b)
\`\`\``),

    q('go_3', 'What is an interface in Go?', 'intermediate',
`In Go, an **interface** is satisfied *implicitly* — there is no \`implements\` keyword. Any type that has the required methods satisfies the interface.

\`\`\`go
type Writer interface {
    Write(p []byte) (n int, err error)
}

// File satisfies Writer (it has a Write method)
// bytes.Buffer satisfies Writer
// Any custom type with Write satisfies Writer

func save(w Writer, data []byte) { w.Write(data) }
\`\`\``),

    q('go_4', 'How does Go handle errors?', 'intermediate',
`Go treats errors as **ordinary values** returned from functions.

\`\`\`go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 0)
if err != nil {
    log.Printf("error: %v", err)
    return
}
fmt.Println(result)
\`\`\`

Custom error types are created by implementing the \`error\` interface (\`Error() string\`).`),

    q('go_5', 'What is the Go module system?', 'beginner',
`Go **modules** (introduced in Go 1.11) are the standard dependency management system.

- \`go.mod\` — defines the module path and Go version.
- \`go.sum\` — cryptographic checksums of dependencies.

\`\`\`bash
go mod init github.com/user/project  # create module
go get github.com/gin-gonic/gin      # add dependency
go mod tidy                          # remove unused deps
\`\`\``),
  ],

  // ── Rust ──────────────────────────────────────────────────────────
  rust: [
    q('rust_1', 'What is Rust\'s ownership system?', 'intermediate',
`**Ownership** is Rust's memory management model — no garbage collector, no manual malloc/free.

Three rules:
1. Each value has one **owner**.
2. There can only be **one owner at a time**.
3. When the owner goes out of scope, the value is **dropped** (freed).

\`\`\`rust
let s1 = String::from("hello");
let s2 = s1; // s1 is MOVED, no longer valid
// println!("{}", s1); // ❌ compile error

let s3 = s2.clone(); // explicit deep copy
println!("{} {}", s2, s3); // ✅
\`\`\``),

    q('rust_2', 'What are borrowing and references in Rust?', 'intermediate',
`**Borrowing** lets you use a value without taking ownership. References are created with \`&\`.

Rules:
- You can have *either* one **mutable reference** (\`&mut\`) *or* any number of **immutable references** — never both simultaneously.
- References must always be valid (no dangling pointers).

\`\`\`rust
fn print_len(s: &String) { // borrows, doesn't own
    println!("{}", s.len());
}

let mut s = String::from("hello");
print_len(&s);  // immutable borrow
s.push_str("!"); // OK — borrow is over
\`\`\``),

    q('rust_3', 'What is the Result type in Rust?', 'intermediate',
`**\`Result<T, E>\`** is Rust's primary error handling type — an enum with two variants:

\`\`\`rust
enum Result<T, E> {
    Ok(T),   // success with value T
    Err(E),  // failure with error E
}

fn parse_number(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.trim().parse::<i32>()
}

match parse_number("42") {
    Ok(n)  => println!("Got: {}", n),
    Err(e) => println!("Error: {}", e),
}

// Shorthand with ? operator
let n: i32 = "42".trim().parse()?; // propagates error if Err
\`\`\``),

    q('rust_4', 'What are traits in Rust?', 'intermediate',
`**Traits** define shared behaviour — similar to interfaces in other languages.

\`\`\`rust
trait Greet {
    fn hello(&self) -> String;
    fn goodbye(&self) -> String {
        format!("Goodbye from {}", self.hello()) // default implementation
    }
}

struct English;
impl Greet for English {
    fn hello(&self) -> String { "Hello!".to_string() }
}

// Trait bound
fn greet_user<T: Greet>(g: T) { println!("{}", g.hello()); }
\`\`\``),

    q('rust_5', 'What is the difference between Stack and Heap in Rust?', 'beginner',
`**Stack** — fixed-size data known at compile time. Allocation/deallocation is LIFO and very fast. Stores: integers, booleans, arrays with fixed size, structs of stack types.

**Heap** — dynamic-size data. Slower allocation (requires allocator bookkeeping). Accessed via a pointer (which is on the stack).

\`\`\`rust
let x: i32 = 5;            // stack
let s = String::from("hi"); // heap (pointer on stack, data on heap)
let b = Box::new(5);        // explicitly heap-allocated integer
\`\`\``),
  ],

  // ── MySQL ─────────────────────────────────────────────────────────
  mysql: [
    q('mysql_1', 'What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?', 'beginner',
`- **\`INNER JOIN\`** — returns only rows where the condition matches in *both* tables.
- **\`LEFT JOIN\`** — returns all rows from the *left* table; matched rows from the right (NULLs if no match).
- **\`RIGHT JOIN\`** — returns all rows from the *right* table; matched rows from the left.

\`\`\`sql
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- Returns all users, even those with no orders (total = NULL)
\`\`\``),

    q('mysql_2', 'What are indexes and how do they improve performance?', 'intermediate',
`An **index** is a data structure (usually B-Tree) that allows the database to find rows quickly without scanning the entire table.

\`\`\`sql
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_created ON orders(user_id, created_at); -- composite
\`\`\`

**Trade-offs:** Indexes speed up SELECT queries but slow down INSERT/UPDATE/DELETE (index must be updated). Avoid over-indexing.`),

    q('mysql_3', 'What is database normalization?', 'intermediate',
`**Normalization** is the process of organizing a database to reduce redundancy and improve data integrity.

- **1NF** — atomic values, no repeating groups.
- **2NF** — no partial dependencies on composite keys.
- **3NF** — no transitive dependencies (non-key columns depend only on the PK).
- **BCNF** — stricter form of 3NF.

In practice, most production databases aim for 3NF, then strategically *denormalize* for read performance.`),

    q('mysql_4', 'What is the difference between TRUNCATE and DELETE?', 'beginner',
`| | **DELETE** | **TRUNCATE** |
|---|---|---|
| WHERE clause | ✅ | ❌ |
| Transaction rollback | ✅ | ❌ (DDL) |
| Fires triggers | ✅ | ❌ |
| Resets AUTO_INCREMENT | ❌ | ✅ |
| Speed | Slower (row-by-row) | Faster (deallocates pages) |`),

    q('mysql_5', 'What are stored procedures and when should you use them?', 'advanced',
`A **stored procedure** is a precompiled set of SQL statements stored in the database.

\`\`\`sql
DELIMITER //
CREATE PROCEDURE GetUserOrders(IN userId INT)
BEGIN
    SELECT o.id, o.total, o.created_at
    FROM orders o
    WHERE o.user_id = userId
    ORDER BY o.created_at DESC;
END //
DELIMITER ;

CALL GetUserOrders(42);
\`\`\`

**Use when:** complex multi-step operations need to run close to the data, or you need to reduce network round-trips.`),
  ],

  // ── PostgreSQL ────────────────────────────────────────────────────
  postgresql: [
    q('pg_1', 'What features make PostgreSQL different from MySQL?', 'beginner',
`PostgreSQL is a **full ACID-compliant, object-relational** database with advanced features:

- **JSONB** — binary JSON with indexing, operators, and functions.
- **Window functions** — advanced analytics.
- **CTEs (WITH)** — recursive queries.
- **Full-text search** — built-in tsvector/tsquery.
- **Custom types and extensions** (PostGIS, TimescaleDB).
- **MVCC** — better concurrency; reads never block writes.`),

    q('pg_2', 'What are CTEs (Common Table Expressions)?', 'intermediate',
`A **CTE** (using \`WITH\`) is a named temporary result set defined before the main query — improves readability and enables recursion.

\`\`\`sql
-- Non-recursive
WITH recent_orders AS (
    SELECT user_id, SUM(total) as spent
    FROM orders WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY user_id
)
SELECT u.name, r.spent
FROM users u JOIN recent_orders r ON u.id = r.user_id
ORDER BY r.spent DESC;

-- Recursive (e.g., org chart)
WITH RECURSIVE subordinates AS (
    SELECT id, name, manager_id FROM employees WHERE id = 1
    UNION ALL
    SELECT e.id, e.name, e.manager_id FROM employees e
    JOIN subordinates s ON s.id = e.manager_id
)
SELECT * FROM subordinates;
\`\`\``),

    q('pg_3', 'What are JSONB indexes and operators?', 'intermediate',
`PostgreSQL's **JSONB** type stores JSON in a binary format allowing indexing and fast operations.

\`\`\`sql
CREATE TABLE products (id SERIAL, data JSONB);
INSERT INTO products(data) VALUES ('{"name":"Laptop","price":999,"tags":["tech","sale"]}');

-- GIN index for @> containment queries
CREATE INDEX idx_products_data ON products USING GIN(data);

-- Operators
SELECT * FROM products WHERE data @> '{"tags": ["sale"]}';
SELECT data->>'name' as name, (data->>'price')::int as price FROM products;
\`\`\``),

    q('pg_4', 'What are PostgreSQL window functions?', 'advanced',
`**Window functions** perform calculations across a set of related rows without collapsing them into groups.

\`\`\`sql
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank,
    AVG(salary) OVER (PARTITION BY department) as dept_avg,
    LAG(salary) OVER (ORDER BY salary) as prev_salary
FROM employees;
\`\`\``),

    q('pg_5', 'What is VACUUM in PostgreSQL?', 'advanced',
`PostgreSQL uses **MVCC** — old row versions are kept until they're no longer needed by any transaction. **VACUUM** reclaims this dead space.

- \`VACUUM\` — reclaims dead tuples; table remains accessible.
- \`VACUUM FULL\` — rewrites the table (locks it); reclaims more space.
- \`ANALYZE\` — updates query planner statistics.
- **Autovacuum** — runs automatically in the background.

\`\`\`sql
VACUUM ANALYZE orders; -- vacuum + update stats
\`\`\``),
  ],

  // ── MongoDB ───────────────────────────────────────────────────────
  mongodb: [
    q('mongo_1', 'What is MongoDB and when should you use it?', 'beginner',
`**MongoDB** is a document-oriented NoSQL database that stores data as BSON (Binary JSON) documents in collections.

**Use MongoDB when:**
- Data is hierarchical or varies in structure.
- You need horizontal scaling (sharding).
- Rapid iteration / schema evolution is needed.
- Document model naturally represents your domain (e.g., e-commerce products).

**Prefer SQL when:** data is highly relational, strict ACID compliance is required, or complex JOINs are frequent.`),

    q('mongo_2', 'What is the aggregation pipeline?', 'intermediate',
`The **aggregation pipeline** processes documents through a sequence of stages.

\`\`\`js
db.orders.aggregate([
  { $match:  { status: "completed" } },         // filter
  { $group:  { _id: "$userId",
               total: { $sum: "$amount" } } },  // group
  { $sort:   { total: -1 } },                   // sort
  { $limit:  10 },                              // top 10
  { $lookup: {                                  // join users
      from: "users", localField: "_id",
      foreignField: "_id", as: "user"
  }}
])
\`\`\``),

    q('mongo_3', 'What types of indexes does MongoDB support?', 'intermediate',
`- **Single field** — on one field.
- **Compound** — on multiple fields (order matters).
- **Multikey** — on array fields (indexes each element).
- **Text** — full-text search.
- **Geospatial** — 2dsphere for geo queries.
- **Hashed** — for hash-based sharding.
- **TTL** — auto-deletes documents after a time (e.g., session data).

\`\`\`js
db.users.createIndex({ email: 1 }, { unique: true })
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // TTL
\`\`\``),

    q('mongo_4', 'What is the difference between embedded documents and references?', 'intermediate',
`**Embedded (denormalised):** Store related data inside the same document.

\`\`\`json
{ "_id": 1, "name": "Alice",
  "address": { "street": "123 Main", "city": "NY" } }
\`\`\`
✅ Fast reads (one query). ❌ Data duplication; harder to update.

**References (normalised):** Store only the \`_id\` of the related document.
\`\`\`json
{ "_id": 1, "name": "Alice", "addressId": ObjectId("...") }
\`\`\`
✅ Consistency, smaller docs. ❌ Requires \`$lookup\` (extra query).`),

    q('mongo_5', 'What is a replica set in MongoDB?', 'intermediate',
`A **replica set** is a group of MongoDB instances that maintain the same data for high availability.

- **Primary** — accepts all write operations.
- **Secondaries** — replicate from the primary asynchronously.
- **Arbiter** — votes in elections, holds no data.

If the primary fails, the secondaries **elect** a new primary automatically. Reads can be distributed to secondaries for horizontal read scaling.`),
  ],

  // ── Redis ─────────────────────────────────────────────────────────
  redis: [
    q('redis_1', 'What is Redis and what are its common use cases?', 'beginner',
`**Redis** is an in-memory data structure store used as a database, cache, and message broker.

**Common use cases:**
- **Caching** — reduce database load (HTML fragments, API responses).
- **Session storage** — fast user session management.
- **Rate limiting** — use \`INCR\` + \`EXPIRE\` on request counters.
- **Pub/Sub** — real-time messaging.
- **Queues** — \`LPUSH\`/\`BRPOP\` for job queues.
- **Leaderboards** — Sorted Sets with scores.`),

    q('redis_2', 'What are Redis data structures?', 'intermediate',
`| Type | Use case | Example command |
|---|---|---|
| **String** | Cache values, counters | \`SET key val\`, \`INCR hits\` |
| **Hash** | Object fields | \`HSET user:1 name Alice\` |
| **List** | Queues, timelines | \`LPUSH\`, \`RPOP\` |
| **Set** | Unique tags, membership | \`SADD\`, \`SISMEMBER\` |
| **Sorted Set** | Leaderboards, ranked data | \`ZADD\`, \`ZRANGE\` |
| **Stream** | Event log | \`XADD\`, \`XREAD\` |
| **Bitmap** | Feature flags, analytics | \`SETBIT\`, \`BITCOUNT\` |`),

    q('redis_3', 'How does Redis handle persistence?', 'intermediate',
`Two persistence modes:

**RDB (Redis Database Backup)** — point-in-time snapshots saved to disk periodically.
- Pros: compact file, fast restart. Cons: data loss between snapshots.

**AOF (Append-Only File)** — logs every write command.
- Pros: minimal data loss (\`fsync\` every second). Cons: larger files, slower restart.

**Recommendation:** Use both — AOF for durability, RDB for fast recovery.`),

    q('redis_4', 'What is Redis TTL (Time-To-Live)?', 'beginner',
`**TTL** automatically expires keys after a set duration.

\`\`\`bash
SET session:abc123 "user_data"
EXPIRE session:abc123 3600    # expires in 1 hour

# Or atomic SET + EXPIRE
SET session:abc123 "user_data" EX 3600

TTL session:abc123   # remaining seconds (-1 = no expiry, -2 = expired)
PERSIST session:abc123  # remove expiry
\`\`\`

Expired keys are lazily deleted (on access) or actively purged by a background process.`),

    q('redis_5', 'What is Redis Pub/Sub?', 'intermediate',
`**Pub/Sub** is a messaging pattern where publishers send messages to channels and subscribers receive them.

\`\`\`bash
# Subscriber (in one terminal)
SUBSCRIBE notifications

# Publisher (in another terminal)
PUBLISH notifications '{"type":"order","id":42}'
\`\`\`

\`\`\`js
// Node.js with ioredis
const sub = new Redis();
const pub = new Redis();

await sub.subscribe('notifications');
sub.on('message', (channel, msg) => console.log(msg));
await pub.publish('notifications', JSON.stringify({ type: 'alert' }));
\`\`\``),
  ],

  // ── Docker ────────────────────────────────────────────────────────
  docker: [
    q('docker_1', 'What is the difference between a Docker image and a container?', 'beginner',
`**Image** — a read-only, immutable template containing the OS, runtime, code, and dependencies. Built from a Dockerfile. Like a class definition.

**Container** — a running (or stopped) instance of an image. Like an object instantiated from a class. Multiple containers can run from the same image simultaneously.

\`\`\`bash
docker build -t myapp:latest .    # build image
docker run -p 3000:3000 myapp     # create + start container
docker ps                          # list running containers
\`\`\``),

    q('docker_2', 'What are multi-stage Dockerfile builds?', 'intermediate',
`**Multi-stage builds** allow you to use multiple \`FROM\` statements in one Dockerfile, copying only the artefacts you need into the final image — reducing image size dramatically.

\`\`\`dockerfile
# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve (no node_modules, no source)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
\`\`\``),

    q('docker_3', 'What is the difference between CMD and ENTRYPOINT?', 'intermediate',
`Both define the command that runs when a container starts, but:

**\`CMD\`** — provides default arguments, easily overridden at \`docker run\` time.
**\`ENTRYPOINT\`** — defines the executable; \`CMD\` becomes its default arguments.

\`\`\`dockerfile
# CMD only — easily overridden
CMD ["node", "server.js"]  # docker run myapp python other.py ← overrides

# ENTRYPOINT + CMD pattern
ENTRYPOINT ["node"]
CMD ["server.js"]
# docker run myapp other.js → runs: node other.js
\`\`\``),

    q('docker_4', 'What are Docker volumes and bind mounts?', 'intermediate',
`Both persist data outside the container lifecycle:

**Volumes** — managed by Docker, stored in \`/var/lib/docker/volumes/\`. Best for production data.

**Bind mounts** — map a host directory into the container. Best for development (hot-reload).

\`\`\`yaml
# docker-compose.yml
services:
  app:
    volumes:
      - app_data:/data          # named volume
      - ./src:/app/src          # bind mount (dev hot-reload)

volumes:
  app_data:
\`\`\``),

    q('docker_5', 'What is Docker networking?', 'intermediate',
`Docker containers communicate through **networks**. By default, Docker Compose creates a shared network for all services in a \`compose.yml\`.

**Driver types:**
- **bridge** (default) — isolated network on a single host. Containers communicate by service name.
- **host** — shares the host's network stack. No isolation.
- **none** — no networking.
- **overlay** — multi-host networking for Docker Swarm.

\`\`\`yaml
services:
  api:
    networks: [backend]
  db:
    networks: [backend]
networks:
  backend: {}
\`\`\``),
  ],

  // ── Kubernetes ────────────────────────────────────────────────────
  kubernetes: [
    q('k8s_1', 'What are the core components of Kubernetes?', 'beginner',
`**Control Plane:**
- **API Server** — all kubectl/client requests go here.
- **etcd** — distributed key-value store (cluster state).
- **Scheduler** — assigns pods to nodes.
- **Controller Manager** — reconciles desired vs actual state.

**Worker Nodes:**
- **kubelet** — runs pods, reports to API server.
- **kube-proxy** — manages network rules for services.
- **Container runtime** — runs containers (containerd, CRI-O).`),

    q('k8s_2', 'What is a Pod and why is it the smallest unit?', 'beginner',
`A **Pod** is the smallest deployable unit in Kubernetes. It wraps one or more containers that:

- Share the same **network namespace** (localhost + port).
- Share the same **storage volumes**.
- Are always scheduled on the same node.

Most Pods have a single container. Multi-container Pods are used for sidecar patterns (logging, proxies).

\`\`\`yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: nginx:alpine
    ports:
    - containerPort: 80
\`\`\``),

    q('k8s_3', 'What is the difference between a Deployment and a StatefulSet?', 'intermediate',
`| | **Deployment** | **StatefulSet** |
|---|---|---|
| Pod identity | Random, interchangeable | Stable, ordered (\`app-0\`, \`app-1\`) |
| Storage | Shared or ephemeral | Persistent, per-pod PVC |
| Scaling order | Any order | Ordered startup/shutdown |
| Use case | Stateless apps (APIs, web) | Databases, queues, Kafka |`),

    q('k8s_4', 'What is a Service in Kubernetes?', 'beginner',
`A **Service** is a stable network endpoint that exposes a set of pods. Since pod IPs change, Services provide a consistent DNS name and IP.

Types:
- **ClusterIP** (default) — internal access only.
- **NodePort** — exposes on each node's IP at a static port.
- **LoadBalancer** — provisions a cloud load balancer.
- **ExternalName** — maps to a DNS name.

\`\`\`yaml
apiVersion: v1
kind: Service
metadata: { name: my-api }
spec:
  selector: { app: my-api }
  ports: [{ port: 80, targetPort: 3000 }]
\`\`\``),

    q('k8s_5', 'What are ConfigMaps and Secrets?', 'intermediate',
`**ConfigMap** — stores non-sensitive configuration data (env vars, config files).
**Secret** — stores sensitive data (passwords, tokens) as base64-encoded values.

\`\`\`yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
data:
  API_URL: "https://api.example.com"
  LOG_LEVEL: "info"

# Reference in pod
envFrom:
- configMapRef:
    name: my-config
- secretRef:
    name: my-secrets
\`\`\``),
  ],

  // ── Git ───────────────────────────────────────────────────────────
  git: [
    q('git_1', 'What is the difference between git merge and git rebase?', 'intermediate',
`**\`git merge\`** — creates a merge commit, preserving the complete history of both branches. Non-destructive.

**\`git rebase\`** — replays commits from one branch onto another, creating a *linear* history. Rewrites commit hashes.

\`\`\`bash
# Merge — preserves history
git checkout main
git merge feature-branch  # creates a merge commit

# Rebase — linear history
git checkout feature-branch
git rebase main           # moves feature commits on top of main
\`\`\`

**Rule:** Never rebase shared/public branches. Use merge for integration; rebase for cleaning up local work.`),

    q('git_2', 'What is git cherry-pick?', 'intermediate',
`**\`git cherry-pick\`** applies the changes introduced by a specific commit onto the current branch.

\`\`\`bash
git log --oneline feature-branch
# abc1234 Fix critical bug
# def5678 Add new feature

git cherry-pick abc1234  # applies only the bug fix to current branch
\`\`\`

Useful for applying a hotfix from one branch to another without merging everything.`),

    q('git_3', 'What is the difference between git reset and git revert?', 'intermediate',
`**\`git reset\`** — moves the HEAD pointer backward, optionally modifying the index and working tree. *Rewrites history* — unsafe on shared branches.

- \`--soft\` — keeps changes staged.
- \`--mixed\` — keeps changes unstaged.
- \`--hard\` — discards all changes.

**\`git revert\`** — creates a *new commit* that undoes the changes. Safe for shared branches.

\`\`\`bash
git reset --hard HEAD~1    # remove last commit locally (dangerous)
git revert HEAD            # create a "undo" commit (safe)
\`\`\``),

    q('git_4', 'What is a Git hook?', 'intermediate',
`**Git hooks** are shell scripts that run automatically before or after Git events.

Located in \`.git/hooks/\`. Common hooks:

| Hook | When |
|---|---|
| \`pre-commit\` | Before commit is created — run linting |
| \`commit-msg\` | After message is entered — enforce format |
| \`pre-push\` | Before pushing — run tests |
| \`post-merge\` | After merge — run npm install |

Use tools like **Husky** to manage hooks in a team via \`package.json\`.`),

    q('git_5', 'What is git stash and when do you use it?', 'beginner',
`**\`git stash\`** temporarily saves uncommitted changes (both staged and unstaged) and reverts the working directory to a clean state.

\`\`\`bash
git stash           # save current changes
git stash list      # see all stashes
git stash pop       # restore last stash and remove it
git stash apply stash@{2}  # restore specific stash, keep it
git stash drop      # delete last stash
git stash branch new-branch  # create branch from stash
\`\`\`

**When to use:** you need to quickly switch branches but aren't ready to commit your current work.`),
  ],

  // ── AWS ───────────────────────────────────────────────────────────
  aws: [
    q('aws_1', 'What are the core AWS service categories?', 'beginner',
`AWS has 200+ services across key categories:

- **Compute** — EC2 (VMs), Lambda (serverless), ECS/EKS (containers).
- **Storage** — S3 (object), EBS (block), EFS (file).
- **Database** — RDS, Aurora, DynamoDB, ElastiCache.
- **Networking** — VPC, CloudFront, Route 53, API Gateway.
- **Security** — IAM, KMS, Secrets Manager, WAF.
- **Monitoring** — CloudWatch, X-Ray, CloudTrail.
- **CI/CD** — CodePipeline, CodeBuild, CodeDeploy.`),

    q('aws_2', 'What is IAM and what are its core concepts?', 'intermediate',
`**IAM (Identity and Access Management)** controls who can access what in AWS.

Core concepts:
- **Users** — individual human or service accounts.
- **Groups** — collection of users with shared permissions.
- **Roles** — assumed by AWS services or federated identities (no long-term credentials).
- **Policies** — JSON documents defining allowed/denied actions on resources.

**Principle of least privilege:** grant only the permissions needed.

\`\`\`json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::my-bucket/*"
}
\`\`\``),

    q('aws_3', 'What is the difference between EC2 and Lambda?', 'beginner',
`| | **EC2** | **Lambda** |
|---|---|---|
| Type | Virtual machine | Serverless function |
| Management | You manage OS, patches | Fully managed by AWS |
| Scaling | Manual / Auto Scaling Groups | Automatic (per request) |
| Billing | Per hour/second running | Per invocation + duration |
| Max duration | Unlimited | 15 minutes |
| Use case | Long-running services, DBs | Event-driven, short tasks |`),

    q('aws_4', 'What is Amazon S3 and what are its storage classes?', 'intermediate',
`**S3** is AWS's object storage service — unlimited storage for any type of data.

**Storage classes** (by cost/access frequency):
- **Standard** — frequent access, low latency.
- **Intelligent-Tiering** — auto-moves between tiers.
- **Standard-IA** — infrequent access, lower cost.
- **One Zone-IA** — single AZ, cheaper.
- **Glacier Instant** — archive, millisecond retrieval.
- **Glacier Flexible** — minutes–hours retrieval.
- **Glacier Deep Archive** — 12+ hour retrieval, cheapest.

Use **S3 Lifecycle policies** to transition objects automatically.`),

    q('aws_5', 'What is a VPC and what are its components?', 'intermediate',
`A **VPC (Virtual Private Cloud)** is a logically isolated section of AWS where you launch resources in a virtual network you define.

Key components:
- **Subnets** — segment the VPC (public: internet-accessible; private: internal only).
- **Internet Gateway (IGW)** — connects VPC to the internet.
- **NAT Gateway** — lets private subnets initiate outbound internet traffic.
- **Route Tables** — control traffic routing.
- **Security Groups** — stateful firewall per resource.
- **NACLs** — stateless firewall at subnet level.`),
  ],
}

export default questions

