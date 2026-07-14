"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CustomerLoginForm } from "@/components/auth/customer-login-form";
import { CustomerRegisterForm } from "@/components/auth/customer-register-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the visitor is authenticated (fresh login or just-completed registration). */
  onAuthenticated: () => void;
}

/**
 * The gate shown when an unauthenticated visitor clicks "Consultar" — login,
 * register and forgot-password in one dialog so starting a conversation
 * never requires a full page navigation. The same three forms also back
 * the standalone /cuenta/* pages for direct navigation.
 */
export function AuthDialog({ open, onOpenChange, onAuthenticated }: AuthDialogProps) {
  const [tab, setTab] = React.useState<"login" | "register" | "forgot">("login");

  // Reset back to the login tab each time the dialog is reopened.
  React.useEffect(() => {
    if (open) setTab("login");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Necesitás una cuenta para consultar</DialogTitle>
          <DialogDescription>
            Iniciá sesión o creá una cuenta para empezar la conversación sobre este producto.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Ingresar</TabsTrigger>
            <TabsTrigger value="register">Registrarme</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <CustomerLoginForm
              onSuccess={onAuthenticated}
              onSwitchToForgotPassword={() => setTab("forgot")}
            />
          </TabsContent>
          <TabsContent value="register">
            <CustomerRegisterForm onSuccess={onAuthenticated} />
          </TabsContent>
          <TabsContent value="forgot">
            <ForgotPasswordForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
