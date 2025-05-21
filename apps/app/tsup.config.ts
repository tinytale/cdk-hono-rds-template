import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "./src/index.ts",
    },
    clean: true,
    platform: "node",
    target: "es2024",
    bundle: true,
    minify: false,
    sourcemap: true,
    format: ["esm"],
    dts: true,
    splitting: false,
    skipNodeModulesBundle: true,
    outDir: "./dist",
    external: [],
    noExternal: [],
  },
]);
