import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { prisma } from "@/prisma-rds.js";
import { InputSchema } from "./schema.js";

const app = new Hono() //
  .get("/", sValidator("query", InputSchema), async (c) => {
    const { keyWord } = c.req.valid("query");
    const blogs = await prisma.blog.findMany({
      where: {
        userId: "user-123",
        content: {
          contains: keyWord,
        },
      },
      take: 20,
    });
    return c.json(blogs, 200);
  });

export default app;
