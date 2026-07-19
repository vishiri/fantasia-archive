/** Theme token for minor document labels when no custom text color is set. */
export const FA_DOCUMENT_STATUS_MINOR_LABEL_COLOR = 'var(--fa-color-text-muted)'

/**
 * Resolves icon + label color for document status visuals in tree and tabs.
 * Manual document text color wins over minor muted grey.
 */
export function resolveFaDocumentStatusLabelColor (input: {
  documentTextColor: string
  isMinor: boolean
}): string | undefined {
  const textColor = input.documentTextColor.trim()
  if (textColor.length > 0) {
    return textColor
  }
  if (input.isMinor) {
    return FA_DOCUMENT_STATUS_MINOR_LABEL_COLOR
  }
  return undefined
}
