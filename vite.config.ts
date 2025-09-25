import { defineConfig } from 'vite';

// Explicitly set worker output format to 'es' because default 'iife' is
// incompatible with code-splitting in current Vite/Rollup setup.
export default defineConfig({
  worker: {
    format: 'es'
  }
});
