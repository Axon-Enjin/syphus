"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { Card, Input, FieldLabel } from "@/components/ui";
import { LoadingButton } from "@/components/ui-interactive";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    setRedirecting(true);
    const session = await getSession();
    const dest = session?.user?.trustlineReady
      ? "/dashboard"
      : "/dashboard/onboard";
    window.location.href = dest;
  }

  return (
    <PublicLayout>
      <main className="container-app flex min-h-[60dvh] max-w-md flex-col justify-center py-16">
        <Card title="Sign in">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            {redirecting && (
              <p className="text-sm text-[var(--color-muted)]">
                Signing you in…
              </p>
            )}
            <LoadingButton
              type="submit"
              loading={loading || redirecting}
              loadingLabel={redirecting ? "Signing you in…" : "Signing in…"}
            >
              Sign in
            </LoadingButton>
          </form>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            No account?{" "}
            <Link href="/register" className="link-accent font-medium">
              Register
            </Link>
          </p>
        </Card>
      </main>
    </PublicLayout>
  );
}
