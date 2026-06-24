/**
 * Purpose: Configures the local Vite build for the Baliora frontend.
 * Used by: Vite dev server and production builds.
 * Main dependencies: Vite and the React plugin.
 * Public functions: default Vite config export.
 * Side effects: none.
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
  plugins: [react()],
});
