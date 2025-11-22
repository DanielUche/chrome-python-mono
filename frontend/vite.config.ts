import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        contentScript: path.resolve(__dirname, 'src/contentScript.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js'
          if (chunk.name === 'contentScript') return 'contentScript.js'
          return '[name].[hash].js'
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Copy manifest.json to dist
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

