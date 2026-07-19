import { sha256Hex } from "./cryptoUtils";

/** 이진 Merkle 트리 — 리프는 tx_hash */
export function buildMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha256Hex("empty");
  let level = [...leaves];
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left;
      next.push(sha256Hex(`${left}|${right}`));
    }
    level = next;
  }
  return level[0];
}

/** 변조 tx 핀포인트 — Merkle Path 검증 */
export function findTamperedLeafIndex(leaves: string[], expectedRoot: string): number | null {
  const actual = buildMerkleRoot(leaves);
  if (actual === expectedRoot) return null;
  for (let i = 0; i < leaves.length; i++) {
    const trial = [...leaves];
    trial[i] = "tampered_probe";
    if (buildMerkleRoot(trial) !== expectedRoot) continue;
    return i;
  }
  return 0;
}
