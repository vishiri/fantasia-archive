import { i18n } from 'app/i18n/externalFileLoader'

import type {
  I_appMenuItem,
  I_appMenuSubItem
} from 'app/types/I_appMenusDataList'

export function faMenuSeparator (itemKey: string): I_appMenuItem {
  return {
    itemKey,
    mode: 'separator'
  }
}

export function faMenuSubSeparator (itemKey: string): I_appMenuSubItem {
  return {
    itemKey,
    mode: 'separator'
  }
}

export function faMenuItem (
  textKey: string,
  icon: string,
  patch?: Partial<I_appMenuItem>
): I_appMenuItem {
  const text = i18n.global.t(textKey)
  const base: I_appMenuItem = {
    conditions: true,
    itemKey: textKey,
    mode: 'item',
    text
  }

  if (icon.length > 0) {
    base.icon = icon
  }
  if (patch === undefined) {
    return base
  }
  const merged: I_appMenuItem = {
    ...base,
    ...patch
  }
  return merged
}

export function faMenuSubItem (
  textKey: string,
  icon: string,
  patch?: Partial<I_appMenuSubItem>
): I_appMenuSubItem {
  const text = i18n.global.t(textKey)
  const base: I_appMenuSubItem = {
    conditions: true,
    itemKey: textKey,
    mode: 'item',
    text
  }

  if (icon.length > 0) {
    base.icon = icon
  }
  if (patch === undefined) {
    return base
  }
  const merged: I_appMenuSubItem = {
    ...base,
    ...patch
  }
  return merged
}
