import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `base` = nome do repositório no GitHub Pages (https://<user>.github.io/kanban-pipeline/)
export default defineConfig({
  base: '/kanban-pipeline/',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
