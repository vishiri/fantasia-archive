import {
  onBeforeUnmount,
  ref,
  shallowRef
} from 'vue'
import { Result, ResultAsync } from 'neverthrow'

import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { FA_Q_TOOLTIP_DELAY_MS } from 'app/src/scripts/appGlobalManagementUI/functions/faQTooltipDelay'
import { buildMonacoKeybindHelpItems } from './functions/buildMonacoKeybindHelpItems'
import { createWindowStylingKeybindHelp } from './functions/windowStylingKeybindHelp'
import { createWindowStylingMonacoMount } from './functions/windowStylingMonacoMount'
import { buildFaColorVarSwatchStyle } from './functions/faColorVarSwatchStyle'
import { reconcileMountedMonacoWithWorkingCss } from './functions/windowStylingMonacoReconcile'

const monacoMountApi = createWindowStylingMonacoMount({
  Result,
  ResultAsync,
  loadMonacoModule: () => import('app/src/scripts/floatingWindows/windowStylingCssMonaco_manager'),
  onBeforeUnmount,
  shallowRef
})

const keybindHelpApi = createWindowStylingKeybindHelp({
  Result,
  buildMonacoKeybindHelpItems,
  faQTooltipDelayMs: FA_Q_TOOLTIP_DELAY_MS,
  getFaKeybindsStore: () => S_FaKeybinds(),
  onBeforeUnmount,
  ref
})

export const getMonacoKeybindHelpItems = keybindHelpApi.getMonacoKeybindHelpItems

export const useMonacoMount = monacoMountApi.useMonacoMount

export const useWindowStylingHelpMenu = keybindHelpApi.useWindowStylingHelpMenu

export {
  buildFaColorVarSwatchStyle,
  reconcileMountedMonacoWithWorkingCss
}
