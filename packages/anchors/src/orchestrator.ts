import { BCRemitAnchorProvider } from "./bcremit";
import { CoinsPhAnchorProvider } from "./coinsph";
import { MockAnchorProvider } from "./mock";
import type { AnchorHealth, AnchorProvider } from "./types";

const providers: Record<string, AnchorProvider> = {
  mock: new MockAnchorProvider(),
  coinsph: new CoinsPhAnchorProvider(),
  bcremit: new BCRemitAnchorProvider(),
};

const PRODUCTION_PROVIDERS = ["coinsph", "bcremit"] as const;

function resolvePrimaryProviderId(): string {
  const env = process.env.ANCHOR_PROVIDER;
  if (env === "coinsph" || env === "bcremit" || env === "mock") {
    return env;
  }
  return "mock";
}

function resolveFallbackProviderId(primaryId: string): string {
  if (primaryId === "coinsph") return "bcremit";
  if (primaryId === "bcremit") return "coinsph";
  return "mock";
}

const primaryProviderId = resolvePrimaryProviderId();
const fallbackProviderId = resolveFallbackProviderId(primaryProviderId);

let activeProviderId = primaryProviderId;
let offRampPaused = false;

const healthState = new Map<string, { status: AnchorHealth; fails: number }>();

export function getActiveProvider(): AnchorProvider {
  return providers[activeProviderId] ?? providers.mock;
}

export function getActiveProviderId(): string {
  return activeProviderId;
}

export function getPrimaryProviderId(): string {
  return primaryProviderId;
}

export function getFallbackProviderId(): string {
  return fallbackProviderId;
}

export function isOffRampPaused(): boolean {
  return offRampPaused;
}

export function getOffRampStatus() {
  return {
    paused: offRampPaused,
    activeProvider: activeProviderId,
    primaryProvider: primaryProviderId,
    fallbackProvider: fallbackProviderId,
  };
}

export function setActiveProvider(id: string) {
  if (!providers[id]) {
    throw new Error(`Unknown anchor provider: ${id}`);
  }
  activeProviderId = id;
  offRampPaused = false;
}

export function getProvider(id: string): AnchorProvider {
  const p = providers[id];
  if (!p) throw new Error(`Unknown anchor provider: ${id}`);
  return p;
}

function isProductionMode(): boolean {
  return primaryProviderId === "coinsph" || primaryProviderId === "bcremit";
}

function applyFailover(results: Record<string, AnchorHealth>) {
  if (!isProductionMode()) {
    offRampPaused = false;
    return;
  }

  const primaryHealth = results[primaryProviderId] ?? "down";
  const fallbackHealth = results[fallbackProviderId] ?? "down";
  const primaryFails = healthState.get(primaryProviderId)?.fails ?? 0;

  if (primaryHealth === "down" && primaryFails >= 2) {
    if (fallbackHealth !== "down") {
      activeProviderId = fallbackProviderId;
      offRampPaused = false;
      return;
    }
  }

  if (primaryHealth !== "down") {
    activeProviderId = primaryProviderId;
  }

  const activeHealth = results[activeProviderId] ?? "down";
  const bothDown =
    (results.coinsph === "down" || !results.coinsph) &&
    (results.bcremit === "down" || !results.bcremit);

  offRampPaused = bothDown || activeHealth === "down";
}

export async function runHealthChecks(): Promise<
  Record<string, AnchorHealth>
> {
  const results: Record<string, AnchorHealth> = {};

  for (const [id, provider] of Object.entries(providers)) {
    const status = await provider.healthCheck();
    const prev = healthState.get(id) ?? { status: "healthy", fails: 0 };
    const fails = status === "down" ? prev.fails + 1 : 0;
    healthState.set(id, { status, fails });
    results[id] = status;
  }

  applyFailover(results);
  return results;
}

export * from "./types";
export { MockAnchorProvider, CoinsPhAnchorProvider, BCRemitAnchorProvider };
