import crypto from "node:crypto";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { execa } from "execa";
import { Client } from "pg";

export const createTablesWithPrisma = (param: {
  schemaPath: string;
  DB_URL: string;
}) => {
  const prismaEnvName = process.env.PRISMA_URL_ENV_NAME ?? "DATABASE_URL";
  const env = { [prismaEnvName]: param.DB_URL };
  return execa(
    "pnpm",
    [
      "prisma",
      "db",
      "push",
      "--accept-data-loss",
      "--skip-generate",
      "--schema",
      param.schemaPath,
    ],
    {
      env: {
        ...process.env,
        ...env,
      },
      stdio: "inherit",
    },
  );
};

export const startUpPostgresContainer = async () => {
  const {
    DEFAULT_DATABASE_NAME,
    DATABASE_PASSWORD,
    DATABASE_USER,
    DATABASE_PORT,
  } = process.env;
  // const identifier = 'vitest';
  const container = await new PostgreSqlContainer(
    "docker.io/library/postgres:17-alpine",
  )
    // .withName(identifier)
    .withDatabase(DEFAULT_DATABASE_NAME as string)
    .withUsername(DATABASE_USER ?? "vitest")
    .withPassword(DATABASE_PASSWORD ?? "vitest")
    .withReuse()
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(Number(DATABASE_PORT ?? 5432));
  const user = container.getUsername();
  const pass = container.getPassword();

  return {
    host,
    port,
    user,
    pass,
    container,
    databaseName: DEFAULT_DATABASE_NAME as string,
    connectionString: container.getConnectionUri(),
  };
};

export async function createTemplateDatabase({
  connectionString,
  templateDbName,
  schemaPath,
}: {
  connectionString: string;
  schemaPath: string;
  templateDbName: string;
}) {
  const { DEFAULT_DATABASE_NAME } = process.env;
  const admin = new Client({ connectionString });
  await admin.connect();

  try {
    const { rowCount } = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [templateDbName],
    );
    if (rowCount === 0) {
      await admin
        .query(`CREATE DATABASE "${templateDbName ?? "template_db"}"`)
        .catch((e) => {
          console.warn(e);
        });

      const DB_URL = `${connectionString.replace(`/${DEFAULT_DATABASE_NAME ?? "postgres"}`, `/${templateDbName}`)}?schema=public`;
      console.debug("DB_URLAA", DB_URL);
      await createTablesWithPrisma({
        schemaPath: schemaPath,
        DB_URL: DB_URL,
      }).catch((e) => {
        console.warn(e);
      });

      await admin
        .query(`ALTER DATABASE "${templateDbName}" IS_TEMPLATE true`)
        .catch((e) => {
          console.warn(e);
        });

      await admin
        .query(`ALTER DATABASE "${templateDbName}" ALLOW_CONNECTIONS false`)
        .catch((e) => {
          console.warn(e);
        });
    }
  } finally {
    await admin.end();
  }
  return { TEMPLATE_DB_NAME: templateDbName };
}

export async function createUniqueDatabaseFromTemplate({
  connectionString,
  templateDatabaseName,
}: {
  connectionString: string;
  templateDatabaseName: string;
}) {
  const { DEFAULT_DATABASE_NAME } = process.env;
  const admin = new Client({ connectionString });
  await admin.connect();
  try {
    const DB_NAME = `t_${crypto.randomBytes(8).toString("hex")}`;
    await admin.query(
      `CREATE DATABASE "${DB_NAME}" TEMPLATE "${templateDatabaseName}"`,
    );
    const DB_URL = `${connectionString.replace(`/${DEFAULT_DATABASE_NAME}`, `/${DB_NAME}`)}?schema=public`;
    return { DB_NAME, DB_URL };
  } finally {
    await admin.end();
  }
}
