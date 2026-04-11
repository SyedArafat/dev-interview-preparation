import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// True only when started inside the Docker container (set via docker-compose env)
const isDocker = process.env.DOCKER === 'true'

// Port where the dev server will be exposed (inside container always 3000, but
// the host port can be different — read from HMR_PORT env or default to 4444)
const hmrPort = parseInt(process.env.HMR_PORT || '4444', 10)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // bind to 0.0.0.0 — required inside Docker
    port: 3000,
    strictPort: true,
    hmr: {
      // Explicitly tell the browser's HMR client which host/port to use for
      // the WebSocket. Without this, Vite derives the host from the server's
      // bind address (0.0.0.0 / container IP) — unreachable from the browser.
      host: 'localhost',
      clientPort: hmrPort,
    },
    watch: {
      // Polling is only needed inside Docker — macOS inotify events don't
      // cross the container boundary. Locally, keep the native FSEvents
      // watcher (instant, zero CPU overhead).
      usePolling: isDocker,
      interval: isDocker ? 100 : undefined,
    },
  },
  preview: {
    host: true,
    port: 3000,
  },
})




