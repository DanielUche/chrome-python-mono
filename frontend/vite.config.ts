import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      generateBundle() {
        const manifestPath = path.resolve(__dirname, 'src/manifest.json')
        const manifest = fs.readFileSync(manifestPath, 'utf-8')
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: manifest,
        })
      },
    },
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        contentScript: path.resolve(__dirname, 'src/contentScript.ts'),
      },
      output: {
        format: 'es',
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js'
          if (chunk.name === 'contentScript') return 'contentScript.js'
          return '[name].[hash].js'
        },
        chunkFileNames: (chunk) => {
          // Keep chunks in root for content script
          if (chunk.name?.startsWith('timing') || chunk.name?.startsWith('messages')) {
            return '[name].[hash].js'
          }
          return 'chunks/[name].[hash].js'
        },
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

