import type { I_faProjectDocumentCreateInput, I_faProjectDocumentPatch } from 'app/types/I_faProjectDocumentDomain'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'

function resolveBooleanFlagForCreate (value: boolean | undefined): number {
  return value === true ? 1 : 0
}

function resolveBooleanFlagForUpdate (
  patchValue: boolean | undefined,
  existingValue: number
): number {
  if (patchValue !== undefined) {
    return patchValue ? 1 : 0
  }
  return existingValue
}

export function resolveFaProjectDocumentBooleanFlagsForCreate (input: {
  isCategory?: boolean | undefined
  isDead?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
}): {
    isCategory: number
    isDead: number
    isFinished: number
    isMinor: number
  } {
  const isCategory = resolveBooleanFlagForCreate(input.isCategory)
  const isFinished = resolveBooleanFlagForCreate(input.isFinished)
  const isMinor = resolveBooleanFlagForCreate(input.isMinor)
  const isDead = resolveBooleanFlagForCreate(input.isDead)
  return {
    isCategory,
    isDead,
    isFinished,
    isMinor
  }
}

export function resolveFaProjectDocumentBooleanFlagsForUpdate (
  patch: I_faProjectDocumentPatch,
  existingRow: I_faSqlProjectDocumentRow
): {
    isCategory: number
    isDead: number
    isFinished: number
    isMinor: number
  } {
  const isCategory = resolveBooleanFlagForUpdate(patch.isCategory, existingRow.is_category)
  const isFinished = resolveBooleanFlagForUpdate(patch.isFinished, existingRow.is_finished)
  const isMinor = resolveBooleanFlagForUpdate(patch.isMinor, existingRow.is_minor)
  const isDead = resolveBooleanFlagForUpdate(patch.isDead, existingRow.is_dead)
  return {
    isCategory,
    isDead,
    isFinished,
    isMinor
  }
}

export function resolveFaProjectDocumentBooleanFlagsForCreateInput (
  input: I_faProjectDocumentCreateInput
): ReturnType<typeof resolveFaProjectDocumentBooleanFlagsForCreate> {
  return resolveFaProjectDocumentBooleanFlagsForCreate(input)
}
