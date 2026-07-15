/**
 * Builds a copied document display name using a translated prefix and the source name.
 */
export function resolveCopyOfDocumentDisplayName (input: {
  formatCopyOfPrefix: (params: { originalName: string }) => string
  originalDisplayName: string
}): string {
  return input.formatCopyOfPrefix({
    originalName: input.originalDisplayName
  })
}
