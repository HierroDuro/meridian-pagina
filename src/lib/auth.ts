import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth.schema";
import { customerLoginSchema } from "@/lib/validations/customer-auth.schema";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Full NextAuth (Auth.js v5) configuration for the hidden /admin panel —
 * extends the edge-safe `authConfig` with the Credentials provider, which
 * needs Prisma and bcrypt (both Node-only). Only import this module from
 * Route Handlers or Server Components (Node.js runtime), never from
 * `middleware.ts` — see `auth.config.ts` for why.
 *
 * Design notes:
 * - JWT session strategy: no server-side session table needed, and the
 *   token is stored in an HttpOnly, Secure (in production), SameSite=Lax
 *   cookie by NextAuth automatically — never accessible to client JS,
 *   which closes off the most common XSS-driven session theft vector.
 * - The Credentials provider looks up the admin by username, and compares
 *   the given password against the bcrypt hash stored in the database.
 *   Only ever the hash is stored; the plaintext password never touches
 *   the database (see prisma/seed.ts).
 * - Generic error messages: whether the username doesn't exist or the
 *   password is wrong, we throw the exact same error, so the login
 *   response can't be used to enumerate valid usernames.
 * - Basic in-memory rate limiting on top of credential checks slows down
 *   brute-force attempts (see lib/rate-limit.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "admin",
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "unknown";
        const limited = rateLimit(`login:${ip}:${username.toLowerCase()}`, 5, 60_000);
        if (!limited.success) {
          throw new Error("Demasiados intentos. Esperá un minuto antes de volver a intentar.");
        }

        const admin = await prisma.adminUser.findUnique({
          where: { username },
        });

        // Always run bcrypt.compare (even with a dummy hash) so response
        // timing doesn't leak whether the username exists.
        const passwordHash =
          admin?.passwordHash ?? "$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsalt.";
        const isValid = await bcrypt.compare(password, passwordHash);

        if (!admin || !admin.isActive || !isValid) {
          throw new Error("Usuario o contraseña incorrectos.");
        }

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          name: admin.username,
          role: admin.role,
          userType: "admin",
        };
      },
    }),
    Credentials({
      id: "customer",
      name: "customer-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = customerLoginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "unknown";
        const limited = rateLimit(`customer-login:${ip}:${email.toLowerCase()}`, 5, 60_000);
        if (!limited.success) {
          throw new Error("Demasiados intentos. Esperá un minuto antes de volver a intentar.");
        }

        const customer = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        const passwordHash =
          customer?.passwordHash ?? "$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsalt.";
        const isValid = await bcrypt.compare(password, passwordHash);

        if (!customer || !isValid) {
          throw new Error("Email o contraseña incorrectos.");
        }

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          userType: "customer",
        };
      },
    }),
  ],
});
