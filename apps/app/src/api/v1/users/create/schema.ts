import { z } from "zod";
import { UserObject } from "../object.js";

export const InputSchema = z.object({
  username: UserObject.shape.username.min(1).trim().meta({
    title: "ユーザ名",
    description: "",
  }),
  password: UserObject.shape.password.min(1).trim(),
});

export const ResponseSchema = z.object({
  201: UserObject,
  400: z.discriminatedUnion("code", [
    z.object({
      code: z.literal("INVALID_PARAMETER"),
      message: z.string(),
    }),
    z.object({
      code: z.literal("ALREADY_USED_NAME"),
      message: z.string(),
    }),
  ]),
});
