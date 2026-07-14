import { computed, ref } from 'vue'

import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/keybinds_manager'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import { createAppControlSingleMenu } from './functions/createAppControlSingleMenu'
import { contextMenuShouldShowSeparatorAltBeforeItem as appControlShouldShowSeparatorAltBeforeItem } from '../../AppControlMenus/scripts/functions/contextMenuShouldShowSeparatorAltBeforeItem'
import { resolveAppControlMenuItemColorClasses } from './functions/resolveAppControlMenuItemColorClasses'

const appControlSingleMenuApi = createAppControlSingleMenu({
  appControlShouldShowSeparatorAltBeforeItem,
  computed,
  formatFaKeybindCommandLabelFromSnapshot,
  getFaKeybindsStore: () => S_FaKeybinds(),
  ref
})

export const createAppControlSingleMenuSubmenuHover =
  appControlSingleMenuApi.createAppControlSingleMenuSubmenuHover

export const useAppControlSingleMenu = appControlSingleMenuApi.useAppControlSingleMenu

export const APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS =
  appControlSingleMenuApi.APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS

export { resolveAppControlMenuItemColorClasses }
