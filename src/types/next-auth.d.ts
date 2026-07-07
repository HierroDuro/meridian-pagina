import type { DefaultSession } from "next-auth";

/**
 * Module augmentation so `session.user.id` and `session.user.role` are
 * typed everywhere instead of falling back to `any`.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
