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
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import * as dialogStoreModule from 'src/stores/S_Dialog'
import * as faThemeModule from 'app/src/scripts/faTheme/faTheme_manager'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { FA_Q_TOOLTIP_DELAY_MS } from 'app/src/scripts/appGlobalManagementUI/functions/faQTooltipDelay'
import { buildMonacoKeybindHelpItems } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/buildMonacoKeybindHelpItems'
import { createWindowStylingFrame } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/createWindowStylingFrame'
import { createWindowStylingColorPanel } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingColorPanel'
import { createWindowStylingFrameLifecycle } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingFrameLifecycle'
import { createWindowStylingKeybindHelp } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingKeybindHelp'
import { createWindowStylingMonacoMount } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingMonacoMount'
import { createWindowAppStylingUse } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingAppState'
import { createWindowStylingEditorSession } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingEditorSession'
import { createWireWindowStylingSession } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingSessionWiring'
import {
  createClearAppStylingLivePreviewAndRefreshFromDisk,
  createRefreshPersistedAppStylingAndCloseWindow
} from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingAppRefresh'
import {
  createReadFaDialogComponentStoreOrNull,
  createWatchStylingEditorCssLivePreview,
  createWireStylingPersistedCssIntoOpenEditor,
  createWireStylingWindowOpenFromMenuAndProps
} from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingPersistEffects'

import { buildFaColorVarSwatchStyle } from './functions/faColorVarSwatchStyle'
import { reconcileMountedMonacoWithWorkingCss } from './functions/windowStylingMonacoReconcile'
import {
  createUseWindowAppStylingSurface,
  createWindowAppStylingFramePersist
} from './functions/windowAppStylingSurfaceWiring'

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

const colorPanelApi = createWindowStylingColorPanel({
  computed,
  getFaColorCustomPropertyNamesForHelpPanel: () =>
    faThemeModule.getFaColorCustomPropertyNamesForHelpPanel(),
  getMonacoKeybindHelpItems: keybindHelpApi.getMonacoKeybindHelpItems,
  nextTick,
  ref,
  watch
})

const watchStylingEditorCssLivePreview = createWatchStylingEditorCssLivePreview({ watch })

const wireStylingPersistedCssIntoOpenEditor = createWireStylingPersistedCssIntoOpenEditor({ watch })

const wireStylingWindowOpenFromMenuAndProps = createWireStylingWindowOpenFromMenuAndProps({
  onMounted,
  readFaDialogComponentStoreOrNull: createReadFaDialogComponentStoreOrNull({
    S_DialogComponent: () => dialogStoreModule.S_DialogComponent()
  }),
  watch
})

const frameLifecycleApi = createWindowStylingFrameLifecycle({
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
  nextTick,
  onBeforeUnmount,
  scheduleFaFloatingWindowDelayedHide,
  watch
})

const useWindowAppStylingFramePersist = createWindowAppStylingFramePersist({
  getFaAppStylingStore: () => S_FaAppStyling() as import('app/types/I_faStylingWindowStoreFacade').I_faAppStylingStylingWindowStore,
  useFaFloatingWindowFramePersist
})

const stylingFrameApi = createWindowStylingFrame({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  buildFaColorVarSwatchStyle,
  computed,
  useFaFloatingWindowFrame,
  useWindowStylingFramePersist: useWindowAppStylingFramePersist,
  useWindowStylingHelpMenu: keybindHelpApi.useWindowStylingHelpMenu,
  useWindowStylingHelpPanel: colorPanelApi.useWindowStylingHelpPanel
})

const refreshPersistedAppStylingAndCloseWindow = createRefreshPersistedAppStylingAndCloseWindow({
  getFaAppStylingStore: () => S_FaAppStyling() as import('app/types/I_faStylingWindowStoreFacade').I_faAppStylingStylingWindowStore
})

const clearAppStylingLivePreviewAndRefreshFromDisk = createClearAppStylingLivePreviewAndRefreshFromDisk({
  getFaAppStylingStore: () => S_FaAppStyling() as import('app/types/I_faStylingWindowStoreFacade').I_faAppStylingStylingWindowStore
})

const useWindowAppStyling = createWindowAppStylingUse({
  clearAppStylingLivePreviewAndRefreshFromDisk,
  createWindowStylingEditorSession,
  getFaAppStylingStore: () => S_FaAppStyling() as import('app/types/I_faStylingWindowStoreFacade').I_faAppStylingStylingWindowStore,
  reconcileMountedMonacoWithWorkingCss,
  ref,
  refreshPersistedAppStylingAndCloseWindow,
  registerStylingUnmount: frameLifecycleApi.registerStylingUnmount,
  registerStylingWindowModelWatch: frameLifecycleApi.registerStylingWindowModelWatch,
  runFaActionAwait,
  useMonacoMount: monacoMountApi.useMonacoMount,
  watchStylingEditorCssLivePreview,
  wireStylingPersistedCssIntoOpenEditor,
  wireStylingWindowOpenFromMenuAndProps,
  wireWindowStylingSession: createWireWindowStylingSession
})

const useWindowAppStylingSurface = createUseWindowAppStylingSurface({
  getFaAppStylingStore: () => S_FaAppStyling(),
  useWindowAppStyling,
  useWindowStylingSurface: stylingFrameApi.useWindowStylingSurface
})

export const getMonacoKeybindHelpItems = keybindHelpApi.getMonacoKeybindHelpItems

export const useMonacoMount = monacoMountApi.useMonacoMount

export const wireAppStylingPersistedCssIntoOpenEditor = wireStylingPersistedCssIntoOpenEditor

export { useWindowAppStyling, useWindowAppStylingFramePersist, useWindowAppStylingSurface }

export const useWindowAppStylingHelpMenu = keybindHelpApi.useWindowStylingHelpMenu

export const useWindowAppStylingHelpPanel = colorPanelApi.useWindowStylingHelpPanel

export { reconcileMountedMonacoWithWorkingCss } from './functions/windowStylingMonacoReconcile'
