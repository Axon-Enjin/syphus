"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Card title="Sign in">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input name="email" type="email" placeholder="Email" required />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit">Sign in</Button>
        </form>
        <p className="mt-4 text-sm text-[#6B6B63]">
          No account?{" "}
          <Link href="/register" className="text-[#0D6E4F]">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
