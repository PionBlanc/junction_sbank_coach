import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Must match the server's default PORT in apps/server/src/config.ts. */
const SERVER_URL = 'http://localhost:8787';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': SERVER_URL },
  },
});
