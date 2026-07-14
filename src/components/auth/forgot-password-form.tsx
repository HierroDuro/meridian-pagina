"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/actions/customer-auth-actions";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/customer-auth.schema";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [resetUrl, setResetUrl] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setServerError(null);
    setResetUrl(null);
    const result = await requestPasswordReset(values);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setResetUrl(result.resetUrl ?? null);
  };

  if (resetUrl) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p className="flex items-start gap-2 text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <strong>Modo desarrollo:</strong> este proyecto todavía no tiene un servicio de email
            configurado, así que el enlace de recuperación se muestra acá en vez de enviarse por
            correo.
          </span>
        </p>
        <a href={resetUrl} className="block break-all text-primary underline">
          {resetUrl}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">
        Ingresá tu email y te generamos un enlace para elegir una contraseña nueva.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input id="forgot-email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {serverError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generar enlace"}
      </Button>
    </form>
  );
}
