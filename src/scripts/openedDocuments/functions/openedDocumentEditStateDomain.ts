import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Whether an opened document tab is in preview (viewing) mode.
 * Preview mode shows read-only field presentation; no editable inputs.
 */
export function resolveOpenedDocumentTabIsInPreviewMode (editState: boolean): boolean {
  return !editState
}

/**
 * Whether an opened document tab is in edit mode.
 * Edit mode may show inputs and other editable controls for document fields.
 */
export function resolveOpenedDocumentTabIsInEditMode (editState: boolean): boolean {
  return editState
}

/**
 * Ensures tab rows loaded from persistence always carry a defined editState baseline.
 */
export function normalizeOpenedDocumentTabEditState (
  tab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  return {
    ...tab,
    editState: tab.editState ?? false
  }
}

/**
 * Resolves the user-visible document name for preview-mode presentation.
 */
export function resolveOpenedDocumentDisplayNameFromTab (
  tab: Pick<I_faOpenedDocumentTab, 'displayNameDraft' | 'tabLabel'>
): string {
  const draft = tab.displayNameDraft.trim()
  if (draft.length > 0) {
    return draft
  }

  return tab.tabLabel
}
