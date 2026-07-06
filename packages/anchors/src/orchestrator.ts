import { CoinsPhAnchorProvider } from "./coinsph";
import { MockAnchorProvider } from "./mock";
import type { AnchorHealth, AnchorProvider } from "./types";

const providers: Record<string, AnchorProvider> = {
  mock: new MockAnchorProvider(),
  coinsph: new CoinsPhAnchorProvider(),
};

let activeProviderId =
  process.env.ANCHOR_PROVIDER === "coinsph" ? "coinsph" : "mock";

const healthState = new Map<string, { status: AnchorHealth; fails: number }>();

export function getActiveProvider(): AnchorProvider {
  return providers[activeProviderId] ?? providers.mock;
}

export function getActiveProviderId(): string {
  return activeProviderId;
}

export function setActiveProvider(id: string) {
  if (!providers[id]) {
    throw new Error(`Unknown anchor provider: ${id}`);
  }
  activeProviderId = id;
}

export function getProvider(id: string): AnchorProvider {
  const p = providers[id];
  if (!p) throw new Error(`Unknown anchor provider: ${id}`);
  return p;
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

    if (
      id === "coinsph" &&
      fails >= 2 &&
      activeProviderId === "coinsph" &&
      providers.mock
    ) {
      activeProviderId = "mock";
    }
  }

  return results;
}

export * from "./types";
export { MockAnchorProvider, CoinsPhAnchorProvider };
