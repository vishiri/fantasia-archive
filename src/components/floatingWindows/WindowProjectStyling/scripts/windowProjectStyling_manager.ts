import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'
import { Result } from 'neverthrow'
import debounce from 'lodash-es/debounce.js'

import {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
  scheduleFaFloatingWindowDelayedHide,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist
} from 'app/src/scripts/floatingWindows/floatingWindows_manager'
import * as faThemeModule from 'app/src/scripts/faTheme/faTheme_manager'
import {
  runFaAction,
  runFaActionAwait
} from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import * as dialogStoreModule from 'src/stores/S_Dialog'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import {
  getMonacoKeybindHelpItems,
  useMonacoMount,
  useWindowAppStylingHelpMenu
} from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStyling_manager'
import { buildFaColorVarSwatchStyle } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/functions/faColorVarSwatchStyle'
import { reconcileMountedMonacoWithWorkingCss } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/functions/windowStylingMonacoReconcile'
import { createWindowProjectStyling } from './functions/createWindowProjectStyling'

const windowProjectStylingApi = createWindowProjectStyling({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
  Result,
  S_DialogComponent: () => dialogStoreModule.S_DialogComponent(),
  buildFaColorVarSwatchStyle,
  computed,
  createDebounced: debounce,
  getFaActiveProjectStore: () => S_FaActiveProject(),
  getFaColorCustomPropertyNamesForHelpPanel: () =>
    faThemeModule.getFaColorCustomPropertyNamesForHelpPanel(),
  getFaProjectStylingStore: () => S_FaProjectStyling() as import('app/types/I_faStylingWindowStoreFacade').I_faProjectStylingStylingWindowStore,
  getMonacoKeybindHelpItems,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reconcileMountedMonacoWithWorkingCss,
  ref,
  runFaAction,
  runFaActionAwait,
  scheduleFaFloatingWindowDelayedHide,
  useFaFloatingWindowFrame,
  useFaFloatingWindowFramePersist,
  useMonacoMount,
  useWindowAppStylingHelpMenu,
  watch
})

export const readFaDialogComponentStoreOrNull = windowProjectStylingApi.readFaDialogComponentStoreOrNull

export const watchProjectStylingEditorCssLivePreview = windowProjectStylingApi.watchProjectStylingEditorCssLivePreview

export const wireProjectStylingPersistedCssIntoOpenEditor = windowProjectStylingApi.wireProjectStylingPersistedCssIntoOpenEditor

export const refreshPersistedProjectStylingAndCloseWindow = windowProjectStylingApi.refreshPersistedProjectStylingAndCloseWindow

export const clearProjectStylingLivePreviewAndRefreshFromKv = windowProjectStylingApi.clearProjectStylingLivePreviewAndRefreshFromKv

export const wireProjectStylingWindowOpenFromMenuAndProps = windowProjectStylingApi.wireProjectStylingWindowOpenFromMenuAndProps

export const registerProjectStylingWindowModelWatch = windowProjectStylingApi.registerProjectStylingWindowModelWatch

export const registerProjectStylingUnmount = windowProjectStylingApi.registerProjectStylingUnmount

export const registerProjectStylingActiveProjectWatch = windowProjectStylingApi.registerProjectStylingActiveProjectWatch

export const useWindowProjectStyling = windowProjectStylingApi.useWindowProjectStyling

export const useWindowProjectStylingCssPersist = windowProjectStylingApi.useWindowProjectStylingCssPersist

export const useWindowProjectStylingFramePersist = windowProjectStylingApi.useWindowProjectStylingFramePersist

export const useWindowProjectStylingHelpPanel = windowProjectStylingApi.useWindowProjectStylingHelpPanel

export const useWindowProjectStylingSurface = windowProjectStylingApi.useWindowProjectStylingSurface
