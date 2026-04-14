import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'

import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

/**
 * Opens to the particular markdown document based on the input document name.
 * @param inputDocumentName - The name of the document to open.
 */
export const openDialogMarkdownDocument = (inputDocumentName: T_documentName) => {
  const componentDialogStore = S_DialogComponent()
  if (componentDialogStore.componentDialogOpenCount > 0) {
    return
  }
  const markdownDialogStore = S_DialogMarkdown()
  if (markdownDialogStore.markdownDialogOpenCount === 0) {
    markdownDialogStore.onMarkdownDialogBecameVisible()
  }
  markdownDialogStore.documentToOpen = inputDocumentName
  markdownDialogStore.generateDialogUUID()
}

/**
 * Opens the particular dialog component based on the input dialog name.
 * @param inputDialogName - The name of the dialog component to open.
 */
export const openDialogComponent = (inputDialogName: T_dialogName) => {
  const markdownDialogStore = S_DialogMarkdown()
  if (markdownDialogStore.markdownDialogOpenCount > 0) {
    return
  }
  const componentDialogStore = S_DialogComponent()
  if (componentDialogStore.componentDialogOpenCount > 0) {
    return
  }
  componentDialogStore.dialogToOpen = inputDialogName
  componentDialogStore.generateDialogUUID()
}
