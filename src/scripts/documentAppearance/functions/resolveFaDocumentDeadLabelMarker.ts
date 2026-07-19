/** FA 1.0 dagger prefix for dead/gone/destroyed documents. */
export const FA_DOCUMENT_DEAD_LABEL_MARKER = '†'

/** Check mark prefix for finished documents (U+2713). */
export const FA_DOCUMENT_FINISHED_LABEL_MARKER = '\u2713'

export function resolveFaDocumentDeadLabelShowsMarker (isDead: boolean): boolean {
  return isDead
}

export function resolveFaDocumentFinishedLabelShowsMarker (isFinished: boolean): boolean {
  return isFinished
}
