import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS } from 'app/helpers/openedDocumentTabTestStatusFlagDefaults'

type T_faOpenedDocumentTabStoryFixtureInput = Partial<I_faOpenedDocumentTab> &
  Pick<I_faOpenedDocumentTab, 'documentId' | 'displayNameDraft' | 'savedDisplayName'>

/**
 * Full opened-document tab for Storybook seeds (status, belongs-under, order, extra classes).
 */
export function createFaOpenedDocumentTabStoryFixture (
  input: T_faOpenedDocumentTabStoryFixtureInput
): I_faOpenedDocumentTab {
  return {
    persistenceState: 'persisted',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    documentTextColorDraft: '',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: '',
    savedDocumentBackgroundColor: '',
    hasUnsavedChanges: false,
    editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
    ...FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS,
    ...input
  }
}
