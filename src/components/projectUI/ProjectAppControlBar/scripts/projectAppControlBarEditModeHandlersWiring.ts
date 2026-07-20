import type {
  I_assembleProjectAppControlBarApiInput,
  I_projectAppControlBarComposableApi
} from 'app/types/I_faProjectAppControlBarDomain'

export function buildProjectAppControlBarEditModeHandlers (input: {
  activeDocumentId: I_assembleProjectAppControlBarApiInput['activeDocumentId']
  enterDocumentEditMode: I_assembleProjectAppControlBarApiInput['enterDocumentEditMode']
  requestDeleteDocument: I_assembleProjectAppControlBarApiInput['requestDeleteDocument']
  runFaAction: I_assembleProjectAppControlBarApiInput['runFaAction']
}): Pick<
  I_projectAppControlBarComposableApi,
  | 'onAddNewDocumentUnderCurrentClick'
  | 'onCopyCurrentDocumentClick'
  | 'onDeleteCurrentDocumentClick'
  | 'onEnterEditModeClick'
  | 'onSaveDocumentClick'
> {
  function onEnterEditModeClick (): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.enterDocumentEditMode(documentId)
  }

  function onDeleteCurrentDocumentClick (): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.requestDeleteDocument(documentId)
  }

  function onCopyCurrentDocumentClick (): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.runFaAction('copyOpenedDocumentTabDocument', {
      documentId
    })
  }

  function onAddNewDocumentUnderCurrentClick (): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.runFaAction('addOpenedDocumentTabChildDocument', {
      documentId
    })
  }

  function onSaveDocumentClick (keepEditMode: boolean): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.runFaAction('saveOpenedDocumentDisplayName', {
      documentId,
      keepEditMode
    })
  }

  return {
    onAddNewDocumentUnderCurrentClick,
    onCopyCurrentDocumentClick,
    onDeleteCurrentDocumentClick,
    onEnterEditModeClick,
    onSaveDocumentClick
  }
}
