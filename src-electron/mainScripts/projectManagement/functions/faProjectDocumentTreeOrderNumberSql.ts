import type { I_faProjectDocumentCreateInput, I_faProjectDocumentPatch } from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

export function resolveFaProjectDocumentTreeOrderNumberForCreateInput (
  input: I_faProjectDocumentCreateInput
): number {
  if (input.treeOrderNumber !== undefined) {
    return input.treeOrderNumber
  }
  return FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
}

export function resolveFaProjectDocumentTreeOrderNumberForUpdate (
  patch: I_faProjectDocumentPatch,
  existingRow: I_faSqlProjectDocumentRow
): number {
  if (patch.treeOrderNumber !== undefined) {
    return patch.treeOrderNumber
  }
  return existingRow.tree_order_number
}
