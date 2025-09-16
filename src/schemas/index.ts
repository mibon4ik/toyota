
import * as z from "zod";

export const UserLoginSchema = z.object({
    username: z.string().min(1, {
        message: "Логин обязателен",
    }),
    password: z.string().min(1, {
        message: "Пароль обязателен",
    })
});
