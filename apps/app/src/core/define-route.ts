import { resolver } from "hono-openapi";
import type z from "zod";

export function defineResponse<T extends z.ZodTypeAny>(
  schema: T,
  description = "",
) {
  return {
    description,
    content: {
      "application/json": {
        schema: resolver(schema),
      },
    },
  };
}
