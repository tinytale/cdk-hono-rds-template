import { Hono } from "hono";
import { prisma } from "@/prisma-rds";

export const app = new Hono() //
  .get("/", async (c) => {
    try {
      await prisma.$connect();
    } finally {
      prisma.$disconnect();
    }
    return c.json({ status: "ok" });
  });

export default app;
