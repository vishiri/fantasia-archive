import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch
} from 'vue'
import { Result, ResultAsync } from 'neverthrow'

import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
  scheduleFaFloatingWindowDelayedHide,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist
} from 'app/src/scripts/floatingWindows/floatingWindows_manager'
import * as faThemeModule from 'app/src/scripts/faTheme/faTheme_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import * as dialogStoreModule from 'src/stores/S_Dialog'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import { buildFaColorVarSwatchStyle } from './functions/faColorVarSwatchStyle'
import { buildMonacoKeybindHelpItems } from './functions/windowAppStylingMonacoKeybindHelpItems'
import { reconcileMountedMonacoWithWorkingCss } from './functions/windowStylingMonacoReconcile'
import { createWindowAppStyling } from './functions/createWindowAppStyling'

const windowAppStylingApi = createWindowAppStyling({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
  Result,
  ResultAsync,
  S_DialogComponent: () => dialogStoreModule.S_DialogComponent(),
  buildFaColorVarSwatchStyle,
  buildMonacoKeybindHelpItems,
  computed,
  getFaAppStylingStore: () => S_FaAppStyling() as import('app/types/I_faStylingWindowStoreFacade').I_faAppStylingStylingWindowStore,
  getFaColorCustomPropertyNamesForHelpPanel: () =>
    faThemeModule.getFaColorCustomPropertyNamesForHelpPanel(),
  getFaKeybindsStore: () => S_FaKeybinds(),
  loadMonacoModule: () => import('app/src/scripts/floatingWindows/windowStylingCssMonaco_manager'),
  nextTick,
  onBeforeUnmount,
  onMounted,
  reconcileMountedMonacoWithWorkingCss,
  ref,
  runFaActionAwait,
  scheduleFaFloatingWindowDelayedHide,
  shallowRef,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  watch
})

export const getMonacoKeybindHelpItems = windowAppStylingApi.getMonacoKeybindHelpItems

export const useMonacoMount = windowAppStylingApi.useMonacoMount

export const wireAppStylingPersistedCssIntoOpenEditor = windowAppStylingApi.wireAppStylingPersistedCssIntoOpenEditor

export const useWindowAppStyling = windowAppStylingApi.useWindowAppStyling

export const useWindowAppStylingFramePersist = windowAppStylingApi.useWindowAppStylingFramePersist

export const useWindowAppStylingHelpMenu = windowAppStylingApi.useWindowAppStylingHelpMenu

export const useWindowAppStylingHelpPanel = windowAppStylingApi.useWindowAppStylingHelpPanel

export const useWindowAppStylingSurface = windowAppStylingApi.useWindowAppStylingSurface

export { reconcileMountedMonacoWithWorkingCss } from './functions/windowStylingMonacoReconcile'
