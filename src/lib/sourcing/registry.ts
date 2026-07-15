import type { SupplierConnector } from "./types";
import { cjConnector } from "./connectors/cjdropshipping";
import { superbuyConnector } from "./connectors/superbuy";

const registry: Record<string, SupplierConnector> = {
  [cjConnector.code]: cjConnector,
  [superbuyConnector.code]: superbuyConnector,
};

export function getConnector(code: string): SupplierConnector | null {
  return registry[code] ?? null;
}

export const connectorCodes = Object.keys(registry);
