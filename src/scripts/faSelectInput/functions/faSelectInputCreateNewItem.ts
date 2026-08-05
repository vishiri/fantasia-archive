import type {
  I_faSelectInputObjectItem,
  T_faSelectInputMode
} from 'app/types/I_faSelectInput'

/**
 * Build a new select value from typed text (Enter / create-new).
 * Simple mode returns the trimmed string; object modes return UUID + isNew.
 */
export function createFaSelectInputNewItem (
  mode: T_faSelectInputMode,
  typedText: string,
  createId: () => string
): string | I_faSelectInputObjectItem | null {
  const name = typedText.trim()
  if (name.length === 0) {
    return null
  }

  if (mode === 'simple') {
    return name
  }

  if (mode !== 'document' && mode !== 'otherType' && mode !== 'tags') {
    return null
  }

  const item: I_faSelectInputObjectItem = {
    id: createId(),
    isNew: true,
    name
  }

  return item
}
