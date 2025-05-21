import { Context, type Effect } from "effect";
import type { BlogObject } from "../object.js";

export interface BlogRepository {
  readonly search: (query: {
    keyWord: string;
    userId: string;
  }) => Effect.Effect<BlogObject[], Error>;
}

export class BlogRepositoryTag extends Context.Tag("BlogRepository")<
  BlogRepositoryTag,
  BlogRepository
>() {}
