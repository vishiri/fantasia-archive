import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'

/**
 * After a silent partial KV write, keeps in-memory text when the patch omitted 'text' or the draft changed during the round trip.
 */
export function mergeProjectNoteboardRootAfterSilentPersist (
  snapshot: I_faProjectNoteboardRoot,
  patch: I_faProjectNoteboardPatch,
  currentText: string,
  textAtStart: string
): I_faProjectNoteboardRoot {
  const textChangedDuringSave = currentText !== textAtStart
  if (patch.text === undefined || textChangedDuringSave) {
    const keptText = {
      ...snapshot,
      text: currentText
    }
    return keptText
  }
  return snapshot
}

/**
 * After a noteboard read, keeps text the user typed while that read was in flight.
 */
export function mergeNoteboardRootKeepingTextTypedDuringRead<T extends {
  text: string
}> (
  snapshot: T,
  currentText: string,
  textAtStart: string
): T {
  if (currentText === textAtStart) {
    return snapshot
  }
  const keptText = {
    ...snapshot,
    text: currentText
  }
  return keptText
}
