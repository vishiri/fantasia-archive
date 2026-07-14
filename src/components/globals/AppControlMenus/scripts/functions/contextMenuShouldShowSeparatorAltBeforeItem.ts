import type { I_appMenuItem, I_appMenuSubItem } from 'app/types/I_appMenusDataList'

/**
 * Hand-built row lists: show low-opacity separatorAlt before row index when not first and
 * previous row was not a full group separator.
 */
export function contextMenuShouldShowSeparatorAltBeforeIndex (
  itemIndex: number,
  previousRowIsGroupSeparator = false
): boolean {
  if (itemIndex === 0) {
    return false
  }
  if (previousRowIsGroupSeparator) {
    return false
  }
  return true
}

/**
 * AppControlSingleMenu data rows: separatorAlt before item when not first and previous row
 * is not mode separator.
 */
export function contextMenuShouldShowSeparatorAltBeforeItem (
  items: readonly (I_appMenuItem | I_appMenuSubItem)[] | undefined,
  itemIndex: number
): boolean {
  if (items === undefined) {
    return false
  }
  const previousRow = items[itemIndex - 1]
  const previousRowIsGroupSeparator = previousRow?.mode === 'separator'
  return contextMenuShouldShowSeparatorAltBeforeIndex(itemIndex, previousRowIsGroupSeparator)
}
