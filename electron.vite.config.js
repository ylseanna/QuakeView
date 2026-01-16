import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: {
    build : {
        outDir: "out/build",
        lib: {
           entry: ["./electron/main.ts"],
           formats: ["es"]
        },
        rollupOptions: {
          external: ["electron"]
        }
    }
  },
  preload: {
    build : {
        outDir: "out/preload",
        lib: {
           entry: ["./electron/preload.ts"],
           formats: ["es"]
        },
        rollupOptions: {
          external: ["electron"]
        }
    }
  },
  renderer: {
    root: ".",
    build : {
        outDir: "out/renderer",
        rollupOptions: {
          input: "electron/loading.html"
        }
    }
  }
})