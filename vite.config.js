import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` makes every asset path relative, so the same build works on
// Vercel, Netlify, GitHub Pages (including /repo-name/ sub-paths) or any static host.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
  },
});
