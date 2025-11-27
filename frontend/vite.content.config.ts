import { defineConfig } from 'vite'
import path from 'path'

// Separate build config for content script as IIFE
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/contentScript.ts'),
      name: 'ContentScript',
      formats: ['iife'],
      fileName: () => 'contentScript.js',
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't empty, we're adding to existing build
    rollupOptions: {
      output: {
        entryFileNames: 'contentScript.js',
        extend: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
