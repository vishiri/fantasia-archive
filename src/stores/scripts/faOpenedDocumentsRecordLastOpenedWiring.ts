import { ResultAsync } from 'neverthrow'

/**
 * Best-effort MRU write for a saved document open. Never throws to callers.
 */
export async function recordFaOpenedDocumentLastOpenedBestEffort (
  documentId: string
): Promise<void> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.recordDocumentLastOpened !== 'function') {
    return
  }
  const recorded = await ResultAsync.fromPromise(
    api.recordDocumentLastOpened({ documentId }),
    (error: unknown) => error
  )
  if (recorded.isErr()) {
    console.warn('[S_FaOpenedDocuments] recordDocumentLastOpened failed', recorded.error)
  }
}
