import type { T_injectedResultFromThrowable } from 'app/types/I_injectedNeverthrow'
import type { I_computedRef, I_ref, I_vueComponentPublicInstance } from 'app/types/I_vueCompositionShims'

import type {
  I_dialogKeybindSettingsRow,
  T_createDialogKeybindSettingsCaptureResult,
  T_dialogKeybindCaptureActionDeps,
  T_dialogKeybindCaptureKeydownDeps,
  T_dialogKeybindCaptureRefsBundle
} from 'app/types/I_dialogKeybindSettings'
import type {
  I_faChordSerialized,
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

export type T_dialogKeybindSettingsCaptureFactoryDeps = {
  bindOnCaptureClear: (
    actionDeps: T_dialogKeybindCaptureActionDeps
  ) => () => void
  bindOnCaptureSet: (actionDeps: T_dialogKeybindCaptureActionDeps) => () => void
  bindOnOpenCapture: (actionDeps: T_dialogKeybindCaptureActionDeps) => (
    row: I_dialogKeybindSettingsRow
  ) => void
  buildDialogKeybindCaptureActionDeps: (params: {
    handleCaptureKeydown: (e: KeyboardEvent) => void
    platform: I_computedRef<NodeJS.Platform>
    refs: T_dialogKeybindCaptureRefsBundle
    removeCaptureListener: () => void
    t: (key: string) => string
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }) => T_dialogKeybindCaptureActionDeps
  createDialogKeybindCaptureRefs: () => T_dialogKeybindCaptureRefsBundle
  makeDialogKeybindCaptureKeydownHandler: (
    keydownDeps: T_dialogKeybindCaptureKeydownDeps
  ) => (e: KeyboardEvent) => void
  registerDialogKeybindCaptureOpenWatch: (params: {
    captureActionName: I_ref<string>
    captureOpen: I_ref<boolean>
    editingCommandId: I_ref<T_faKeybindCommandId | null>
    removeCaptureListener: () => void
  }) => void
  removeKeydownListener: (handler: (e: KeyboardEvent) => void) => void
}

export type T_dialogKeybindSettingsCaptureKeydownFactoryDeps = {
  faKeybindFindChordConflict: (params: {
    chord: I_faChordSerialized
    excludeCommandId: T_faKeybindCommandId
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
  }) => T_faKeybindCommandId | null
  faKeybindTryChordFromEvent: (event: KeyboardEvent) => {
    ok: true
    chord: I_faChordSerialized
  } | {
    ok: false
    reason: 'modifier_key_alone' | 'need_modifier' | 'unsupported_key'
  }
  formatFaKeybindChordForUi: (chord: I_faChordSerialized, platform: NodeJS.Platform) => string
}

export type T_dialogKeybindSettingsCaptureHandlersFactoryDeps =
  T_dialogKeybindSettingsCaptureKeydownFactoryDeps & {
    addKeydownListener: (handler: (e: KeyboardEvent) => void) => void
  }

export interface I_dialogKeybindSettingsComponentStoreLike {
  dialogToOpen?: unknown | undefined
  dialogUUID?: unknown | undefined
}

export type T_dialogKeybindSettingsDialogOpenFactoryDeps = {
  refreshKeybindsAsync: (
    refresh: () => Promise<unknown>,
    onError: (error: unknown) => unknown
  ) => {
    match: (
      onOk: () => void,
      onErr: (error: unknown) => void
    ) => void
  }
  reportFaBridgeLoadFailure: (message: string) => void
  translateKeybindLoadError: () => string
}

export type T_dialogKeybindSettingsDialogRoutingFactoryDeps =
  T_dialogKeybindSettingsDialogOpenFactoryDeps & {
    computed: <T>(getter: () => T) => I_computedRef<T>
    formatFaKeybindChordForUi: (chord: I_faChordSerialized, platform: NodeJS.Platform) => string
    fromThrowable: T_injectedResultFromThrowable
    getDialogComponentStore: () => I_dialogKeybindSettingsComponentStoreLike
    onMounted: (hook: () => void) => void
    watch: (
      source: (() => unknown) | I_ref<unknown>,
      effect: (value: unknown, oldValue?: unknown) => void,
      options?: { immediate?: boolean } | undefined
    ) => void
  }

export type T_dialogKeybindSettingsDialogSuspendFactoryDeps = {
  getKeybindsStore: () => {
    setSuspendGlobalKeybindDispatch: (active: boolean) => void
  }
  onUnmounted: (hook: () => void) => void
  watch: (
    source: () => boolean,
    effect: (active: boolean) => void,
    options?: { immediate?: boolean } | undefined
  ) => void
}

export type T_createDialogKeybindSettingsDialogWiringFactoryDeps =
  T_dialogKeybindSettingsDialogRoutingFactoryDeps &
  T_dialogKeybindSettingsDialogSuspendFactoryDeps

export type T_dialogKeybindSettingsDialogWiringApi = {
  registerDialogKeybindSettingsGlobalSuspend: (params: {
    captureOpen: I_ref<boolean>
    dialogModel: I_ref<boolean>
  }) => void
  runDialogKeybindSettingsOpen: (params: {
    dialogModel: I_ref<boolean>
    documentName: I_ref<T_dialogName>
    initializeForOpen: () => void
    keybindsStore: {
      refreshKeybinds: () => Promise<unknown>
    }
  }) => void
  setupDialogKeybindSettingsDialogRouting: (params: {
    dialogModel: I_ref<boolean>
    documentName: I_ref<T_dialogName>
    initializeForOpen: () => void
    keybindsStore: {
      refreshKeybinds: () => Promise<unknown>
      snapshot: { platform: NodeJS.Platform } | null
    }
    onSaveMain: () => Promise<boolean>
    props: { directInput?: T_dialogName | undefined }
  }) => {
    formatChord: (chord: I_faChordSerialized) => string
    saveMain: () => Promise<void>
  }
}

export type T_dialogKeybindSettingsDialogWiringFactoryBindings = {
  buildRegisterDialogKeybindSettingsGlobalSuspend: (
    wiringDeps: T_createDialogKeybindSettingsDialogWiringFactoryDeps,
    params: {
      captureOpen: I_ref<boolean>
      dialogModel: I_ref<boolean>
    }
  ) => void
  buildRunDialogKeybindSettingsOpen: (
    wiringDeps: T_createDialogKeybindSettingsDialogWiringFactoryDeps,
    params: {
      dialogModel: I_ref<boolean>
      documentName: I_ref<T_dialogName>
      initializeForOpen: () => void
      keybindsStore: {
        refreshKeybinds: () => Promise<unknown>
      }
    }
  ) => void
  buildSetupDialogKeybindSettingsDialogRouting: (
    wiringDeps: T_createDialogKeybindSettingsDialogWiringFactoryDeps,
    params: {
      dialogModel: I_ref<boolean>
      documentName: I_ref<T_dialogName>
      initializeForOpen: () => void
      keybindsStore: {
        refreshKeybinds: () => Promise<unknown>
        snapshot: { platform: NodeJS.Platform } | null
      }
      onSaveMain: () => Promise<boolean>
      props: { directInput?: T_dialogName | undefined }
    }
  ) => {
    formatChord: (chord: I_faChordSerialized) => string
    saveMain: () => Promise<void>
  }
  wiringDeps: T_createDialogKeybindSettingsDialogWiringFactoryDeps
}

export type T_dialogKeybindSettingsCaptureKeydownFactoryBindings = {
  keydownDeps: T_dialogKeybindSettingsCaptureKeydownFactoryDeps
  makeDialogKeybindCaptureKeydownHandler: (
    deps: T_dialogKeybindSettingsCaptureKeydownFactoryDeps,
    keydownDeps: T_dialogKeybindCaptureKeydownDeps
  ) => (e: KeyboardEvent) => void
  restorePendingChordAndLabelFromBaseline: (
    deps: T_dialogKeybindSettingsCaptureKeydownFactoryDeps,
    params: {
      captureBaselineChord: I_ref<I_faChordSerialized | null>
      captureLabel: I_ref<string>
      pendingChord: I_ref<I_faChordSerialized | null>
      platform: I_computedRef<NodeJS.Platform>
    }
  ) => void
  runDialogKeybindCaptureKeydown: (
    deps: T_dialogKeybindSettingsCaptureKeydownFactoryDeps,
    e: KeyboardEvent,
    keydownDeps: T_dialogKeybindCaptureKeydownDeps
  ) => void
}

export type T_dialogKeybindSettingsCaptureHandlersFactoryBindings = {
  bindOnCaptureClear: (
    actionDeps: Pick<T_dialogKeybindCaptureActionDeps, 'captureBaselineChord' | 'captureError' | 'captureErrorMessage' | 'captureInfoMessage' | 'captureLabel' | 'captureOpen' | 'editingCommandId' | 'pendingChord' | 'workingOverrides'>
  ) => () => void
  bindOnCaptureSet: (
    handlersDeps: T_dialogKeybindSettingsCaptureHandlersFactoryDeps,
    actionDeps: T_dialogKeybindCaptureActionDeps
  ) => () => void
  bindOnOpenCapture: (
    handlersDeps: T_dialogKeybindSettingsCaptureHandlersFactoryDeps,
    actionDeps: T_dialogKeybindCaptureActionDeps
  ) => (row: I_dialogKeybindSettingsRow) => void
  handlersDeps: T_dialogKeybindSettingsCaptureHandlersFactoryDeps
}

export type T_dialogKeybindSettingsCaptureFactoryBindings = {
  captureDeps: T_dialogKeybindSettingsCaptureFactoryDeps
  createDialogKeybindSettingsCaptureInstance: (
    deps: T_dialogKeybindSettingsCaptureFactoryDeps,
    params: {
      platform: I_computedRef<NodeJS.Platform>
      t: (key: string) => string
      workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
    }
  ) => T_createDialogKeybindSettingsCaptureResult
}

export type T_dialogKeybindSettingsSyncApi = {
  initializeForOpen: () => void
  onCloseMain: () => void
  onSaveMain: () => Promise<boolean>
  syncWorkingFromStore: () => void
}

export type T_useDialogKeybindSettingsResult = {
  captureActionName: I_ref<string>
  captureError: I_ref<boolean>
  captureErrorMessage: I_ref<string>
  captureInfoMessage: I_ref<string>
  captureLabel: I_ref<string>
  captureOpen: I_ref<boolean>
  filter: I_ref<string | null | undefined>
  initializeForOpen: () => void
  onCaptureClear: () => void
  onCaptureSet: () => void
  onCloseMain: () => void
  onOpenCapture: (row: I_dialogKeybindSettingsRow) => void
  onSaveMain: () => Promise<boolean>
  pendingChord: I_ref<I_faChordSerialized | null>
  tableColumns: I_computedRef<Array<{
    align: 'left'
    classes: string
    field: string
    label: string
    name: string
  }>>
  tableRows: I_computedRef<I_dialogKeybindSettingsRow[]>
  workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
}

export type T_dialogKeybindSettingsStateFactoryBindings = {
  createDialogKeybindSettingsStateBundle: (
    stateDeps: T_dialogKeybindSettingsStateFactoryDeps,
    t: (key: string) => string
  ) => {
    capture: T_createDialogKeybindSettingsCaptureResult
    filter: I_ref<string | null | undefined>
    sync: T_dialogKeybindSettingsSyncApi
    table: ReturnType<T_dialogKeybindSettingsStateFactoryDeps['createDialogKeybindSettingsTableState']>
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }
  createDialogKeybindSettingsSync: (
    stateDeps: T_dialogKeybindSettingsStateFactoryDeps,
    params: {
      filter: I_ref<string | null | undefined>
      keybindsStore: {
        snapshot: { store: { overrides: I_faKeybindsRoot['overrides'] } } | null
      }
      workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
    }
  ) => T_dialogKeybindSettingsSyncApi
  stateDeps: T_dialogKeybindSettingsStateFactoryDeps
  useDialogKeybindSettingsFromDeps: (
    stateDeps: T_dialogKeybindSettingsStateFactoryDeps
  ) => T_useDialogKeybindSettingsResult
}

export type T_dialogKeybindSettingsTableLayoutObserveFactoryBindings = {
  layoutObserveDeps: T_dialogKeybindSettingsTableLayoutObserveFactoryDeps
  resolveDialogKeybindSettingsBodySectionHTMLElement: (
    inst: I_vueComponentPublicInstance | null
  ) => HTMLElement | null
  useDialogKeybindSettingsTableChrome: (
    deps: T_dialogKeybindSettingsTableLayoutObserveFactoryDeps,
    dialogModel: I_ref<boolean>
  ) => {
    bodySectionRef: I_ref<I_vueComponentPublicInstance | null>
    dialogKeybindSettingsTableHeightStyle: I_computedRef<Record<string, string> | undefined>
  }
  useDialogKeybindSettingsTableLayout: (
    deps: T_dialogKeybindSettingsTableLayoutObserveFactoryDeps,
    args: {
      dialogModel: I_ref<boolean>
      getSectionElement: () => HTMLElement | null
    }
  ) => {
    tableMaxHeightPx: I_ref<number | null>
  }
}

export type T_useDialogKeybindSettingsViewResult = {
  bodySectionRef: I_ref<I_vueComponentPublicInstance | null>
  captureActionName: I_ref<string>
  captureError: I_ref<boolean>
  captureErrorMessage: I_ref<string>
  captureInfoMessage: I_ref<string>
  captureLabel: I_ref<string>
  captureOpen: I_ref<boolean>
  dialogKeybindSettingsTableHeightStyle: I_computedRef<Record<string, string> | undefined>
  dialogModel: I_ref<boolean>
  documentName: I_ref<T_dialogName>
  filter: I_ref<string | null | undefined>
  noDataShowsFilterMiss: I_computedRef<boolean>
  onCaptureClear: () => void
  onCaptureSet: () => void
  onCloseMain: () => void
  onOpenCapture: (row: I_dialogKeybindSettingsRow) => void
  pendingChord: I_ref<I_faChordSerialized | null>
  saveMain: () => Promise<void>
  tableColumns: I_computedRef<Array<{
    align: 'left'
    classes: string
    field: string
    label: string
    name: string
  }>>
  tableRows: I_computedRef<I_dialogKeybindSettingsRow[]>
  userKeybindButtonLabel: (row: I_dialogKeybindSettingsRow) => string
}

export type T_dialogKeybindSettingsViewFactoryBindings = {
  useDialogKeybindSettingsViewFromDeps: (
    deps: T_dialogKeybindSettingsViewFactoryDeps,
    props: { directInput?: T_dialogName | undefined }
  ) => T_useDialogKeybindSettingsViewResult
  viewDeps: T_dialogKeybindSettingsViewFactoryDeps
}

export type T_dialogKeybindSettingsStateSyncFactoryDeps = {
  runFaActionAwait: (
    id: 'saveKeybindSettings',
    payload: { overrides: I_faKeybindsRoot['overrides'] }
  ) => Promise<boolean>
}

export type T_dialogKeybindSettingsStateFactoryDeps =
  T_dialogKeybindSettingsStateSyncFactoryDeps & {
    computed: <T>(getter: () => T) => I_computedRef<T>
    createDialogKeybindSettingsCapture: (params: {
      platform: I_computedRef<NodeJS.Platform>
      t: (key: string) => string
      workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
    }) => T_createDialogKeybindSettingsCaptureResult
    createDialogKeybindSettingsTableState: (params: {
      filter: I_ref<string | null | undefined>
      platform: I_computedRef<NodeJS.Platform>
      t: (key: string) => string
      workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
    }) => {
      tableColumns: I_computedRef<Array<{
        align: 'left'
        classes: string
        field: string
        label: string
        name: string
      }>>
      tableRows: I_computedRef<I_dialogKeybindSettingsRow[]>
    }
    getKeybindsStore: () => {
      snapshot: { platform: NodeJS.Platform, store: { overrides: I_faKeybindsRoot['overrides'] } } | null
    }
    onUnmounted: (hook: () => void) => void
    ref: <T>(value: T) => I_ref<T>
    translate: (key: string) => string
  }

export type T_dialogKeybindTableLayoutRun = {
  generation: number
  getSectionElement: () => HTMLElement | null
  observer: ResizeObserver | null
  tableMaxHeightPx: I_ref<number | null>
}

export type T_dialogKeybindSettingsTableLayoutObserveFactoryDeps = {
  computeDialogKeybindSettingsTableMaxHeightPx: (
    sectionElement: HTMLElement,
    minPx?: number | undefined
  ) => number
  computed: <T>(getter: () => T) => I_computedRef<T>
  nextTick: () => Promise<void>
  onBeforeUnmount: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  watch: (
    source: () => boolean,
    effect: (open: boolean) => void | Promise<void>,
    options?: { immediate?: boolean } | undefined
  ) => void
}

export type T_dialogKeybindSettingsTableLayoutObserveApi = {
  resolveDialogKeybindSettingsBodySectionHTMLElement: (
    inst: I_vueComponentPublicInstance | null
  ) => HTMLElement | null
  useDialogKeybindSettingsTableChrome: (dialogModel: I_ref<boolean>) => {
    bodySectionRef: I_ref<I_vueComponentPublicInstance | null>
    dialogKeybindSettingsTableHeightStyle: I_computedRef<Record<string, string> | undefined>
  }
  useDialogKeybindSettingsTableLayout: (args: {
    dialogModel: I_ref<boolean>
    getSectionElement: () => HTMLElement | null
  }) => {
    tableMaxHeightPx: I_ref<number | null>
  }
}

export type T_dialogKeybindSettingsViewFactoryDeps = {
  computed: <T>(getter: () => T) => I_computedRef<T>
  dialogKeybindSettingsNoDataSlotShowsFilterError: (filter: string | null | undefined) => boolean
  formatDialogKeybindSettingsUserKeybindButtonLabel: (
    row: I_dialogKeybindSettingsRow,
    helpers: {
      formatChord: (chord: I_faChordSerialized) => string
      t: (key: string) => string
    }
  ) => string
  getKeybindsStore: () => {
    refreshKeybinds: () => Promise<unknown>
    snapshot: { platform: NodeJS.Platform } | null
  }
  ref: <T>(value: T) => I_ref<T>
  registerComponentDialogStackGuard: (dialogModel: I_ref<boolean>) => void
  registerDialogKeybindSettingsGlobalSuspend: (params: {
    captureOpen: I_ref<boolean>
    dialogModel: I_ref<boolean>
  }) => void
  setupDialogKeybindSettingsDialogRouting: (params: {
    dialogModel: I_ref<boolean>
    documentName: I_ref<T_dialogName>
    initializeForOpen: () => void
    keybindsStore: {
      refreshKeybinds: () => Promise<unknown>
      snapshot: { platform: NodeJS.Platform } | null
    }
    onSaveMain: () => Promise<boolean>
    props: { directInput?: T_dialogName | undefined }
  }) => {
    formatChord: (chord: I_faChordSerialized) => string
    saveMain: () => Promise<void>
  }
  translate: (key: string) => string
  useDialogKeybindSettings: () => {
    captureOpen: I_ref<boolean>
    filter: I_ref<string | null | undefined>
    initializeForOpen: () => void
    onCaptureClear: () => void
    onCaptureSet: () => void
    onCloseMain: () => void
    onOpenCapture: (row: I_dialogKeybindSettingsRow) => void
    onSaveMain: () => Promise<boolean>
    captureActionName: I_ref<string>
    captureError: I_ref<boolean>
    captureErrorMessage: I_ref<string>
    captureInfoMessage: I_ref<string>
    captureLabel: I_ref<string>
    pendingChord: I_ref<I_faChordSerialized | null>
    tableColumns: I_computedRef<Array<{
      align: 'left'
      classes: string
      field: string
      label: string
      name: string
    }>>
    tableRows: I_computedRef<I_dialogKeybindSettingsRow[]>
  }
  useDialogKeybindSettingsTableChrome: (dialogModel: I_ref<boolean>) => {
    bodySectionRef: I_ref<I_vueComponentPublicInstance | null>
    dialogKeybindSettingsTableHeightStyle: I_computedRef<Record<string, string> | undefined>
  }
}
