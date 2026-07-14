import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

function resolveNonemptyTrimmedColorString (value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }

  return trimmed
}

/**
 * Returns trimmed document text color draft for clipboard copy, or null when empty after trim.
 */
export function resolveProjectDocumentControlBarTabCopyTextColorText (
  tab: Pick<I_faOpenedDocumentTab, 'documentTextColorDraft'>
): string | null {
  return resolveNonemptyTrimmedColorString(tab.documentTextColorDraft)
}

/**
 * Returns trimmed document background color draft for clipboard copy, or null when empty after trim.
 */
export function resolveProjectDocumentControlBarTabCopyBackgroundColorText (
  tab: Pick<I_faOpenedDocumentTab, 'documentBackgroundColorDraft'>
): string | null {
  return resolveNonemptyTrimmedColorString(tab.documentBackgroundColorDraft)
}
