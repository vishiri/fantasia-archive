import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type { T_createDialogKeybindSettingsCaptureResult } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsStateModuleDeps } from 'app/types/I_dialogKeybindSettings'
import type {
  T_dialogKeybindSettingsSyncApi,
  T_useDialogKeybindSettingsResult
} from 'app/types/I_dialogKeybindSettingsFactories'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

import { areFaJsonSnapshotsEqual } from 'app/src/scripts/_utilities/functions/faJsonSnapshotsEqual'

function cloneOverridesPlain (o: I_faKeybindsRoot['overrides']): I_faKeybindsRoot['overrides'] {
  return JSON.parse(JSON.stringify(o)) as I_faKeybindsRoot['overrides']
}

export function createDialogKeybindSettingsSync (
  deps: T_dialogKeybindSettingsStateModuleDeps,
  params: {
    baselineOverrides: I_ref<I_faKeybindsRoot['overrides']>
    filter: I_ref<string | null | undefined>
    keybindsStore: {
      snapshot: { store: { overrides: I_faKeybindsRoot['overrides'] } } | null
    }
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }
): T_dialogKeybindSettingsSyncApi {
  const {
    baselineOverrides,
    filter,
    keybindsStore,
    workingOverrides
  } = params

  function captureBaselineFromWorking (): void {
    baselineOverrides.value = cloneOverridesPlain(workingOverrides.value)
  }

  function syncWorkingFromStore (): void {
    const o = keybindsStore.snapshot?.store.overrides ?? {}
    workingOverrides.value = cloneOverridesPlain(o)
    captureBaselineFromWorking()
  }

  function initializeForOpen (): void {
    syncWorkingFromStore()
  }

  function onCloseMain (): void {
    filter.value = ''
    syncWorkingFromStore()
  }

  async function onSaveMain (): Promise<boolean> {
    const savedOverrides = cloneOverridesPlain(workingOverrides.value)
    const ok = await deps.runFaActionAwait('saveKeybindSettings', {
      overrides: savedOverrides
    })
    if (!ok) {
      return false
    }
    if (areFaJsonSnapshotsEqual(workingOverrides.value, savedOverrides)) {
      syncWorkingFromStore()
      return true
    }
    baselineOverrides.value = savedOverrides
    return false
  }

  return {
    initializeForOpen,
    onCloseMain,
    onSaveMain,
    syncWorkingFromStore
  }
}

export function createDialogKeybindSettingsStateBundle (
  deps: T_dialogKeybindSettingsStateModuleDeps,
  t: (key: string) => string
): {
    capture: T_createDialogKeybindSettingsCaptureResult
    filter: I_ref<string | null | undefined>
    isDirty: I_computedRef<boolean>
    sync: T_dialogKeybindSettingsSyncApi
    table: ReturnType<typeof deps.createDialogKeybindSettingsTableState>
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  } {
  const keybindsStore = deps.getKeybindsStore()
  const workingOverrides = deps.ref<I_faKeybindsRoot['overrides']>({})
  const baselineOverrides = deps.ref<I_faKeybindsRoot['overrides']>({})
  const filter = deps.ref<string | null | undefined>('')
  const platform = deps.computed(() => keybindsStore.snapshot?.platform ?? 'win32')

  const capture = deps.createDialogKeybindSettingsCapture({
    platform,
    t,
    workingOverrides
  })

  const table = deps.createDialogKeybindSettingsTableState({
    filter,
    platform,
    t,
    workingOverrides
  })

  const sync = createDialogKeybindSettingsSync(deps, {
    baselineOverrides,
    filter,
    keybindsStore,
    workingOverrides
  })

  const isDirty = deps.computed((): boolean => {
    return !areFaJsonSnapshotsEqual(workingOverrides.value, baselineOverrides.value)
  })

  return {
    capture,
    filter,
    isDirty,
    sync,
    table,
    workingOverrides
  }
}

export function useDialogKeybindSettingsFromDeps (
  deps: T_dialogKeybindSettingsStateModuleDeps
): T_useDialogKeybindSettingsResult {
  const t = (key: string) => deps.translate(key)
  const s = createDialogKeybindSettingsStateBundle(deps, t)

  deps.onUnmounted(() => {
    s.capture.removeCaptureListener()
  })

  const {
    captureActionName,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    onCaptureClear,
    onCaptureSet,
    onOpenCapture,
    pendingChord
  } = s.capture
  const {
    filter,
    isDirty,
    workingOverrides
  } = s
  const {
    initializeForOpen,
    onCloseMain,
    onSaveMain
  } = s.sync
  const {
    tableColumns,
    tableRows
  } = s.table
  return {
    captureActionName,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    filter,
    initializeForOpen,
    isDirty,
    onCaptureClear,
    onCaptureSet,
    onCloseMain,
    onOpenCapture,
    onSaveMain,
    pendingChord,
    tableColumns,
    tableRows,
    workingOverrides
  }
}
