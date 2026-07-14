"use client";

import { SessionProvider as NextAuthSessionProvider, __NEXTAUTH } from "next-auth/react";

// next-auth's client bundle never sees NEXTAUTH_URL (it's not a NEXT_PUBLIC_
// var), so it falls back to a hardcoded "http://localhost:3000" base URL for
// every client-side auth call (signIn, getSession, getProviders...). That
// breaks auth entirely when the app is opened from any other host — e.g. a
// phone on the LAN, where "localhost" means the phone itself. Point it at
// whatever origin actually served this page instead.
if (typeof window !== "undefined") {
  __NEXTAUTH.baseUrl = window.location.origin;
  __NEXTAUTH.baseUrlServer = window.location.origin;
}

/**
 * Thin wrapper so client components (e.g. InquireButton, the chat header
 * badge) can call `useSession()` to know whether the current visitor is a
 * logged-in customer, without each one needing to fetch it itself.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
