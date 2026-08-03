/**
 * Deep equality via JSON stringify for plain draft/baseline snapshots.
 */
export function areFaJsonSnapshotsEqual (left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}
