import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { defineResponse } from "@/core/define-route";
import { ResponseSchema } from "./schema.js";

const END_POINT = "/blogs/create";

const doc = new Hono().use(
  END_POINT,
  describeRoute({
    description: "Health Check",
    operationId: "healthCheck",
    tags: ["health"],
    responses: {
      200: defineResponse(ResponseSchema.shape[200], "Success"),
      500: defineResponse(ResponseSchema.shape[500], "Internal Server Error"),
    },
  }),
);

export default doc;
