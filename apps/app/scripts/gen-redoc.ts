import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { specs } from "../openapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, "../docs/openapi/openapi.json");
await fs.writeFile(out, JSON.stringify(specs, null, 2));
await execa("npx", [
  "@redocly/cli",
  "build-docs",
  out,
  "-o",
  "./docs/redoc/index.html",
]);
process.exit(0);
