import { ResultAsync } from 'neverthrow'

import {
  getFaProjectDocumentByIdForRenderer,
  hasFaProjectDocumentByIdReader
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import { throwUnlessFaProjectContentMissingRow } from 'app/src/stores/scripts/faOpenedDocumentsTemporarySessionWiring'

/**
 * Display name for a delete confirm when the tab and hierarchy row are both absent.
 * Missing rows return null. Any other read failure is thrown.
 */
export async function readDeleteDialogDocumentDisplayName (
  documentId: string
): Promise<string | null> {
  if (typeof window === 'undefined' || !hasFaProjectDocumentByIdReader()) {
    return null
  }
  const documentResult = await ResultAsync.fromPromise(
    getFaProjectDocumentByIdForRenderer(documentId),
    (error): unknown => error
  )
  if (documentResult.isErr()) {
    return throwUnlessFaProjectContentMissingRow(documentResult.error)
  }
  const displayName = documentResult.value.displayName.trim()
  if (displayName.length === 0) {
    return null
  }
  return displayName
}

export function reportDeleteDialogDocumentNameReadError (error: unknown): void {
  console.error('[DialogDeleteOpenedDocument] document name read failed', error)
}
