import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Hierarchy tree category rows use the same MDI folder glyph.
 */
export const PROJECT_DOCUMENT_CONTROL_BAR_CATEGORY_TAB_ICON = 'mdi-folder-open'

/**
 * Tab / browse-row icon from the opened document's current category draft.
 */
export function resolveProjectDocumentControlBarTabDisplayIcon (
  tab: Pick<I_faOpenedDocumentTab, 'isCategoryDraft' | 'templateIcon'>
): string {
  if (tab.isCategoryDraft === true) {
    return PROJECT_DOCUMENT_CONTROL_BAR_CATEGORY_TAB_ICON
  }
  return tab.templateIcon
}
