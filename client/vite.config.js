import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // Expose to all network interfaces (required for Docker)
    port: 3000,
    watch: {
      usePolling: true, // Required for file-watching inside Docker on macOS/Windows
    },
  },
  preview: {
    host: true,
    port: 3000,
  },
})
