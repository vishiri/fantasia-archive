import type {
  I_faSelectInputObjectItem,
  T_faSelectInputMode,
  T_faSelectInputModelValue,
  T_faSelectInputOption,
  T_faSelectInputOptions
} from 'app/types/I_faSelectInput'

/**
 * Media mode is typed but not implemented; options stay empty.
 */
export function isFaSelectInputMediaModeStub (mode: T_faSelectInputMode): boolean {
  return mode === 'media'
}

/**
 * True for modes that store object items (id + name).
 */
export function isFaSelectInputObjectMode (mode: T_faSelectInputMode): boolean {
  return mode === 'document' || mode === 'otherType' || mode === 'tags'
}

/**
 * Normalize parent options for the active mode.
 * Media stub always yields []. Simple expects strings; object modes expect objects.
 */
export function normalizeFaSelectInputOptions (
  mode: T_faSelectInputMode,
  options: T_faSelectInputOptions
): T_faSelectInputOption[] {
  if (isFaSelectInputMediaModeStub(mode)) {
    return []
  }

  if (mode === 'simple') {
    return options.filter((item): item is string => typeof item === 'string')
  }

  return options.filter((item): item is I_faSelectInputObjectItem => typeof item !== 'string')
}

/**
 * Empty model for mode + multiple combination.
 */
export function createFaSelectInputEmptyModel (
  mode: T_faSelectInputMode,
  multiple: boolean
): T_faSelectInputModelValue {
  if (mode === 'simple') {
    return multiple ? [] : ''
  }

  if (multiple) {
    return [] as I_faSelectInputObjectItem[]
  }

  return null
}
