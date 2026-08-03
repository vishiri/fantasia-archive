import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

type T_openedDocumentTabDocumentActionsHandlerDeps = {
  S_FaOpenedDocuments: () => {
    createTemporaryDocumentCopyFromOpenedTab: (documentId: string) => Promise<string | null>
    createTemporaryDocumentUnderParentFromOpenedTab: (documentId: string) => Promise<string | null>
  }
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  notifyCreate: (options: {
    message: string
    type: string
  }) => void
}

function createHandleCopyOpenedDocumentTabDocument (
  deps: T_openedDocumentTabDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyOpenedDocumentTabDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentCopyFromOpenedTab(
      payload.documentId
    )
    if (newDocumentId === null) {
      deps.notifyCreate({
        message: deps.i18n.global.t('globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError'),
        type: 'negative'
      })
      return
    }

    return { payloadPreview: newDocumentId }
  }
}

function createHandleAddOpenedDocumentTabChildDocument (
  deps: T_openedDocumentTabDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleAddOpenedDocumentTabChildDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentUnderParentFromOpenedTab(
      payload.documentId
    )
    if (newDocumentId === null) {
      deps.notifyCreate({
        message: deps.i18n.global.t('globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError'),
        type: 'negative'
      })
      return
    }

    return { payloadPreview: newDocumentId }
  }
}

export function createFaActionDefinitionHandlersOpenedDocumentTabDocumentActions (
  deps: T_openedDocumentTabDocumentActionsHandlerDeps
): {
    handleAddOpenedDocumentTabChildDocument: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleCopyOpenedDocumentTabDocument: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
  } {
  const handleCopyOpenedDocumentTabDocument = createHandleCopyOpenedDocumentTabDocument(deps)
  const handleAddOpenedDocumentTabChildDocument = createHandleAddOpenedDocumentTabChildDocument(deps)

  return {
    handleAddOpenedDocumentTabChildDocument,
    handleCopyOpenedDocumentTabDocument
  }
}
