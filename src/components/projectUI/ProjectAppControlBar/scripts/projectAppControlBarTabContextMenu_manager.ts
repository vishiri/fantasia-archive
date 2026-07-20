import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  createAppControlSingleMenuSubmenuHover
} from 'app/src/components/globals/AppControlSingleMenu/scripts/appControlSingleMenu_manager'

import { createUseProjectAppControlBarTabContextMenu } from './createUseProjectAppControlBarTabContextMenu'

export const useProjectAppControlBarTabContextMenu = createUseProjectAppControlBarTabContextMenu({
  computed,
  createAppControlSingleMenuSubmenuHover,
  useI18n
})
