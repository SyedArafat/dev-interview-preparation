export const categories = [
  { id: 'all',      label: 'All Topics' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend',  label: 'Backend' },
  { id: 'language', label: 'Languages' },
  { id: 'database', label: 'Database' },
  { id: 'devops',   label: 'DevOps' },
]

export const topics = [
  // ── Frontend ──────────────────────────────────────────
  {
    id: 'javascript', name: 'JavaScript', category: 'frontend',
    devicon: 'devicon-javascript-plain colored', color: '#f7df1e', questionsCount: 45,
  },
  {
    id: 'typescript', name: 'TypeScript', category: 'frontend',
    devicon: 'devicon-typescript-plain colored', color: '#3178c6', questionsCount: 32,
  },
  {
    id: 'react', name: 'React', category: 'frontend',
    devicon: 'devicon-react-original colored', color: '#61dafb', questionsCount: 50,
  },
  {
    id: 'vuejs', name: 'Vue.js', category: 'frontend',
    devicon: 'devicon-vuejs-plain colored', color: '#4fc08d', questionsCount: 28,
  },
  {
    id: 'angular', name: 'Angular', category: 'frontend',
    devicon: 'devicon-angularjs-plain colored', color: '#dd0031', questionsCount: 35,
  },
  {
    id: 'nextjs', name: 'Next.js', category: 'frontend',
    devicon: 'devicon-nextjs-plain colored', color: '#e2e8f0', questionsCount: 30,
  },
  {
    id: 'html', name: 'HTML', category: 'frontend',
    devicon: 'devicon-html5-plain colored', color: '#e34f26', questionsCount: 25,
  },
  {
    id: 'css', name: 'CSS', category: 'frontend',
    devicon: 'devicon-css3-plain colored', color: '#1572b6', questionsCount: 30,
  },

  // ── Backend ───────────────────────────────────────────
  {
    id: 'nodejs', name: 'Node.js', category: 'backend',
    devicon: 'devicon-nodejs-plain colored', color: '#339933', questionsCount: 40,
  },
  {
    id: 'python', name: 'Python', category: 'backend',
    devicon: 'devicon-python-plain colored', color: '#3776ab', questionsCount: 45,
  },
  {
    id: 'php', name: 'PHP', category: 'backend',
    devicon: 'devicon-php-plain colored', color: '#777bb4', questionsCount: 35,
  },
  {
    id: 'laravel', name: 'Laravel', category: 'backend',
    devicon: 'devicon-laravel-plain colored', color: '#ff2d20', questionsCount: 30,
  },
  {
    id: 'django', name: 'Django', category: 'backend',
    devicon: 'devicon-django-plain colored', color: '#44b78b', questionsCount: 28,
  },
  {
    id: 'express', name: 'Express.js', category: 'backend',
    devicon: 'devicon-express-original', color: '#c8d6e5', questionsCount: 25,
  },

  // ── Languages ─────────────────────────────────────────
  {
    id: 'java', name: 'Java', category: 'language',
    devicon: 'devicon-java-plain colored', color: '#f89820', questionsCount: 50,
  },
  {
    id: 'csharp', name: 'C#', category: 'language',
    devicon: 'devicon-csharp-plain colored', color: '#239120', questionsCount: 40,
  },
  {
    id: 'go', name: 'Go', category: 'language',
    devicon: 'devicon-go-plain colored', color: '#00add8', questionsCount: 30,
  },
  {
    id: 'rust', name: 'Rust', category: 'language',
    devicon: 'devicon-rust-plain', color: '#ce422b', questionsCount: 25,
  },

  // ── Database ──────────────────────────────────────────
  {
    id: 'mysql', name: 'MySQL', category: 'database',
    devicon: 'devicon-mysql-plain colored', color: '#4479a1', questionsCount: 35,
  },
  {
    id: 'postgresql', name: 'PostgreSQL', category: 'database',
    devicon: 'devicon-postgresql-plain colored', color: '#336791', questionsCount: 30,
  },
  {
    id: 'mongodb', name: 'MongoDB', category: 'database',
    devicon: 'devicon-mongodb-plain colored', color: '#47a248', questionsCount: 28,
  },
  {
    id: 'redis', name: 'Redis', category: 'database',
    devicon: 'devicon-redis-plain colored', color: '#dc382d', questionsCount: 20,
  },

  // ── DevOps ────────────────────────────────────────────
  {
    id: 'docker', name: 'Docker', category: 'devops',
    devicon: 'devicon-docker-plain colored', color: '#2496ed', questionsCount: 30,
  },
  {
    id: 'kubernetes', name: 'Kubernetes', category: 'devops',
    devicon: 'devicon-kubernetes-plain colored', color: '#326ce5', questionsCount: 25,
  },
  {
    id: 'git', name: 'Git', category: 'devops',
    devicon: 'devicon-git-plain colored', color: '#f05032', questionsCount: 30,
  },
  {
    id: 'aws', name: 'AWS', category: 'devops',
    devicon: 'devicon-amazonwebservices-plain colored', color: '#ff9900', questionsCount: 40,
  },
]

