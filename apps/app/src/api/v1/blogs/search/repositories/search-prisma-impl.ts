import { Effect, Layer } from "effect";
import { prisma } from "@/prisma-rds.js";
import { type BlogRepository, BlogRepositoryTag } from "../repository.js";

export const searchPrismaImpl: BlogRepository = {
  search: (query: { keyWord: string; userId: string }) =>
    Effect.tryPromise({
      try: async () => {
        const result = await prisma.blog.findMany({
          where: {
            userId: query.userId,
            content: {
              contains: query.keyWord,
            },
          },
          take: 20,
        });
        return result.map((b) => ({
          id: b.id,
          userId: b.id,
          content: b.id,
          tags: b.tags,
          createdAt: b.id,
          updateAt: b.id,
        }));
      },
      catch: (error) => new Error(`Database error: ${error}`),
    }),
};

export const PrismaBlogRepositoryLive = Layer.succeed(
  BlogRepositoryTag,
  searchPrismaImpl,
);
