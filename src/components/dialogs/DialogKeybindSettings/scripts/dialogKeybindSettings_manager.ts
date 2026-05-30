import { i18n } from 'app/i18n/externalFileLoader'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import {
  buildDialogKeybindSettingsRows,
  buildDialogKeybindSettingsTableColumns
} from './dialogKeybindSettingsTableBuild_manager'
import { faKeybindFindChordConflict } from 'app/src/scripts/keybinds/faKeybindsChordDisplayAndConflict_manager'
import {
  faKeybindTryChordFromEvent
} from 'app/src/scripts/keybinds/faKeybindsChordFromEvent_manager'
import { formatFaKeybindChordForUi } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting_manager'
import {
  registerComponentDialogStackGuard
} from 'app/src/scripts/appGlobalManagementUI/dialogManagement_manager'
import { reportFaBridgeLoadFailure } from 'app/src/scripts/stores/stores_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'
import { S_FaKeybinds } from 'src/stores/S_FaKeybinds'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue'
import { Result } from 'neverthrow'
import { ResultAsync } from 'neverthrow'

import { dialogKeybindSettingsNoDataSlotShowsFilterError } from './functions/dialogKeybindSettingsNoDataSlotFilterUi'
import { formatDialogKeybindSettingsUserKeybindButtonLabel } from './functions/dialogKeybindSettingsUserKeybindLabel'
import { createDialogKeybindSettingsCapture as createDialogKeybindSettingsCaptureFactory } from './functions/createDialogKeybindSettingsCapture'
import { createDialogKeybindSettingsCaptureFieldDisplay } from './functions/createDialogKeybindSettingsCaptureFieldDisplay'
import { createDialogKeybindSettingsCaptureHandlers } from './functions/createDialogKeybindSettingsCaptureHandlers'
import { createDialogKeybindSettingsCaptureInfrastructure } from './functions/createDialogKeybindSettingsCaptureInfrastructure'
import { createDialogKeybindSettingsCaptureKeydown } from './functions/createDialogKeybindSettingsCaptureKeydown'
import { createDialogKeybindSettingsDialogWiring } from './functions/createDialogKeybindSettingsDialogWiring'
import { createDialogKeybindSettingsState as createDialogKeybindSettingsStateFactory } from './functions/createDialogKeybindSettingsState'
import { createDialogKeybindSettingsTable } from './functions/createDialogKeybindSettingsTable'
import { createDialogKeybindSettingsTableLayoutObserve } from './functions/createDialogKeybindSettingsTableLayoutObserve'
import { createDialogKeybindSettingsTableLayoutSizing } from './functions/createDialogKeybindSettingsTableLayoutSizing'
import { createDialogKeybindSettingsView } from './functions/createDialogKeybindSettingsView'
import { createDialogKeybindSettingsCaptureInstance } from './dialogKeybindSettingsCapture'
import {
  bindOnCaptureClear as bindOnCaptureClearImpl,
  bindOnCaptureSet as bindOnCaptureSetImpl,
  bindOnOpenCapture as bindOnOpenCaptureImpl
} from './dialogKeybindSettingsCaptureHandlers'
import {
  makeDialogKeybindCaptureKeydownHandler as makeDialogKeybindCaptureKeydownHandlerImpl,
  restorePendingChordAndLabelFromBaseline as restorePendingChordAndLabelFromBaselineImpl,
  runDialogKeybindCaptureKeydown as runDialogKeybindCaptureKeydownImpl
} from './dialogKeybindSettingsCaptureKeydown'
import {
  registerDialogKeybindSettingsGlobalSuspend as registerDialogKeybindSettingsGlobalSuspendImpl,
  runDialogKeybindSettingsOpen as runDialogKeybindSettingsOpenImpl
} from './dialogKeybindSettingsDialogOpenSuspend'
import { setupDialogKeybindSettingsDialogRouting as setupDialogKeybindSettingsDialogRoutingImpl } from './dialogKeybindSettingsDialogRouting'
import {
  createDialogKeybindSettingsStateBundle,
  createDialogKeybindSettingsSync as createDialogKeybindSettingsSyncImpl,
  useDialogKeybindSettingsFromDeps
} from './dialogKeybindSettingsState'
import {
  resolveDialogKeybindSettingsBodySectionHTMLElement as resolveDialogKeybindSettingsBodySectionHTMLElementImpl,
  useDialogKeybindSettingsTableChrome as useDialogKeybindSettingsTableChromeImpl,
  useDialogKeybindSettingsTableLayout as useDialogKeybindSettingsTableLayoutImpl
} from './dialogKeybindSettingsTableLayoutObserve'
import { useDialogKeybindSettingsViewFromDeps } from './dialogKeybindSettingsView'

const dialogKeybindSettingsTableLayoutSizingApi = createDialogKeybindSettingsTableLayoutSizing()

const dialogKeybindSettingsTableLayoutObserveDeps = {
  computeDialogKeybindSettingsTableMaxHeightPx:
    dialogKeybindSettingsTableLayoutSizingApi.computeDialogKeybindSettingsTableMaxHeightPx,
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch
}

const dialogKeybindSettingsTableLayoutObserveApi = createDialogKeybindSettingsTableLayoutObserve({
  layoutObserveDeps: dialogKeybindSettingsTableLayoutObserveDeps,
  resolveDialogKeybindSettingsBodySectionHTMLElement:
    resolveDialogKeybindSettingsBodySectionHTMLElementImpl,
  useDialogKeybindSettingsTableChrome: useDialogKeybindSettingsTableChromeImpl,
  useDialogKeybindSettingsTableLayout: useDialogKeybindSettingsTableLayoutImpl
})

const dialogKeybindSettingsCaptureKeydownDeps = {
  faKeybindFindChordConflict,
  faKeybindTryChordFromEvent,
  formatFaKeybindChordForUi
}

const dialogKeybindSettingsCaptureKeydownApi = createDialogKeybindSettingsCaptureKeydown({
  keydownDeps: dialogKeybindSettingsCaptureKeydownDeps,
  makeDialogKeybindCaptureKeydownHandler: makeDialogKeybindCaptureKeydownHandlerImpl,
  restorePendingChordAndLabelFromBaseline: restorePendingChordAndLabelFromBaselineImpl,
  runDialogKeybindCaptureKeydown: runDialogKeybindCaptureKeydownImpl
})

const dialogKeybindSettingsCaptureHandlersDeps = {
  addKeydownListener: (handler: (e: KeyboardEvent) => void) => {
    window.addEventListener('keydown', handler, true)
  },
  faKeybindFindChordConflict,
  faKeybindTryChordFromEvent,
  formatFaKeybindChordForUi
}

const dialogKeybindSettingsCaptureHandlersApi = createDialogKeybindSettingsCaptureHandlers({
  bindOnCaptureClear: bindOnCaptureClearImpl,
  bindOnCaptureSet: bindOnCaptureSetImpl,
  bindOnOpenCapture: bindOnOpenCaptureImpl,
  handlersDeps: dialogKeybindSettingsCaptureHandlersDeps
})

const dialogKeybindSettingsCaptureInfrastructureApi = createDialogKeybindSettingsCaptureInfrastructure({
  ref,
  watch
})

const dialogKeybindSettingsCaptureFactoryDeps = {
  bindOnCaptureClear: dialogKeybindSettingsCaptureHandlersApi.bindOnCaptureClear,
  bindOnCaptureSet: dialogKeybindSettingsCaptureHandlersApi.bindOnCaptureSet,
  bindOnOpenCapture: dialogKeybindSettingsCaptureHandlersApi.bindOnOpenCapture,
  buildDialogKeybindCaptureActionDeps:
    dialogKeybindSettingsCaptureInfrastructureApi.buildDialogKeybindCaptureActionDeps,
  createDialogKeybindCaptureRefs:
    dialogKeybindSettingsCaptureInfrastructureApi.createDialogKeybindCaptureRefs,
  makeDialogKeybindCaptureKeydownHandler:
    dialogKeybindSettingsCaptureKeydownApi.makeDialogKeybindCaptureKeydownHandler,
  registerDialogKeybindCaptureOpenWatch:
    dialogKeybindSettingsCaptureInfrastructureApi.registerDialogKeybindCaptureOpenWatch,
  removeKeydownListener: (handler: (e: KeyboardEvent) => void) => {
    window.removeEventListener('keydown', handler, true)
  }
}

const dialogKeybindSettingsCaptureFactoryApi = createDialogKeybindSettingsCaptureFactory({
  captureDeps: dialogKeybindSettingsCaptureFactoryDeps,
  createDialogKeybindSettingsCaptureInstance
})

const dialogKeybindSettingsCaptureApi =
  dialogKeybindSettingsCaptureFactoryApi.createDialogKeybindSettingsCapture

const dialogKeybindSettingsTableApi = createDialogKeybindSettingsTable({
  buildDialogKeybindSettingsRows,
  buildDialogKeybindSettingsTableColumns,
  computed
})

const dialogKeybindSettingsStateDeps = {
  computed,
  createDialogKeybindSettingsCapture: dialogKeybindSettingsCaptureApi,
  createDialogKeybindSettingsTableState:
    dialogKeybindSettingsTableApi.createDialogKeybindSettingsTableState,
  getKeybindsStore: () => S_FaKeybinds(),
  onUnmounted,
  ref,
  runFaActionAwait,
  translate: (key: string) => i18n.global.t(key)
}

const dialogKeybindSettingsStateApi = createDialogKeybindSettingsStateFactory({
  createDialogKeybindSettingsStateBundle,
  createDialogKeybindSettingsSync: createDialogKeybindSettingsSyncImpl,
  stateDeps: dialogKeybindSettingsStateDeps,
  useDialogKeybindSettingsFromDeps
})

const dialogKeybindSettingsDialogWiringDeps = {
  computed,
  formatFaKeybindChordForUi,
  fromThrowable: Result.fromThrowable,
  getDialogComponentStore: () => S_DialogComponent(),
  getKeybindsStore: () => S_FaKeybinds(),
  onMounted,
  onUnmounted,
  refreshKeybindsAsync: (refresh: () => Promise<unknown>, onError: (error: unknown) => unknown) =>
    ResultAsync.fromPromise(refresh(), onError),
  reportFaBridgeLoadFailure,
  translateKeybindLoadError: () => i18n.global.t('globalFunctionality.faKeybinds.loadError'),
  watch
}

const dialogKeybindSettingsDialogWiringApi = createDialogKeybindSettingsDialogWiring({
  buildRegisterDialogKeybindSettingsGlobalSuspend: registerDialogKeybindSettingsGlobalSuspendImpl,
  buildRunDialogKeybindSettingsOpen: runDialogKeybindSettingsOpenImpl,
  buildSetupDialogKeybindSettingsDialogRouting: setupDialogKeybindSettingsDialogRoutingImpl,
  wiringDeps: dialogKeybindSettingsDialogWiringDeps
})

const dialogKeybindSettingsViewDeps = {
  computed,
  dialogKeybindSettingsNoDataSlotShowsFilterError,
  formatDialogKeybindSettingsUserKeybindButtonLabel,
  getKeybindsStore: () => S_FaKeybinds(),
  ref,
  registerComponentDialogStackGuard,
  registerDialogKeybindSettingsGlobalSuspend:
    dialogKeybindSettingsDialogWiringApi.registerDialogKeybindSettingsGlobalSuspend,
  setupDialogKeybindSettingsDialogRouting:
    dialogKeybindSettingsDialogWiringApi.setupDialogKeybindSettingsDialogRouting,
  translate: (key: string) => i18n.global.t(key),
  useDialogKeybindSettings: dialogKeybindSettingsStateApi.useDialogKeybindSettings,
  useDialogKeybindSettingsTableChrome:
    dialogKeybindSettingsTableLayoutObserveApi.useDialogKeybindSettingsTableChrome
}

const dialogKeybindSettingsViewApi = createDialogKeybindSettingsView({
  useDialogKeybindSettingsViewFromDeps,
  viewDeps: dialogKeybindSettingsViewDeps
})

const dialogKeybindSettingsCaptureFieldDisplayApi = createDialogKeybindSettingsCaptureFieldDisplay({
  computed
})

export const DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX =
  dialogKeybindSettingsTableLayoutSizingApi.DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX

export const parseCssLengthPx = dialogKeybindSettingsTableLayoutSizingApi.parseCssLengthPx

export const readVerticalPaddingPx = dialogKeybindSettingsTableLayoutSizingApi.readVerticalPaddingPx

export const computeDialogKeybindSettingsTableMaxHeightPx =
  dialogKeybindSettingsTableLayoutSizingApi.computeDialogKeybindSettingsTableMaxHeightPx

export const resolveDialogKeybindSettingsBodySectionHTMLElement =
  dialogKeybindSettingsTableLayoutObserveApi.resolveDialogKeybindSettingsBodySectionHTMLElement

export const useDialogKeybindSettingsTableLayout =
  dialogKeybindSettingsTableLayoutObserveApi.useDialogKeybindSettingsTableLayout

export const useDialogKeybindSettingsTableChrome =
  dialogKeybindSettingsTableLayoutObserveApi.useDialogKeybindSettingsTableChrome

export const restorePendingChordAndLabelFromBaseline =
  dialogKeybindSettingsCaptureKeydownApi.restorePendingChordAndLabelFromBaseline

export const runDialogKeybindCaptureKeydown =
  dialogKeybindSettingsCaptureKeydownApi.runDialogKeybindCaptureKeydown

export const makeDialogKeybindCaptureKeydownHandler =
  dialogKeybindSettingsCaptureKeydownApi.makeDialogKeybindCaptureKeydownHandler

export const bindOnOpenCapture = dialogKeybindSettingsCaptureHandlersApi.bindOnOpenCapture

export const bindOnCaptureClear = dialogKeybindSettingsCaptureHandlersApi.bindOnCaptureClear

export const bindOnCaptureSet = dialogKeybindSettingsCaptureHandlersApi.bindOnCaptureSet

export const createDialogKeybindCaptureRefs =
  dialogKeybindSettingsCaptureInfrastructureApi.createDialogKeybindCaptureRefs

export const registerDialogKeybindCaptureOpenWatch =
  dialogKeybindSettingsCaptureInfrastructureApi.registerDialogKeybindCaptureOpenWatch

export const buildDialogKeybindCaptureActionDeps =
  dialogKeybindSettingsCaptureInfrastructureApi.buildDialogKeybindCaptureActionDeps

export const createDialogKeybindSettingsCapture = dialogKeybindSettingsCaptureApi

export const DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS =
  dialogKeybindSettingsCaptureFieldDisplayApi.DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS

export const useDialogKeybindSettingsCaptureFieldDisplay =
  dialogKeybindSettingsCaptureFieldDisplayApi.useDialogKeybindSettingsCaptureFieldDisplay

export const createDialogKeybindSettingsTableState =
  dialogKeybindSettingsTableApi.createDialogKeybindSettingsTableState

export const setupDialogKeybindSettingsDialogRouting =
  dialogKeybindSettingsDialogWiringApi.setupDialogKeybindSettingsDialogRouting

export const registerDialogKeybindSettingsGlobalSuspend =
  dialogKeybindSettingsDialogWiringApi.registerDialogKeybindSettingsGlobalSuspend

export const createDialogKeybindSettingsSync =
  dialogKeybindSettingsStateApi.createDialogKeybindSettingsSync

export const createDialogKeybindSettingsState =
  dialogKeybindSettingsStateApi.createDialogKeybindSettingsState

export const useDialogKeybindSettings = dialogKeybindSettingsStateApi.useDialogKeybindSettings

export const runDialogKeybindSettingsOpen =
  dialogKeybindSettingsDialogWiringApi.runDialogKeybindSettingsOpen

export const useDialogKeybindSettingsView = dialogKeybindSettingsViewApi.useDialogKeybindSettingsView
