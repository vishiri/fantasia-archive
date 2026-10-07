import type { T_faOpenedDocumentOpenMode } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import { notifyOpenedDocumentCreateFailedUnlessProjectChanged } from './faActionDefinitionHandlersOpenedDocumentTabDocumentActionsWiring'

type T_hierarchyTreeDocumentCreateHandlerDeps = {
  S_FaOpenedDocuments: () => {
    createTemporaryDocumentCopyFromSource: (
      documentId: string,
      openMode?: T_faOpenedDocumentOpenMode | undefined
    ) => Promise<string | null>
    createTemporaryDocumentUnderParentDocument: (
      documentId: string,
      openMode?: T_faOpenedDocumentOpenMode | undefined
    ) => Promise<string | null>
  }
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

export function runHierarchyTreeDocumentCreateOnce (
  inFlightDocumentIds: Set<string>,
  documentId: string,
  run: () => Promise<T_faActionHandlerContinuation | void>
): Promise<T_faActionHandlerContinuation | void> {
  if (inFlightDocumentIds.has(documentId)) {
    return Promise.resolve()
  }
  inFlightDocumentIds.add(documentId)
  const finished = run().finally(() => {
    inFlightDocumentIds.delete(documentId)
  })
  return finished
}

export function createHandleCopyHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentCreateHandlerDeps
): (payload: {
    documentId: string
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }) => Promise<T_faActionHandlerContinuation | void> {
  const copyInFlightDocumentIds = new Set<string>()

  return async function handleCopyHierarchyTreeDocument (payload: {
    documentId: string
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }): Promise<T_faActionHandlerContinuation | void> {
    return await runHierarchyTreeDocumentCreateOnce(
      copyInFlightDocumentIds,
      payload.documentId,
      async () => {
        const epochAtStart = deps.readProjectContentEpoch?.()
        const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentCopyFromSource(
          payload.documentId,
          payload.openMode
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

export function createHandleAddHierarchyTreeChildDocument (
  deps: T_hierarchyTreeDocumentCreateHandlerDeps
): (payload: {
    documentId: string
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }) => Promise<T_faActionHandlerContinuation | void> {
  const addChildInFlightDocumentIds = new Set<string>()

  return async function handleAddHierarchyTreeChildDocument (payload: {
    documentId: string
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }): Promise<T_faActionHandlerContinuation | void> {
    return await runHierarchyTreeDocumentCreateOnce(
      addChildInFlightDocumentIds,
      payload.documentId,
      async () => {
        const epochAtStart = deps.readProjectContentEpoch?.()
        const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentUnderParentDocument(
          payload.documentId,
          payload.openMode
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
