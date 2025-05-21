import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import {
  type GenerateSpecOptions,
  generateSpecs,
  openAPIRouteHandler,
} from "hono-openapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dir = path.resolve(__dirname, "src/api/**/doc.ts");
const docs = fs.globSync(dir);

const modules = await Promise.all(
  docs.map((p) => {
    const abs = path.resolve(p);
    const url = pathToFileURL(abs).href;
    return import(url);
  }),
);

const openapi = modules
  .filter((m) => m.default)
  .reduce((app, m) => app.route("/v1", m.default), new Hono());

const docmentation: GenerateSpecOptions = {
  documentation: {
    info: {
      title: "ExampleApi",
      version: "1.0.0",
      description: "This is the API documentation for Example",
    },
    components: {
      parameters: {
        "x-trace-id": {
          name: "x-trace-id",
          in: "header",
          required: false,
          description: "Trace ID for request tracking",
          schema: {
            type: "string",
          },
        },
      },
      securitySchemes: {
        "x-api-key": {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
        Authorization: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: "https://auth.example.com/oauth/token",
              scopes: {
                "admin:all": "管理者権限",
                "read:blog": "ブログの読み取り権限",
                "write:blog": "ブログの書き込み権限",
              },
            },
          },
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Server",
      },
      {
        url: "http://debug.tiny-tale.com",
        description: "Dev Server",
      },
    ],
  },
  includeEmptyPaths: false,
  excludeStaticFile: false,
  exclude: "",
  excludeMethods: [],
  excludeTags: [],
  defaultOptions: {},
};

export const specs = await generateSpecs(openapi, docmentation);

console.debug(openapi);

const root = new Hono()
  .get("/oepenapi.json", openAPIRouteHandler(openapi, docmentation))
  .get(
    "/scalar",
    Scalar({
      url: "/oepenapi.json",
      theme: "kepler",
    }),
  )
  .get(
    "/swagger",
    swaggerUI({
      url: "/oepenapi.json",
    }),
  )
  .get("/redoc", (c) => {
    return c.html(/* html */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SwaggerUI" />
        <title>Sample API | Redoc</title>
      </head>
      <body>
        <redoc spec-url="/oepenapi.json"></redoc>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `);
  });

export default openapi;

const host = process.env.HOSTNAME || "localhost";
const p = process.env.PORT || 3333;

serve(
  {
    fetch: root.fetch,
    hostname: host,
    port: Number(p),
  },
  (info) => {
    console.log(`Listening on http://${host}:${info.port}/scalar`);
    console.log(`Listening on http://${host}:${info.port}/swagger`);
    console.log(`Listening on http://${host}:${info.port}/redoc`);
  },
);
