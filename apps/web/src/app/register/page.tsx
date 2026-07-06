"use client";

import Link from "next/link";
import { useState } from "react";
import { registerUser } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import { Button, Card, Input } from "@/components/ui";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await registerUser(form);
    if (result.error) {
      setError(result.error);
      return;
    }
    await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: true,
      callbackUrl: "/dashboard/onboard",
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Card title="Create account">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input name="name" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input
            name="password"
            type="password"
            placeholder="Password (min 8 chars)"
            minLength={8}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit">Register</Button>
        </form>
        <p className="mt-4 text-sm text-[#6B6B63]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0D6E4F]">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
