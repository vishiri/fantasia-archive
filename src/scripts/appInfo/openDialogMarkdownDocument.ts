import type { T_dialogName } from 'app/types/T_dialogList'
import type { T_documentName } from 'app/types/T_documentList'

import { S_DialogMarkdown, S_DialogComponent } from 'app/src/stores/S_Dialog'

/**
 * Opens to the particular markdown document based on the input document name.
 * @param inputDocumentName - The name of the document to open.
 */
export const openDialogMarkdownDocument = (inputDocumentName: T_documentName) => {
  const markdownDialogStore = S_DialogMarkdown()
  markdownDialogStore.documentToOpen = inputDocumentName
  markdownDialogStore.generateDialogUUID()
}

/**
 * Opens the particular dialog component based on the input dialog name.
 * @param inputDialogName - The name of the dialog component to open.
 */
export const openDialogComponent = (inputDialogName: T_dialogName) => {
  const componentDialogStore = S_DialogComponent()
  componentDialogStore.dialogToOpen = inputDialogName
  componentDialogStore.generateDialogUUID()
}
