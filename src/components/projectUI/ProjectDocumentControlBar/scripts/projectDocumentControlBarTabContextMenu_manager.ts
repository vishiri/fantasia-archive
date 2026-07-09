import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  createAppControlSingleMenuSubmenuHover
} from 'app/src/components/globals/AppControlSingleMenu/scripts/appControlSingleMenu_manager'

import { createUseProjectDocumentControlBarTabContextMenu } from './createUseProjectDocumentControlBarTabContextMenu'

export const useProjectDocumentControlBarTabContextMenu = createUseProjectDocumentControlBarTabContextMenu({
  computed,
  createAppControlSingleMenuSubmenuHover,
  useI18n
})
