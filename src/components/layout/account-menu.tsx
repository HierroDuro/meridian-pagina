"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getCustomerUnreadTotal } from "@/actions/chat-actions";

/** Account icon in the header: "Iniciar sesión" for anonymous visitors,
 * or a "Mis consultas" shortcut with an unread badge once logged in. */
export function AccountMenu() {
  const { data: session, status } = useSession();
  const isCustomer = status === "authenticated" && session?.user?.userType === "customer";

  const { data: unread } = useQuery({
    queryKey: ["customer-unread-total"],
    queryFn: () => getCustomerUnreadTotal(),
    enabled: isCustomer,
    refetchInterval: 10_000,
  });

  if (!isCustomer) {
    return (
      <Link
        href="/cuenta/ingresar"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Iniciar sesión"
      >
        <User className="h-[18px] w-[18px]" />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Mis consultas"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          {Boolean(unread) && unread! > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/consultas">Mis consultas</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/" })}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
