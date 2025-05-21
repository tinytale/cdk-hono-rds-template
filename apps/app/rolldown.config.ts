import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/index.ts",
  platform: "node",
  tsconfig: "tsconfig.build.json",
  output: {
    esModule: true,
    format: "esm",
    dir: "dist",
  },
});
