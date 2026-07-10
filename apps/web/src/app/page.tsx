import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-[#0D6E4F]">
        Syphus
      </p>
      <h1 className="text-4xl font-semibold leading-tight">
        USDC payroll for your PH team. One link. PHP today.
      </h1>
      <p className="text-lg text-[#6B6B63]">
        Built for crypto-native payers who already hold USDC. Invoice links,
        same-day off-ramp, and income history that builds itself.
      </p>
      <div className="flex gap-3">
        <Link
          href="/register"
          className="rounded-lg bg-[#0D6E4F] px-5 py-2.5 text-sm font-medium text-white"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-[#d4d4ce] px-5 py-2.5 text-sm"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
