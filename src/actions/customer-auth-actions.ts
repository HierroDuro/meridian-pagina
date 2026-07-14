"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/customer-auth.schema";

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type CustomerAuthResult =
  | { success: true; message: string; resetUrl?: string }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

/** Creates a customer account. The caller signs the session in afterward client-side. */
export async function registerCustomer(input: RegisterInput): Promise<CustomerAuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revisá los campos marcados en el formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, message: "Ya existe una cuenta con ese email." };
    }
    throw error;
  }

  return { success: true, message: "Cuenta creada correctamente." };
}

/**
 * Starts a password reset. There's no email provider configured in this
 * project (see prisma/schema.prisma's PasswordResetToken doc comment), so
 * instead of emailing the link, it's returned directly for the UI to show
 * — clearly labeled as a dev-mode stand-in. Wire a real email provider
 * (Resend, SES, etc.) before shipping this to production; sending it by
 * email is also what restores the usual "doesn't reveal whether the email
 * exists" property, which this dev-mode shortcut necessarily gives up.
 */
export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<CustomerAuthResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Email inválido." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    return {
      success: false,
      message: "No encontramos ninguna cuenta con ese email.",
    };
  }

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  return {
    success: true,
    message: "Enlace de recuperación generado.",
    resetUrl: `${siteConfig.url}/cuenta/restablecer?token=${token}`,
  };
}

export async function resetPassword(input: ResetPasswordInput): Promise<CustomerAuthResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revisá los campos marcados en el formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { success: false, message: "El enlace de recuperación no es válido o ya expiró." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true, message: "Contraseña actualizada. Ya podés iniciar sesión." };
}
