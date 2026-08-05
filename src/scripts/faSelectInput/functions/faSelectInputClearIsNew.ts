import type {
  I_faSelectInputObjectItem,
  T_faSelectInputModelValue
} from 'app/types/I_faSelectInput'

/**
 * Strip isNew from selected object items whose id is in ids.
 * Returns the same reference when nothing changes.
 */
export function clearFaSelectInputIsNewFlags (
  modelValue: T_faSelectInputModelValue,
  ids: readonly string[]
): T_faSelectInputModelValue {
  if (ids.length === 0) {
    return modelValue
  }

  const idSet = new Set(ids)

  if (Array.isArray(modelValue)) {
    if (modelValue.length === 0 || typeof modelValue[0] === 'string') {
      return modelValue
    }

    const objectItems = modelValue as I_faSelectInputObjectItem[]
    let didChange = false
    const nextItems = objectItems.map((item) => {
      if (!idSet.has(item.id) || item.isNew !== true) {
        return item
      }
      didChange = true
      return omitIsNewFromFaSelectInputObjectItem(item)
    })

    if (!didChange) {
      return modelValue
    }
    return nextItems
  }

  if (modelValue === null || typeof modelValue === 'string') {
    return modelValue
  }

  if (!idSet.has(modelValue.id) || modelValue.isNew !== true) {
    return modelValue
  }

  return omitIsNewFromFaSelectInputObjectItem(modelValue)
}

function omitIsNewFromFaSelectInputObjectItem (
  item: I_faSelectInputObjectItem
): I_faSelectInputObjectItem {
  const nextItem: I_faSelectInputObjectItem = {
    id: item.id,
    name: item.name
  }

  if (item.documentType !== undefined) {
    nextItem.documentType = item.documentType
  }
  if (item.icon !== undefined) {
    nextItem.icon = item.icon
  }
  if (item.otherType !== undefined) {
    nextItem.otherType = item.otherType
  }

  return nextItem
}
