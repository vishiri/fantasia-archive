import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { T_createDialogKeybindSettingsCaptureResult } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsStateModuleDeps } from 'app/types/I_dialogKeybindSettings'
import type {
  T_dialogKeybindSettingsSyncApi,
  T_useDialogKeybindSettingsResult
} from 'app/types/I_dialogKeybindSettingsFactories'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

function cloneOverridesPlain (o: I_faKeybindsRoot['overrides']): I_faKeybindsRoot['overrides'] {
  return JSON.parse(JSON.stringify(o)) as I_faKeybindsRoot['overrides']
}

export function createDialogKeybindSettingsSync (
  deps: T_dialogKeybindSettingsStateModuleDeps,
  params: {
    filter: I_ref<string | null | undefined>
    keybindsStore: {
      snapshot: { store: { overrides: I_faKeybindsRoot['overrides'] } } | null
    }
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }
): T_dialogKeybindSettingsSyncApi {
  const {
    filter,
    keybindsStore,
    workingOverrides
  } = params

  function syncWorkingFromStore (): void {
    const o = keybindsStore.snapshot?.store.overrides ?? {}
    workingOverrides.value = cloneOverridesPlain(o)
  }

  function initializeForOpen (): void {
    syncWorkingFromStore()
  }

  function onCloseMain (): void {
    filter.value = ''
    syncWorkingFromStore()
  }

  async function onSaveMain (): Promise<boolean> {
    const ok = await deps.runFaActionAwait('saveKeybindSettings', {
      overrides: cloneOverridesPlain(workingOverrides.value)
    })
    if (ok) {
      syncWorkingFromStore()
    }
    return ok
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
    sync: T_dialogKeybindSettingsSyncApi
    table: ReturnType<typeof deps.createDialogKeybindSettingsTableState>
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  } {
  const keybindsStore = deps.getKeybindsStore()
  const workingOverrides = deps.ref<I_faKeybindsRoot['overrides']>({})
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
    filter,
    keybindsStore,
    workingOverrides
  })

  return {
    capture,
    filter,
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

  return {
    captureActionName: s.capture.captureActionName,
    captureError: s.capture.captureError,
    captureErrorMessage: s.capture.captureErrorMessage,
    captureInfoMessage: s.capture.captureInfoMessage,
    captureLabel: s.capture.captureLabel,
    captureOpen: s.capture.captureOpen,
    filter: s.filter,
    initializeForOpen: s.sync.initializeForOpen,
    onCaptureClear: s.capture.onCaptureClear,
    onCaptureSet: s.capture.onCaptureSet,
    onCloseMain: s.sync.onCloseMain,
    onOpenCapture: s.capture.onOpenCapture,
    onSaveMain: s.sync.onSaveMain,
    pendingChord: s.capture.pendingChord,
    tableColumns: s.table.tableColumns,
    tableRows: s.table.tableRows,
    workingOverrides: s.workingOverrides
  }
}
