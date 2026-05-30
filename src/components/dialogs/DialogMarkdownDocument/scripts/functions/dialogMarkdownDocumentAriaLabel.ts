import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'

type T_dialogMarkdownDocumentTranslate = (key: string) => string

/**
 * Resolves the accessible name for the markdown document dialog from the active document id.
 */
export function resolveDialogMarkdownDocumentAriaLabel (
  documentName: string,
  t: T_dialogMarkdownDocumentTranslate
): string {
  switch (documentName) {
    case 'advancedSearchCheatSheet':
      return t('dialogs.markdownDocument.ariaLabels.advancedSearchCheatSheet')
    case 'advancedSearchGuide':
      return t('dialogs.markdownDocument.ariaLabels.advancedSearchGuide')
    case 'changeLog':
      return t('dialogs.markdownDocument.ariaLabels.changeLog')
    case 'license':
      return t('dialogs.markdownDocument.ariaLabels.license')
    case 'tipsTricksTrivia':
      return t('dialogs.markdownDocument.ariaLabels.tipsTricksTrivia')
    default:
      return t('dialogs.markdownDocument.ariaLabels.fallback')
  }
}

/**
 * True when the markdown store exposes a non-empty document id to open.
 */
export function isNonEmptyMarkdownDocumentName (
  documentToOpen: unknown
): documentToOpen is T_documentName {
  return typeof documentToOpen === 'string' && documentToOpen !== ''
}
