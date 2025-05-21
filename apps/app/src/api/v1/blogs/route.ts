import { Hono } from "hono";
import create from "./create/controller.js";
import search from "./search/controller.js";

const app = new Hono()
  .basePath("blogs")
  .route("create", create)
  .route("search", search)
  .route("updateTags", search);

export default app;
