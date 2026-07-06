export const primaryNavLinks = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home" },
  { href: "/dashboard/pay", label: "Payment link", shortLabel: "Pay" },
  { href: "/dashboard/withdraw", label: "Withdraw", shortLabel: "Withdraw" },
  { href: "/dashboard/export", label: "Export", shortLabel: "Export" },
] as const;

export const secondaryNavLinks = [
  { href: "/dashboard/onboard", label: "Wallet setup", shortLabel: "Setup" },
] as const;

export const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];
