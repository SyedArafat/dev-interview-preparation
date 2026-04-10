# Interview Questions — React + Docker

A React application (Vite 5) containerised with Docker and Docker Compose, following standard multi-stage build practices.

## 📁 Project Structure

```
interview-questions/
├── client/                     # Vite + React source
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── docker/
│   └── client/
│       ├── Dockerfile          # Multi-stage: base → dev | base → build → production
│       └── nginx.conf          # nginx config for the production stage
├── .dockerignore
├── .env                        # Local env vars (not committed)
├── .env.example                # Template — copy to .env
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development override (hot-reload)
└── README.md
```

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable                       | Default              | Description                                    |
|-------------------------------|----------------------|------------------------------------------------|
| `COMPOSE_CLIENT_PROJECT_NAME` | `interview-questions`| Used to name the Docker image                  |
| `DOCKER_BUILD_MODE`           | `development`        | Tag applied to the built image                 |
| `DOCKER_BUILD_CONTEXT_DIR`    | `.`                  | Docker build context (root of repo)            |
| `DOCKER_VOLUME_CLIENT_ROOT_DIR` | `client/`          | Path to the React app (trailing slash required)|
| `WEB_HTTP_PUBLISH_PORT`       | `3000`               | Host port to bind                              |

## 🐳 Docker

The **only command you ever run** is:

```bash
docker compose up --build
```

Switch environments by editing two lines in `.env` — nothing else changes.

### Development (hot-reload)

```dotenv
COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
DOCKER_BUILD_MODE=development
WEB_HTTP_PUBLISH_PORT=3000
```

App → **http://localhost:3000**  
`src/` and `public/` are volume-mounted so changes are reflected instantly.

### Production (nginx)

```dotenv
COMPOSE_FILE=docker-compose.yml
DOCKER_BUILD_MODE=production
WEB_HTTP_PUBLISH_PORT=80
```

App → **http://localhost:80**  
Serves the compiled bundle through a minimal nginx image.

## 🛠️ Local Development (without Docker)

```bash
cd client
npm install
npm run dev
```

## 📦 Build

```bash
cd client
npm run build
```

