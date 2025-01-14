import { T_dialogList } from 'app/interfaces/T_dialogList'
import { T_documentList } from 'app/interfaces/T_documentList'

import { S_DialogMarkdown, S_DialogComponent } from 'app/src/stores/S_Dialog'

export const openDialogMarkdownDocument = (inputDocumentName: T_documentList) => {
  S_DialogMarkdown.documentToOpen = inputDocumentName
  S_DialogMarkdown.generateDialogUUID()
}

export const openDialogComponent = (inputDialogName: T_dialogList) => {
  S_DialogComponent.dialogToOpen = inputDialogName
  S_DialogComponent.generateDialogUUID()
}
