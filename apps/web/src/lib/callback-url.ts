const BLOCKED_HOSTS = new Set([
  "metadata.google.internal",
  "169.254.169.254",
]);

export function buildWithdrawCallbackUrl(authUrl?: string): string {
  const base = authUrl ?? process.env.AUTH_URL;
  if (!base) {
    throw new Error("AUTH_URL is not set");
  }

  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    throw new Error("AUTH_URL is invalid");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("AUTH_URL must use http or https");
  }

  if (BLOCKED_HOSTS.has(parsed.hostname)) {
    throw new Error("AUTH_URL host is not allowed");
  }

  parsed.pathname = "/dashboard/withdraw/callback";
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}
