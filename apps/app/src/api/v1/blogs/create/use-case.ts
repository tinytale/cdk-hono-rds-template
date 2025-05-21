import { Effect, pipe } from "effect";
import { BlogRepository } from "@/api/v1/blogs/create/repository";
// import { BlogRepositoryPrismaImpl } from "@/api/v1/blogs/create/repository-impl/repository-prisma-impl";
import { DBLayer } from "@/core/context/db";

type Input = Parameters<BlogRepository["exec"]>[0];
export const useCase = (input: Input) => {
  return Effect.gen(function* (_) {
    const repo = yield* _(BlogRepository);
    const result = yield* _(repo.exec(input));
    return result;
  });
};

export const useCaseImpl = (input: Input) =>
  pipe(
    useCase(input),

    Effect.provide(DBLayer),
  );
