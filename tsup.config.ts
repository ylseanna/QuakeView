import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./electron/main.ts", "./electron/preload.ts"],
  splitting: false,
  sourcemap: false,
  clean: false,
  cjsInterop: true,
  skipNodeModulesBundle: true,
  treeshake: true,
  outDir: "build",
  external: ["electron"],
  format: ["cjs"],
  bundle: true,
});