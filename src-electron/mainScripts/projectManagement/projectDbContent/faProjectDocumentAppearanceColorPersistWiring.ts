import type { I_faProjectDocumentCreateInput, I_faProjectDocumentPatch } from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

import { normalizeFaProjectDocumentAppearanceColorForStorage } from 'app/src-electron/shared/faProjectDocumentAppearanceColorSchema'

export function resolveFaProjectDocumentAppearanceColorsForCreate (
  input: I_faProjectDocumentCreateInput
): {
    documentBackgroundColor: string | null
    documentTextColor: string | null
  } {
  const documentTextColor = input.documentTextColor !== undefined
    ? normalizeFaProjectDocumentAppearanceColorForStorage(input.documentTextColor)
    : null
  const documentBackgroundColor = input.documentBackgroundColor !== undefined
    ? normalizeFaProjectDocumentAppearanceColorForStorage(input.documentBackgroundColor)
    : null
  return {
    documentBackgroundColor,
    documentTextColor
  }
}

export function resolveFaProjectDocumentAppearanceColorsForUpdate (
  patch: I_faProjectDocumentPatch,
  existingRow: I_faSqlProjectDocumentRow
): {
    documentBackgroundColor: string | null
    documentTextColor: string | null
  } {
  const documentTextColor = patch.documentTextColor !== undefined
    ? normalizeFaProjectDocumentAppearanceColorForStorage(patch.documentTextColor)
    : existingRow.document_text_color
  const documentBackgroundColor = patch.documentBackgroundColor !== undefined
    ? normalizeFaProjectDocumentAppearanceColorForStorage(patch.documentBackgroundColor)
    : existingRow.document_background_color
  return {
    documentBackgroundColor,
    documentTextColor
  }
}
