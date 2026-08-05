import type {
  I_faSelectInputChangePayload,
  I_faSelectInputObjectItem,
  T_faSelectInputChangeAction,
  T_faSelectInputModelValue
} from 'app/types/I_faSelectInput'

/**
 * Classify model transition as add, remove, or replace for parent change events.
 */
export function resolveFaSelectInputChangeAction (
  previousValue: T_faSelectInputModelValue,
  nextValue: T_faSelectInputModelValue,
  multiple: boolean
): T_faSelectInputChangeAction {
  if (!multiple) {
    const previousEmpty = isFaSelectInputModelEmpty(previousValue)
    const nextEmpty = isFaSelectInputModelEmpty(nextValue)
    if (previousEmpty && !nextEmpty) {
      return 'add'
    }
    if (!previousEmpty && nextEmpty) {
      return 'remove'
    }
    return 'replace'
  }

  const previousCount = countFaSelectInputModelItems(previousValue)
  const nextCount = countFaSelectInputModelItems(nextValue)
  if (nextCount > previousCount) {
    return 'add'
  }
  if (nextCount < previousCount) {
    return 'remove'
  }
  return 'replace'
}

/**
 * Build change payload for emit.
 */
export function createFaSelectInputChangePayload (
  previousValue: T_faSelectInputModelValue,
  nextValue: T_faSelectInputModelValue,
  multiple: boolean
): I_faSelectInputChangePayload {
  const action = resolveFaSelectInputChangeAction(previousValue, nextValue, multiple)
  const payload: I_faSelectInputChangePayload = {
    action,
    value: nextValue
  }
  return payload
}

function isFaSelectInputModelEmpty (value: T_faSelectInputModelValue): boolean {
  if (value === null || value === '') {
    return true
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  return false
}

function countFaSelectInputModelItems (value: T_faSelectInputModelValue): number {
  if (Array.isArray(value)) {
    return value.length
  }
  if (value === null || value === '') {
    return 0
  }
  if (typeof value === 'string') {
    return 1
  }
  return 1
}

/**
 * Append a created item into the current model.
 */
export function appendFaSelectInputCreatedValue (
  modelValue: T_faSelectInputModelValue,
  created: string | I_faSelectInputObjectItem,
  multiple: boolean
): T_faSelectInputModelValue {
  if (!multiple) {
    return created
  }

  if (typeof created === 'string') {
    const previous = Array.isArray(modelValue)
      ? (modelValue as string[])
      : []
    if (previous.includes(created)) {
      return previous
    }
    return [...previous, created]
  }

  const previousObjects = Array.isArray(modelValue)
    ? (modelValue as I_faSelectInputObjectItem[])
    : []
  if (previousObjects.some((item) => item.id === created.id || item.name === created.name)) {
    return previousObjects
  }
  return [...previousObjects, created]
}
