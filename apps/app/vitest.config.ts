import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import prismaConfig from "./prisma.config.ts";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    env: {
      TZ: "Asia/Tokyo",
      DEFAULT_DATABASE_NAME: "postgres",
      DATABASE_USER: "vitest",
      DATABASE_PASSWORD: "vitest",
      DATABASE_HOST: "localhost",
      DATABASE_PORT: "5432",
      DATABASE_DB: "postgres",
      DATABASE_SCHEMA: "public",
      TEMPLATE_DB_NAME: "template_db",
      PRISMA_SCHEMA_PATH: prismaConfig.schema,
      PRISMA_URL_ENV_NAME: "DATABASE_URL",
    },
    projects: [
      {
        extends: true,
        test: {
          testTimeout: 10_000,
          name: "unit",
          include: ["./src/**/*.(test|spec).ts"],
          exclude: ["./src/**/*repository*.(test|spec).ts"],
        },
      },
      {
        extends: true,
        test: {
          testTimeout: 30_000,
          pool: "threads",
          name: "repository",
          setupFiles: ["./vitest/db-setup.ts"],
          include: ["./src/**/*repository*.(test|spec).ts"],
        },
      },
    ],
    silent: false,
    environment: "node",
  },
});
