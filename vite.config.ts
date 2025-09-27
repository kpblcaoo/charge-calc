import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRootDir = fileURLToPath(new URL('.', import.meta.url));

// Explicitly set worker output format to 'es' because default 'iife' is
// incompatible with code-splitting in current Vite/Rollup setup.
export default defineConfig({
  resolve: {
    alias: {
      buffer: path.resolve(projectRootDir, 'node_modules/buffer/'),
      'buffer/': path.resolve(projectRootDir, 'node_modules/buffer/'),
      stream: path.resolve(projectRootDir, 'node_modules/stream-browserify/index.js'),
      assert: path.resolve(projectRootDir, 'node_modules/assert/'),
      'assert/': path.resolve(projectRootDir, 'node_modules/assert/'),
      process: path.resolve(projectRootDir, 'node_modules/process/browser.js'),
      util: path.resolve(projectRootDir, 'node_modules/util/'),
      'util/': path.resolve(projectRootDir, 'node_modules/util/'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'stream-browserify', 'assert', 'util'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  worker: {
    format: 'es',
  },
});
