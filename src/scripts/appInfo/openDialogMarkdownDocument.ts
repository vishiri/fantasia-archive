import { T_dialogList } from 'app/types/T_dialogList'
import { T_documentList } from 'app/types/T_documentList'

import { S_DialogMarkdown, S_DialogComponent } from 'app/src/stores/S_Dialog'

/**
 * Opens to the particular markdown document based on the input document name.
 * @param inputDocumentName - The name of the document to open.
 */
export const openDialogMarkdownDocument = (inputDocumentName: T_documentList) => {
  S_DialogMarkdown.documentToOpen = inputDocumentName
  S_DialogMarkdown.generateDialogUUID()
}

/**
  * Opens to the particular dialog component based on the input dialog name.
  * @param inputDialogName - The name of the dialog component to open.
  */
export const openDialogComponent = (inputDialogName: T_dialogList) => {
  S_DialogComponent.dialogToOpen = inputDialogName
  S_DialogComponent.generateDialogUUID()
}
