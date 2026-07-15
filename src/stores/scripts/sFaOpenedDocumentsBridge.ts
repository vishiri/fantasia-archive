import { ResultAsync } from 'neverthrow'

import type { I_faOpenedDocumentsSnapshot } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

function serializeFaOpenedDocumentsSnapshotForBridge (
  snapshot: I_faOpenedDocumentsSnapshot
): I_faOpenedDocumentsSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as I_faOpenedDocumentsSnapshot
}

/**
 * Reads opened documents snapshot from the active project via preload bridge.
 */
export async function faOpenedDocumentsRefreshSnapshotFromBridge (): Promise<
I_faOpenedDocumentsSnapshot | null
> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.getOpenedDocumentsSnapshot !== 'function') {
    return null
  }
  const readResult = await ResultAsync.fromPromise(
    api.getOpenedDocumentsSnapshot(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    console.error('[S_FaOpenedDocuments] getOpenedDocumentsSnapshot failed', readResult.error)
    return null
  }
  return readResult.value
}

/**
 * Persists the opened documents snapshot via preload bridge.
 */
export async function faOpenedDocumentsPersistSnapshotFromBridge (
  snapshot: I_faOpenedDocumentsSnapshot
): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.saveOpenedDocumentsSnapshot !== 'function') {
    console.warn('[S_FaOpenedDocuments] saveOpenedDocumentsSnapshot unavailable — restart Electron dev')
    return false
  }
  const writeResult = await ResultAsync.fromPromise(
    api.saveOpenedDocumentsSnapshot(
      serializeFaOpenedDocumentsSnapshotForBridge(snapshot)
    ),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    console.error('[S_FaOpenedDocuments] saveOpenedDocumentsSnapshot failed', writeResult.error)
    return false
  }
  if (!writeResult.value) {
    console.warn('[S_FaOpenedDocuments] saveOpenedDocumentsSnapshot returned false')
    return false
  }
  return true
}

export function createEmptyFaOpenedDocumentsSnapshot (): I_faOpenedDocumentsSnapshot {
  return {
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
    tabs: []
  }
}
