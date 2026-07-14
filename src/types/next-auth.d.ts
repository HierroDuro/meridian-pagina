import type { DefaultSession } from "next-auth";

/**
 * Module augmentation so `session.user.id`, `.role` and `.userType` are
 * typed everywhere instead of falling back to `any`.
 *
 * `userType` is the critical discriminator between the two Credentials
 * providers sharing this one NextAuth instance ("admin" vs "customer") —
 * every admin-only check must verify `userType === "admin"`, never just
 * that a session exists, otherwise a logged-in customer would pass admin
 * checks. See `lib/require-admin.ts` / `lib/require-customer.ts`.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      userType: "admin" | "customer";
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    userType: "admin" | "customer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    userType?: "admin" | "customer";
  }
}
