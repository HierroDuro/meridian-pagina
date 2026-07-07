import { handlers } from "@/lib/auth";

// NextAuth's built-in CSRF protection, cookie signing, and callback
// verification all run through these handlers — see src/lib/auth.ts.
export const { GET, POST } = handlers;
