import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

export function buildCleanFaAppNoteboardRoot (
  raw: Partial<I_faAppNoteboardRoot> & Record<string, unknown>,
  normalizePersistedRectForStorage: (frame: unknown) => I_faFloatingWindowPersistedRect | null,
  persistedFloatingWindowFramesAreEquivalent: (
    a: unknown,
    b: I_faFloatingWindowPersistedRect | null
  ) => boolean
): {
    next: I_faAppNoteboardRoot
    shouldRewrite: boolean
  } {
  const text = typeof raw.text === 'string' ? raw.text : ''
  const frame = normalizePersistedRectForStorage(raw.frame)
  const next: I_faAppNoteboardRoot = {
    frame,
    schemaVersion: 1,
    text
  }
  const unexpectedTop = Object.keys(raw).some((k) => {
    return k !== 'frame' && k !== 'schemaVersion' && k !== 'text'
  })
  const shouldRewrite =
    unexpectedTop ||
    raw.schemaVersion !== 1 ||
    typeof raw.text !== 'string' ||
    text !== (typeof raw.text === 'string' ? raw.text : '') ||
    !persistedFloatingWindowFramesAreEquivalent(raw.frame, frame)

  return {
    next,
    shouldRewrite
  }
}
