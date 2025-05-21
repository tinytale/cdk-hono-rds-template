import { hc } from "hono/client";
import type app from "@/index";

export const api = hc<typeof app>;
