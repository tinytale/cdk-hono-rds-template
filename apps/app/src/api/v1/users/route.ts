import { Hono } from "hono";
import auth from "./auth/controller.js";
import create from "./create/controller.js";

const app = new Hono() //
  .basePath("users")
  .route("create", create)
  .route("auth", auth);

export default app;
