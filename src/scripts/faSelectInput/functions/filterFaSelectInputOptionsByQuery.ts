import type {
  I_faSelectInputObjectItem,
  T_faSelectInputOption
} from 'app/types/I_faSelectInput'

/**
 * Case-insensitive substring filter for FaSelectInput options.
 * Simple options match the string; object options match name (and id as fallback).
 */
export function filterFaSelectInputOptionsByQuery (
  needle: string,
  items: readonly T_faSelectInputOption[]
): T_faSelectInputOption[] {
  const trimmed = needle.trim().toLowerCase()
  if (trimmed.length === 0) {
    return [...items]
  }

  return items.filter((item) => {
    if (typeof item === 'string') {
      return item.toLowerCase().includes(trimmed)
    }

    const nameMatch = item.name.toLowerCase().includes(trimmed)
    if (nameMatch) {
      return true
    }

    return item.id.toLowerCase().includes(trimmed)
  })
}

/**
 * True when option is an object select item (not a simple string).
 */
export function isFaSelectInputObjectItem (
  item: T_faSelectInputOption
): item is I_faSelectInputObjectItem {
  return typeof item !== 'string'
}
