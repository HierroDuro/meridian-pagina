import { z } from "zod";

/**
 * Login form validation.
 * Deliberately generic error messages ("usuario o contraseña") are used
 * at the point of consumption (never here) so failed logins don't reveal
 * whether the username exists — this is enforced in `lib/auth.ts`.
 */
export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "El usuario es obligatorio")
    .max(64, "El usuario es demasiado largo"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .max(128, "La contraseña es demasiado larga"),
});

export type LoginInput = z.infer<typeof loginSchema>;
