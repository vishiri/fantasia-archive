import type { T_injectedResultFromThrowable } from 'app/types/I_injectedNeverthrow'
import type { ComputedRef, Ref } from 'vue'

import type {
  I_faChordSerialized,
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'
/**
 * One row in the Keybind settings table (command metadata + resolved user chord).
 */
export interface I_dialogKeybindSettingsRow {
  commandId: T_faKeybindCommandId
  defaultLabel: string
  editable: boolean
  nameLabel: string
  rowKey: string
  userChord: I_faChordSerialized | null | undefined

  /**
   * When true, the User keybinds column shows Add new… (effective shortcut matches built-in default or is unset).
   */
  userShowsAddNewCombo: boolean
}

/**
 * Props for the nested sheet used while capturing a replacement shortcut.
 */
export interface I_dialogKeybindSettingsCaptureDialogProps {
  actionName: string
  captureError: boolean
  captureErrorMessage: string
  captureInfoMessage: string
  captureLabel: string
  hasPendingChord: boolean
  modelValue: boolean
}

/**
 * Props for the inline capture control shown on a keybind row.
 */
export interface I_dialogKeybindSettingsCaptureFieldProps {
  captureError: boolean
  captureErrorMessage: string
  captureInfoMessage: string
  captureLabel: string
  statusRegionId: string
}

/**
 * Return shape of the DialogKeybindSettings capture composable (refs + handlers).
 */
/**
 * Full capture UI dependency bundle passed into open/clear/set binders and keydown wiring.
 */
export type T_dialogKeybindCaptureKeydownDeps = {
  captureBaselineChord: Ref<I_faChordSerialized | null>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  editingCommandId: Ref<T_faKeybindCommandId | null>
  pendingChord: Ref<I_faChordSerialized | null>
  platform: ComputedRef<NodeJS.Platform>
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}

export type T_dialogKeybindCaptureActionDeps = {
  captureActionName: Ref<string>
  captureBaselineChord: Ref<I_faChordSerialized | null>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  editingCommandId: Ref<T_faKeybindCommandId | null>
  handleCaptureKeydown: (e: KeyboardEvent) => void
  pendingChord: Ref<I_faChordSerialized | null>
  platform: ComputedRef<NodeJS.Platform>
  removeCaptureListener: () => void
  t: (key: string) => string
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}

export type T_dialogKeybindCaptureRefsBundle = {
  captureActionName: Ref<string>
  captureBaselineChord: Ref<I_faChordSerialized | null>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  editingCommandId: Ref<T_faKeybindCommandId | null>
  pendingChord: Ref<I_faChordSerialized | null>
}

export type T_createDialogKeybindSettingsCaptureResult = {
  captureActionName: Ref<string>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  onCaptureClear: () => void
  onCaptureSet: () => void
  onOpenCapture: (row: I_dialogKeybindSettingsRow) => void
  pendingChord: Ref<I_faChordSerialized | null>
  removeCaptureListener: () => void
}

/** Keydown capture helpers: conflict lookup, chord parsing, and UI formatting. */
export type T_dialogKeybindSettingsCaptureKeydownModuleDeps = {
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

/** Capture open/clear/set handlers plus keydown listener registration. */
export type T_dialogKeybindSettingsCaptureHandlersModuleDeps =
  T_dialogKeybindSettingsCaptureKeydownModuleDeps & {
    addKeydownListener: (handler: (e: KeyboardEvent) => void) => void
  }

/** Dialog open, routing watches, and global keybind suspend wiring. */
export type T_dialogKeybindSettingsDialogWiringModuleDeps = {
  computed: <T>(getter: () => T) => ComputedRef<T>
  formatFaKeybindChordForUi: (chord: I_faChordSerialized, platform: NodeJS.Platform) => string
  fromThrowable: T_injectedResultFromThrowable
  getDialogComponentStore: () => {
    dialogToOpen?: unknown
    dialogUUID?: unknown
  }
  getKeybindsStore: () => {
    setSuspendGlobalKeybindDispatch: (active: boolean) => void
  }
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
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
  watch: (
    source: (() => unknown) | Ref<unknown>,
    effect: (value: unknown, oldValue?: unknown) => void,
    options?: { immediate?: boolean }
  ) => void
}

/** Pinia-backed dialog state: capture, table, sync, and use* composable. */
export type T_dialogKeybindSettingsStateModuleDeps = {
  computed: <T>(getter: () => T) => ComputedRef<T>
  createDialogKeybindSettingsCapture: (params: {
    platform: ComputedRef<NodeJS.Platform>
    t: (key: string) => string
    workingOverrides: Ref<I_faKeybindsRoot['overrides']>
  }) => T_createDialogKeybindSettingsCaptureResult
  createDialogKeybindSettingsTableState: (params: {
    filter: Ref<string | null | undefined>
    platform: ComputedRef<NodeJS.Platform>
    t: (key: string) => string
    workingOverrides: Ref<I_faKeybindsRoot['overrides']>
  }) => {
    tableColumns: ComputedRef<Array<{
      align: 'left'
      classes: string
      field: string
      label: string
      name: string
    }>>
    tableRows: ComputedRef<I_dialogKeybindSettingsRow[]>
  }
  getKeybindsStore: () => {
    snapshot: { platform: NodeJS.Platform, store: { overrides: I_faKeybindsRoot['overrides'] } } | null
  }
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => Ref<T>
  runFaActionAwait: (
    id: 'saveKeybindSettings',
    payload: { overrides: I_faKeybindsRoot['overrides'] }
  ) => Promise<boolean>
  translate: (key: string) => string
}

/** Table max-height layout observer and body-section chrome composable. */
export type T_dialogKeybindSettingsTableLayoutObserveModuleDeps = {
  computeDialogKeybindSettingsTableMaxHeightPx: (
    sectionElement: HTMLElement,
    minPx?: number
  ) => number
  computed: <T>(getter: () => T) => ComputedRef<T>
  nextTick: () => Promise<void>
  onBeforeUnmount: (hook: () => void) => void
  ref: <T>(value: T) => Ref<T>
  watch: (
    source: () => boolean,
    effect: (open: boolean) => void | Promise<void>,
    options?: { immediate?: boolean }
  ) => void
}

export type { T_dialogKeybindSettingsViewFactoryDeps as T_dialogKeybindSettingsViewModuleDeps } from 'app/types/I_dialogKeybindSettingsFactories'
