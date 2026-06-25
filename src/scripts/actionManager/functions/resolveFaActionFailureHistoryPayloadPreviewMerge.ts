/**
 * Picks the Action Monitor failure-row payload preview, preferring shaped project-open errors.
 */
export function resolveFaActionFailureHistoryPayloadPreviewMerge (
  failureShapePreview: string | undefined,
  entryPayloadPreview: string
): string | undefined {
  if (failureShapePreview !== undefined && failureShapePreview !== '') {
    return failureShapePreview
  }
  if (entryPayloadPreview === '') {
    return undefined
  }
  return entryPayloadPreview
}
