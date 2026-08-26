import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Browser calls /token -> local token server on :8787
      '/token': 'http://localhost:8787',
    },
  },
});
