import type {
  I_faProjectStylingPatch,
  I_faProjectStylingRoot
} from 'app/types/I_faProjectStylingDomain'

/**
 * After a silent partial KV write, keeps in-memory CSS when the patch omitted 'css' or the draft changed during the round trip.
 */
export function mergeProjectStylingRootAfterSilentPersist (
  snapshot: I_faProjectStylingRoot,
  patch: I_faProjectStylingPatch,
  currentCss: string,
  cssAtStart: string
): I_faProjectStylingRoot {
  const cssChangedDuringSave = currentCss !== cssAtStart
  if (patch.css === undefined || cssChangedDuringSave) {
    return {
      ...snapshot,
      css: currentCss
    }
  }
  return snapshot
}
