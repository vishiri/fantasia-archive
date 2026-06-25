import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'
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
import { createWindowStylingFrame } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/createWindowStylingFrame'
import { createWindowStylingColorPanel } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingColorPanel'
import { createWindowStylingFrameLifecycle } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingFrameLifecycle'
import { createWindowProjectStylingUse } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingProjectState'
import { createWindowStylingEditorSession } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingEditorSession'
import { createWireWindowStylingSession } from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingSessionWiring'
import {
  createClearProjectStylingLivePreviewAndRefreshFromKv,
  createRefreshPersistedProjectStylingAndCloseWindow,
  createRegisterProjectStylingActiveProjectWatch,
  createWindowProjectStylingCssPersist
} from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingProjectPersist'
import {
  createReadFaDialogComponentStoreOrNull,
  createWatchStylingEditorCssLivePreview,
  createWireStylingPersistedCssIntoOpenEditor,
  createWireStylingWindowOpenFromMenuAndProps
} from 'app/src/components/floatingWindows/_sharedWindowStyling/scripts/functions/windowStylingPersistEffects'

import {
  getMonacoKeybindHelpItems,
  useMonacoMount,
  useWindowAppStylingHelpMenu
} from 'app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStyling_manager'
import { buildFaColorVarSwatchStyle } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/functions/faColorVarSwatchStyle'
import { reconcileMountedMonacoWithWorkingCss } from 'app/src/components/floatingWindows/WindowAppStyling/scripts/functions/windowStylingMonacoReconcile'
import {
  createUseWindowProjectStylingSurface,
  createWindowProjectStylingFramePersist,
  createGetFaProjectStylingStore
} from './functions/windowProjectStylingSurfaceWiring'
import {
  createRegisterProjectStylingUnmount,
  createWatchProjectStylingEditorCssLivePreview,
  createWireProjectStylingWindowOpenFromMenuAndProps
} from './functions/windowProjectStylingWiring'

const getFaProjectStylingStore = createGetFaProjectStylingStore({
  getStore: () => S_FaProjectStyling() as import('app/types/I_faStylingWindowStoreFacade').I_faProjectStylingStylingWindowStore
})

const readFaDialogComponentStoreOrNull = createReadFaDialogComponentStoreOrNull({
  S_DialogComponent: () => dialogStoreModule.S_DialogComponent()
})

const watchStylingEditorCssLivePreview = createWatchStylingEditorCssLivePreview({ watch })

const wireStylingPersistedCssIntoOpenEditor = createWireStylingPersistedCssIntoOpenEditor({ watch })

const wireStylingWindowOpenFromMenuAndProps = createWireStylingWindowOpenFromMenuAndProps({
  onMounted,
  readFaDialogComponentStoreOrNull,
  watch
})

const frameLifecycleApi = createWindowStylingFrameLifecycle({
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
  nextTick,
  onBeforeUnmount,
  scheduleFaFloatingWindowDelayedHide,
  watch
})

const clearProjectStylingLivePreviewAndRefreshFromKv = createClearProjectStylingLivePreviewAndRefreshFromKv({
  getFaProjectStylingStore
})

const refreshPersistedProjectStylingAndCloseWindow = createRefreshPersistedProjectStylingAndCloseWindow({
  getFaProjectStylingStore
})

const useWindowProjectStylingCssPersist = createWindowProjectStylingCssPersist({
  createDebounced: debounce,
  getFaProjectStylingStore,
  runFaAction,
  watch
})

const useWindowProjectStylingFramePersist = createWindowProjectStylingFramePersist({
  getFaProjectStylingStore,
  useFaFloatingWindowFramePersist
})

const colorPanelApi = createWindowStylingColorPanel({
  computed,
  getFaColorCustomPropertyNamesForHelpPanel: () =>
    faThemeModule.getFaColorCustomPropertyNamesForHelpPanel(),
  getMonacoKeybindHelpItems,
  nextTick,
  ref,
  watch
})

const stylingFrameApi = createWindowStylingFrame({
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
  FA_FLOATING_WINDOW_POP_TRANSITION_MS,
  buildFaColorVarSwatchStyle,
  computed,
  useFaFloatingWindowFrame,
  useWindowStylingFramePersist: useWindowProjectStylingFramePersist,
  useWindowStylingHelpMenu: useWindowAppStylingHelpMenu,
  useWindowStylingHelpPanel: colorPanelApi.useWindowStylingHelpPanel
})

const registerProjectStylingActiveProjectWatch = createRegisterProjectStylingActiveProjectWatch({
  getFaActiveProjectStore: () => S_FaActiveProject(),
  refreshPersistedProjectStylingAndCloseWindow,
  watch
})

const useWindowProjectStyling = createWindowProjectStylingUse({
  clearProjectStylingLivePreviewAndRefreshFromKv,
  createWindowStylingEditorSession,
  getFaProjectStylingStore,
  reconcileMountedMonacoWithWorkingCss,
  ref,
  refreshPersistedProjectStylingAndCloseWindow,
  registerProjectStylingActiveProjectWatch,
  registerStylingUnmount: frameLifecycleApi.registerStylingUnmount,
  registerStylingWindowModelWatch: frameLifecycleApi.registerStylingWindowModelWatch,
  runFaActionAwait,
  shouldSkipOpenWhenAlreadyVisible: true,
  useMonacoMount,
  watchStylingEditorCssLivePreview,
  wireStylingPersistedCssIntoOpenEditor,
  wireStylingWindowOpenFromMenuAndProps,
  wireWindowStylingSession: createWireWindowStylingSession
})

const useWindowProjectStylingSurface = createUseWindowProjectStylingSurface({
  getFaProjectStylingStore,
  useWindowProjectStyling,
  useWindowProjectStylingCssPersist,
  useWindowStylingSurface: stylingFrameApi.useWindowStylingSurface
})

const watchProjectStylingEditorCssLivePreview = createWatchProjectStylingEditorCssLivePreview({
  getFaProjectStylingStore,
  watchStylingEditorCssLivePreview
})

const wireProjectStylingWindowOpenFromMenuAndProps = createWireProjectStylingWindowOpenFromMenuAndProps({
  wireStylingWindowOpenFromMenuAndProps
})

const registerProjectStylingUnmount = createRegisterProjectStylingUnmount({
  clearProjectStylingLivePreviewAndRefreshFromKv,
  registerStylingUnmount: frameLifecycleApi.registerStylingUnmount
})

const registerProjectStylingWindowModelWatch = frameLifecycleApi.registerStylingWindowModelWatch

const useWindowProjectStylingHelpPanel = colorPanelApi.useWindowStylingHelpPanel

export {
  readFaDialogComponentStoreOrNull,
  watchProjectStylingEditorCssLivePreview,
  wireStylingPersistedCssIntoOpenEditor as wireProjectStylingPersistedCssIntoOpenEditor,
  refreshPersistedProjectStylingAndCloseWindow,
  clearProjectStylingLivePreviewAndRefreshFromKv,
  wireProjectStylingWindowOpenFromMenuAndProps,
  registerProjectStylingWindowModelWatch,
  registerProjectStylingUnmount,
  registerProjectStylingActiveProjectWatch,
  useWindowProjectStyling,
  useWindowProjectStylingCssPersist,
  useWindowProjectStylingFramePersist,
  useWindowProjectStylingHelpPanel,
  useWindowProjectStylingSurface
}

export { getMonacoKeybindHelpItems, useMonacoMount, useWindowAppStylingHelpMenu }
