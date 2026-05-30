import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'

/**
 * After a silent partial KV write, merges read-back text with in-memory draft when the patch omitted 'text'.
 */
export function mergeProjectNoteboardRootAfterSilentPersist (
  snapshot: I_faProjectNoteboardRoot,
  patch: I_faProjectNoteboardPatch,
  textSnapshotBeforePersist: string
): I_faProjectNoteboardRoot {
  if (patch.text === undefined) {
    return {
      ...snapshot,
      text: textSnapshotBeforePersist
    }
  }
  return snapshot
}
