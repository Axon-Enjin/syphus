import Link from "next/link";

export function Nav() {
  return (
    <nav className="flex gap-4 border-b border-[#e8e8e4] bg-white px-6 py-3 text-sm">
      <Link href="/dashboard" className="font-medium text-[#0D6E4F]">
        Dashboard
      </Link>
      <Link href="/dashboard/pay">Payment link</Link>
      <Link href="/dashboard/withdraw">Withdraw</Link>
      <Link href="/dashboard/export">Export</Link>
      <Link href="/dashboard/onboard">Wallet setup</Link>
    </nav>
  );
}

export function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e8e8e4] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1A1A18]">{title}</h2>
      {children}
    </section>
  );
}

export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-[#0D6E4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a5a40] disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-lg border border-[#d4d4ce] px-3 py-2 text-sm"
      {...props}
    />
  );
}
