import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'

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
import { createWindowStylingFrame } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/createWindowStylingFrame'
import { createWindowStylingColorPanel } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingColorPanel'
import { createWindowStylingFrameLifecycle } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingFrameLifecycle'
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
import {
  buildFaColorVarSwatchStyle,
  getMonacoKeybindHelpItems,
  reconcileMountedMonacoWithWorkingCss,
  useMonacoMount,
  useWindowStylingHelpMenu
} from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/windowStylingShared_manager'
import {
  createUseWindowAppStylingSurface,
  createWindowAppStylingFramePersist
} from './functions/windowAppStylingSurfaceWiring'

const colorPanelApi = createWindowStylingColorPanel({
  computed,
  getFaColorCustomPropertyNamesForHelpPanel: () =>
    faThemeModule.getFaColorCustomPropertyNamesForHelpPanel(),
  getMonacoKeybindHelpItems,
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
  useWindowStylingHelpMenu,
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
  useMonacoMount,
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

export {
  getMonacoKeybindHelpItems,
  useMonacoMount,
  useWindowAppStyling,
  useWindowAppStylingFramePersist,
  useWindowAppStylingSurface
}

export const wireAppStylingPersistedCssIntoOpenEditor = wireStylingPersistedCssIntoOpenEditor

export const useWindowAppStylingHelpMenu = useWindowStylingHelpMenu

export const useWindowAppStylingHelpPanel = colorPanelApi.useWindowStylingHelpPanel

export { reconcileMountedMonacoWithWorkingCss }
