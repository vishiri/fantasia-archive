import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

export function buildCleanFaAppStylingRoot (
  raw: Partial<I_faAppStylingRoot> & Record<string, unknown>,
  normalizePersistedRectForStorage: (frame: unknown) => I_faFloatingWindowPersistedRect | null,
  persistedFloatingWindowFramesAreEquivalent: (
    a: unknown,
    b: I_faFloatingWindowPersistedRect | null
  ) => boolean
): {
    next: I_faAppStylingRoot
    shouldRewrite: boolean
  } {
  const css = typeof raw.css === 'string' ? raw.css : ''
  const frame = normalizePersistedRectForStorage(raw.frame)
  const next: I_faAppStylingRoot = {
    css,
    frame,
    schemaVersion: 1
  }
  const unexpectedTop = Object.keys(raw).some((k) => {
    return k !== 'css' && k !== 'frame' && k !== 'schemaVersion'
  })
  const shouldRewrite =
    unexpectedTop ||
    raw.schemaVersion !== 1 ||
    typeof raw.css !== 'string' ||
    css !== (typeof raw.css === 'string' ? raw.css : '') ||
    !persistedFloatingWindowFramesAreEquivalent(raw.frame, frame)

  return {
    next,
    shouldRewrite
  }
}
