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
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js'
          return '[name].[hash].js'
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
        format: 'es',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

