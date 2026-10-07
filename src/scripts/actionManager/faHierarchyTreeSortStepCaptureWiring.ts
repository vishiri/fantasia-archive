import { ResultAsync } from 'neverthrow'

/**
 * Runs one hierarchy sort step and reports failure without throwing.
 */
export async function captureFaHierarchyTreeSortStep<T> (
  work: () => Promise<T>
): Promise<{ ok: true, value: T } | { ok: false, error: unknown }> {
  const step = await ResultAsync.fromPromise(work(), (error: unknown) => error)
  if (step.isErr()) {
    const error = step.error
    return {
      error,
      ok: false
    }
  }
  const value = step.value
  return {
    ok: true,
    value
  }
}
