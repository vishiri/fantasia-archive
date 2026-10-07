import type {
  I_faProjectDocument,
  I_faProjectDocumentCreateInput,
  I_faProjectDocumentPatch
} from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectHierarchyTreeDocumentChild, I_faProjectHierarchyTreeMoveDocumentInput } from 'app/types/I_faProjectHierarchyTreeDomain'
import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'

import {
  enqueueFaProjectDocumentHierarchyWrite,
  tryGetFaProjectHierarchyTreeStoreForRenderer
} from './faComponentTestingProjectContentDocumentIndexWiring'
import { getFaComponentTestingProjectContentOverrides } from './faComponentTestingProjectContentOverridesWiring'
import { buildFaComponentTestingPlacementDocumentChildrenKey } from './functions/faComponentTestingPlacementDocumentChildren'

/**
 * True when documentsById overrides or bridge createDocument exists.
 */
export function hasFaProjectDocumentCreateWriter (): boolean {
  if (getFaComponentTestingProjectContentOverrides()?.documentsById !== undefined) {
    return true
  }
  return typeof window.faContentBridgeAPIs?.projectContent?.createDocument === 'function'
}

/**
 * True when documentsById overrides or bridge updateDocument exists.
 */
export function hasFaProjectDocumentUpdateWriter (): boolean {
  if (getFaComponentTestingProjectContentOverrides()?.documentsById !== undefined) {
    return true
  }
  return typeof window.faContentBridgeAPIs?.projectContent?.updateDocument === 'function'
}

/**
 * True when documentsById overrides or bridge deleteDocument exists.
 */
export function hasFaProjectDocumentDeleteWriter (): boolean {
  if (getFaComponentTestingProjectContentOverrides()?.documentsById !== undefined) {
    return true
  }
  return typeof window.faContentBridgeAPIs?.projectContent?.deleteDocument === 'function'
}

/**
 * Deletes a document from overrides when present, else bridge.
 */
export async function deleteFaProjectDocumentForRenderer (
  documentId: string
): Promise<void> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const overridesMap = overrides?.documentsById
  if (overridesMap !== undefined) {
    delete overridesMap[documentId]
    const placementChildren = overrides?.placementDocumentChildrenByKey
    if (placementChildren !== undefined) {
      for (const key of Object.keys(placementChildren)) {
        const children = placementChildren[key]
        if (children === undefined) {
          continue
        }
        placementChildren[key] = children.filter((child) => {
          return child.id !== documentId
        })
      }
    }
    return
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.deleteDocument !== 'function') {
    throw new Error('projectContent.deleteDocument unavailable')
  }
  await api.deleteDocument(documentId)
  await tryGetFaProjectHierarchyTreeStoreForRenderer()?.reloadDocumentIndexFromBridge()
}

/**
 * Creates a document in overrides when present, else bridge.
 */
export async function createFaProjectDocumentForRenderer (
  input: I_faProjectDocumentCreateInput
): Promise<I_faProjectDocument> {
  const overridesMap = getFaComponentTestingProjectContentOverrides()?.documentsById
  if (overridesMap !== undefined) {
    const id = input.id ?? crypto.randomUUID()
    const nowMs = Date.now()
    const createdDocument: I_faProjectDocument = {
      createdAtMs: nowMs,
      displayName: input.displayName,
      documentBackgroundColor: input.documentBackgroundColor ?? null,
      documentTextColor: input.documentTextColor ?? null,
      extraClasses: input.extraClasses ?? '',
      id,
      isCategory: input.isCategory === true,
      isDead: input.isDead === true,
      isFinished: input.isFinished === true,
      isMinor: input.isMinor === true,
      parentDocumentId: input.parentDocumentId ?? null,
      placementId: input.placementId ?? null,
      sortOrder: input.sortOrder ?? 0,
      templateId: input.templateId ?? null,
      treeOrderNumber: input.treeOrderNumber ?? FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
      updatedAtMs: nowMs,
      worldId: input.worldId
    }
    overridesMap[id] = createdDocument
    const placementId = createdDocument.placementId
    const placementChildren = getFaComponentTestingProjectContentOverrides()?.placementDocumentChildrenByKey
    if (placementId !== null && placementChildren !== undefined) {
      const key = buildFaComponentTestingPlacementDocumentChildrenKey(
        placementId,
        createdDocument.parentDocumentId
      )
      const existing = placementChildren[key] ?? []
      const nextChild: I_faProjectHierarchyTreeDocumentChild = {
        displayName: createdDocument.displayName,
        documentBackgroundColor: createdDocument.documentBackgroundColor,
        documentTextColor: createdDocument.documentTextColor,
        hasChildren: false,
        id: createdDocument.id,
        isCategory: createdDocument.isCategory,
        isDead: createdDocument.isDead,
        isFinished: createdDocument.isFinished,
        isMinor: createdDocument.isMinor,
        parentDocumentId: createdDocument.parentDocumentId,
        placementId,
        sortOrder: createdDocument.sortOrder,
        treeOrderNumber: createdDocument.treeOrderNumber
      }
      placementChildren[key] = [
        ...existing.filter((child) => {
          return child.id !== createdDocument.id
        }),
        nextChild
      ]
    }
    return {
      ...createdDocument
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.createDocument !== 'function') {
    throw new Error('projectContent.createDocument unavailable')
  }
  const createdDocument = await api.createDocument(input)
  tryGetFaProjectHierarchyTreeStoreForRenderer()?.upsertIndexedDocument(createdDocument)
  return createdDocument
}

/**
 * Updates a document in overrides when present, else bridge.
 */
export async function updateFaProjectDocumentForRenderer (
  documentId: string,
  patch: I_faProjectDocumentPatch
): Promise<I_faProjectDocument> {
  const overridesMap = getFaComponentTestingProjectContentOverrides()?.documentsById
  if (overridesMap !== undefined) {
    const current = overridesMap[documentId]
    if (current === undefined) {
      throw new Error(`projectContent override missing document ${documentId}`)
    }
    const updatedDocument: I_faProjectDocument = {
      ...current,
      displayName: patch.displayName ?? current.displayName,
      documentBackgroundColor: patch.documentBackgroundColor !== undefined
        ? patch.documentBackgroundColor
        : current.documentBackgroundColor,
      documentTextColor: patch.documentTextColor !== undefined
        ? patch.documentTextColor
        : current.documentTextColor,
      extraClasses: patch.extraClasses ?? current.extraClasses,
      isCategory: patch.isCategory ?? current.isCategory,
      isDead: patch.isDead ?? current.isDead,
      isFinished: patch.isFinished ?? current.isFinished,
      isMinor: patch.isMinor ?? current.isMinor,
      parentDocumentId: patch.parentDocumentId !== undefined
        ? patch.parentDocumentId
        : current.parentDocumentId,
      placementId: patch.placementId !== undefined
        ? patch.placementId
        : current.placementId,
      sortOrder: patch.sortOrder ?? current.sortOrder,
      templateId: patch.templateId !== undefined
        ? patch.templateId
        : current.templateId,
      treeOrderNumber: patch.treeOrderNumber ?? current.treeOrderNumber,
      updatedAtMs: Date.now(),
      worldId: patch.worldId ?? current.worldId
    }
    overridesMap[documentId] = updatedDocument
    return {
      ...updatedDocument
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.updateDocument !== 'function') {
    throw new Error('projectContent.updateDocument unavailable')
  }
  const updatedDocument = await api.updateDocument(documentId, patch)
  tryGetFaProjectHierarchyTreeStoreForRenderer()?.upsertIndexedDocument(updatedDocument)
  return updatedDocument
}

/**
 * Moves a document in the hierarchy via bridge, then patches the session document index.
 */
export async function moveFaProjectDocumentInHierarchyForRenderer (
  input: I_faProjectHierarchyTreeMoveDocumentInput
): Promise<I_faProjectHierarchyTreeDocumentChild> {
  return await enqueueFaProjectDocumentHierarchyWrite(() => {
    return moveFaProjectDocumentInHierarchyNow(input)
  })
}

async function moveFaProjectDocumentInHierarchyNow (
  input: I_faProjectHierarchyTreeMoveDocumentInput
): Promise<I_faProjectHierarchyTreeDocumentChild> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.moveDocumentInHierarchy !== 'function') {
    throw new Error('projectContent.moveDocumentInHierarchy unavailable')
  }
  const moved = await api.moveDocumentInHierarchy(input)
  tryGetFaProjectHierarchyTreeStoreForRenderer()?.applyIndexedMove(input)
  return moved
}
