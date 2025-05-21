import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, beforeEach } from "vitest";
import {
  createTemplateDatabase,
  createUniqueDatabaseFromTemplate,
  startUpPostgresContainer,
} from "./db-helper";

let _container: StartedPostgreSqlContainer;
let _connectionString: string;

// テンプレートDB作成する
beforeAll(async () => {
  const { TEMPLATE_DB_NAME, PRISMA_SCHEMA_PATH } = process.env;
  const { container, connectionString } = await startUpPostgresContainer();
  _container = container;
  _connectionString = connectionString;

  await createTemplateDatabase({
    connectionString: _connectionString,
    templateDbName: TEMPLATE_DB_NAME as string,
    schemaPath: PRISMA_SCHEMA_PATH as string,
  });
}, 120_000); // docker pullの初回は時間がかかるのでタイムアウト長めに

afterAll(async () => {
  // await _container?.stop().catch(() => {});
});

// ユニークなDBをテンプレートから作成する
beforeEach(async (ctx) => {
  const { TEMPLATE_DB_NAME } = process.env;
  const { DB_NAME, DB_URL } = await createUniqueDatabaseFromTemplate({
    connectionString: _connectionString,
    templateDatabaseName: TEMPLATE_DB_NAME as string,
  });

  // @ts-expect-error: extended field for test context
  ctx.DB_NAME = DB_NAME;
  // @ts-expect-error: extended field for test context
  ctx.DB_URL = DB_URL;
});
