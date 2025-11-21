import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        sidepanel: "src/sidepanel.html",
        background: "src/background.ts",
        contentScript: "src/contentScript.ts"
      },
      output: {
        entryFileNames: (chunk: any) => {
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "contentScript") return "contentScript.js";
          return "[name].js";
        }
      }
    },
    outDir: "dist",
    emptyOutDir: true
  }
});
