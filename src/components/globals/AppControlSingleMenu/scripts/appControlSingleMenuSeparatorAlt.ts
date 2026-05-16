import type { I_appMenuItem, I_appMenuSubItem } from 'app/types/I_appMenusDataList'

export function appControlShouldShowSeparatorAltBeforeItem (
  items: readonly (I_appMenuItem | I_appMenuSubItem)[] | undefined,
  itemIndex: number
): boolean {
  if (items === undefined) {
    return false
  }
  if (itemIndex === 0) {
    return false
  }
  return items[itemIndex - 1]!.mode !== 'separator'
}
