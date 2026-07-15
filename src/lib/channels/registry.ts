import type { ChannelAdapter } from "./types";
import { lexiAdapter } from "./adapters/lexi";
import { coupangAdapter } from "./adapters/coupang";
import { cafe24Adapter } from "./adapters/cafe24";

const registry: Record<string, ChannelAdapter> = {
  [lexiAdapter.code]: lexiAdapter,
  [coupangAdapter.code]: coupangAdapter,
  [cafe24Adapter.code]: cafe24Adapter,
};

export function getChannelAdapter(code: string): ChannelAdapter | null {
  return registry[code] ?? null;
}
