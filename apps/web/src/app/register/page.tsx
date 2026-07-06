"use client";

import Link from "next/link";
import { useState } from "react";
import { registerUser, type FieldErrors } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import { PublicLayout } from "@/components/public-layout";
import { Card, Input, FieldLabel } from "@/components/ui";
import { LoadingButton } from "@/components/ui-interactive";
import { FreighterConnect } from "@/components/freighter-connect";

type LoadingPhase = "idle" | "creating" | "signing";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle");
  const [stellarAddress, setStellarAddress] = useState<string | null>(null);

  const loading = loadingPhase !== "idle";
  const loadingLabel =
    loadingPhase === "creating"
      ? "Creating account…"
      : loadingPhase === "signing"
        ? "Signing you in…"
        : "Register";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoadingPhase("creating");

    const form = new FormData(e.currentTarget);

    if (stellarAddress) {
      form.set("stellarAddress", stellarAddress);
    }

    const result = await registerUser(form);

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      setLoadingPhase("idle");
      return;
    }

    if (result.error) {
      setError(result.error);
      setLoadingPhase("idle");
      return;
    }

    setLoadingPhase("signing");
    await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: true,
      callbackUrl: "/dashboard/onboard",
    });
  }

  return (
    <PublicLayout>
      <main className="container-app flex min-h-[60dvh] max-w-md flex-col justify-center py-16">
        <Card title="Create account">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" name="name" required />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" required />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-700">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>Stellar wallet</FieldLabel>
              <p className="mb-2 text-xs text-[var(--color-muted)]">
                We&apos;ll create a payment address for you — no extension
                needed.
              </p>
              <p className="mb-2 text-xs text-[var(--color-muted)]">
                Or connect your existing Freighter wallet:
              </p>
              <FreighterConnect
                onConnect={setStellarAddress}
                connected={stellarAddress}
              />
              {fieldErrors.stellarAddress && (
                <p className="mt-1 text-xs text-red-700">
                  {fieldErrors.stellarAddress}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <LoadingButton
              type="submit"
              loading={loading}
              loadingLabel={loadingLabel}
            >
              Register
            </LoadingButton>
          </form>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="link-accent font-medium">
              Sign in
            </Link>
          </p>
        </Card>
      </main>
    </PublicLayout>
  );
}
