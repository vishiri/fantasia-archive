import type {
  I_faProjectStylingPatch,
  I_faProjectStylingRoot
} from 'app/types/I_faProjectStylingDomain'

/**
 * After a silent partial KV write, merges read-back CSS with in-memory editor text when the patch omitted 'css'.
 */
export function mergeProjectStylingRootAfterSilentPersist (
  snapshot: I_faProjectStylingRoot,
  patch: I_faProjectStylingPatch,
  cssSnapshotBeforePersist: string
): I_faProjectStylingRoot {
  if (patch.css === undefined) {
    return {
      ...snapshot,
      css: cssSnapshotBeforePersist
    }
  }
  return snapshot
}
