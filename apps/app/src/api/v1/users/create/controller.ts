import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { prisma } from "@/prisma-rds.js";
import { InputSchema } from "./schema.js";

const app = new Hono() //
  .post("/", sValidator("json", InputSchema), async (c) => {
    const { username, password } = c.req.valid("json");
    const exisit = await prisma.user
      .count({
        where: {
          username: username,
        },
      })
      .then((result) => result > 0);

    if (exisit) {
      return c.json(
        {
          code: "ALREADY_USED_NAME" as const,
        },
        400,
      );
    }

    const result = await prisma.user.create({
      data: {
        username: username,
        password: password,
      },
    });

    return c.json(
      {
        id: result.id,
        name: result.username,
        password: result.password,
        updateAt: result.updateAt.toISOString(),
        createdAt: result.createdAt.toISOString(),
      },
      200,
    );
  });

export default app;
