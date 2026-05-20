import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'posttest'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist/posttest'),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    fs: { allow: [resolve(__dirname)] },
  },
});
