import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import { runHierarchyTreeDocumentCreateOnce } from './faActionDefinitionHandlersHierarchyTreeDocumentCreateWiring'

type T_openedDocumentCreateFailureNoticeDeps = {
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  isProjectReplacementInFlight?: () => boolean
  notifyCreate: (options: {
    message: string
    type: string
  }) => void
  readProjectContentEpoch?: () => number
}

type T_openedDocumentTabDocumentActionsHandlerDeps = T_openedDocumentCreateFailureNoticeDeps & {
  S_FaOpenedDocuments: () => {
    createTemporaryDocumentCopyFromOpenedTab: (documentId: string) => Promise<string | null>
    createTemporaryDocumentUnderParentFromOpenedTab: (documentId: string) => Promise<string | null>
  }
}

export function notifyOpenedDocumentCreateFailedUnlessProjectChanged (
  deps: T_openedDocumentCreateFailureNoticeDeps,
  epochAtStart: number | undefined
): void {
  if (deps.isProjectReplacementInFlight?.() === true) {
    return
  }
  const readProjectContentEpoch = deps.readProjectContentEpoch
  if (epochAtStart !== undefined && readProjectContentEpoch !== undefined) {
    if (readProjectContentEpoch() !== epochAtStart) {
      return
    }
  }
  const message = deps.i18n.global.t(
    'globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError'
  )
  deps.notifyCreate({
    message,
    type: 'negative'
  })
}

function createHandleCopyOpenedDocumentTabDocument (
  deps: T_openedDocumentTabDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  const copyInFlightDocumentIds = new Set<string>()

  return async function handleCopyOpenedDocumentTabDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    return await runHierarchyTreeDocumentCreateOnce(
      copyInFlightDocumentIds,
      payload.documentId,
      async () => {
        const epochAtStart = deps.readProjectContentEpoch?.()
        const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentCopyFromOpenedTab(
          payload.documentId
        )
        if (newDocumentId === null) {
          notifyOpenedDocumentCreateFailedUnlessProjectChanged(deps, epochAtStart)
          return
        }
        const payloadPreview = newDocumentId
        return { payloadPreview }
      }
    )
  }
}

function createHandleAddOpenedDocumentTabChildDocument (
  deps: T_openedDocumentTabDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  const addChildInFlightDocumentIds = new Set<string>()

  return async function handleAddOpenedDocumentTabChildDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    return await runHierarchyTreeDocumentCreateOnce(
      addChildInFlightDocumentIds,
      payload.documentId,
      async () => {
        const epochAtStart = deps.readProjectContentEpoch?.()
        const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentUnderParentFromOpenedTab(
          payload.documentId
        )
        if (newDocumentId === null) {
          notifyOpenedDocumentCreateFailedUnlessProjectChanged(deps, epochAtStart)
          return
        }
        const payloadPreview = newDocumentId
        return { payloadPreview }
      }
    )
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
