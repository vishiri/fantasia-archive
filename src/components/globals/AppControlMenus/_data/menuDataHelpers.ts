import { i18n } from 'app/i18n/externalFileLoader'

import type {
  I_appMenuItem,
  I_appMenuSubItem
} from 'app/types/I_appMenusDataList'

export function faMenuSeparator (): I_appMenuItem {
  return { mode: 'separator' }
}

export function faMenuSubSeparator (): I_appMenuSubItem {
  return { mode: 'separator' }
}

export function faMenuItem (
  textKey: string,
  icon: string,
  patch?: Partial<I_appMenuItem>
): I_appMenuItem {
  return {
    conditions: true,
    icon,
    mode: 'item',
    specialColor: undefined,
    submenu: undefined,
    text: i18n.global.t(textKey),
    trigger: undefined,
    triggerArguments: undefined,
    ...patch
  }
}

export function faMenuSubItem (
  textKey: string,
  icon: string,
  patch?: Partial<I_appMenuSubItem>
): I_appMenuSubItem {
  return {
    conditions: true,
    icon,
    mode: 'item',
    specialColor: undefined,
    text: i18n.global.t(textKey),
    trigger: undefined,
    triggerArguments: undefined,
    ...patch
  }
}
