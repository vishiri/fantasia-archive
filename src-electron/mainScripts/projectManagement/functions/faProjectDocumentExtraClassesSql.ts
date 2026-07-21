import type { I_faProjectDocumentCreateInput, I_faProjectDocumentPatch } from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

export function normalizeFaProjectDocumentExtraClassesForStorage (
  value: string | null | undefined
): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value.trim()
}

export function resolveFaProjectDocumentExtraClassesForCreateInput (
  input: I_faProjectDocumentCreateInput
): string {
  if (input.extraClasses === undefined) {
    return ''
  }
  return normalizeFaProjectDocumentExtraClassesForStorage(input.extraClasses)
}

export function resolveFaProjectDocumentExtraClassesForUpdate (
  patch: I_faProjectDocumentPatch,
  existingRow: I_faSqlProjectDocumentRow
): string {
  if (patch.extraClasses === undefined) {
    return existingRow.extra_classes
  }
  return normalizeFaProjectDocumentExtraClassesForStorage(patch.extraClasses)
}
