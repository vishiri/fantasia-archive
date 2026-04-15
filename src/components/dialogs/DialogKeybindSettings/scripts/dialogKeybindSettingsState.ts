import { i18n } from 'app/i18n/externalFileLoader'
import { computed, onUnmounted, ref, type ComputedRef, type Ref } from 'vue'

import { createDialogKeybindSettingsCapture } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsCapture'
import { createDialogKeybindSettingsTableState } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTable'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

export function createDialogKeybindSettingsSync (params: {
  keybindsStore: ReturnType<typeof S_FaKeybinds>
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
}): {
    initializeForOpen: () => void
    onCloseMain: () => void
    onSaveMain: () => Promise<boolean>
    syncWorkingFromStore: () => void
  } {
  const {
    keybindsStore,
    workingOverrides
  } = params

  function cloneOverridesPlain (o: I_faKeybindsRoot['overrides']): I_faKeybindsRoot['overrides'] {
    return JSON.parse(JSON.stringify(o)) as I_faKeybindsRoot['overrides']
  }

  function syncWorkingFromStore (): void {
    const o = keybindsStore.snapshot?.store.overrides ?? {}
    workingOverrides.value = cloneOverridesPlain(o)
  }

  function initializeForOpen (): void {
    syncWorkingFromStore()
  }

  function onCloseMain (): void {
    syncWorkingFromStore()
  }

  async function onSaveMain (): Promise<boolean> {
    const ok = await keybindsStore.updateKeybinds({
      overrides: cloneOverridesPlain(workingOverrides.value),
      replaceAllOverrides: true
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

export function createDialogKeybindSettingsState (t: (key: string) => string): {
  capture: ReturnType<typeof createDialogKeybindSettingsCapture>
  filter: Ref<string>
  sync: ReturnType<typeof createDialogKeybindSettingsSync>
  table: ReturnType<typeof createDialogKeybindSettingsTableState>
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
} {
  const keybindsStore = S_FaKeybinds()
  const workingOverrides = ref<I_faKeybindsRoot['overrides']>({})
  const filter = ref('')
  const platform = computed(() => keybindsStore.snapshot?.platform ?? 'win32')

  const capture = createDialogKeybindSettingsCapture({
    platform,
    t,
    workingOverrides
  })

  const table = createDialogKeybindSettingsTableState({
    filter,
    platform,
    t,
    workingOverrides
  })

  const sync = createDialogKeybindSettingsSync({
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

export function useDialogKeybindSettings (): {
  captureActionName: Ref<string>
  captureError: Ref<boolean>
  captureErrorMessage: Ref<string>
  captureInfoMessage: Ref<string>
  captureLabel: Ref<string>
  captureOpen: Ref<boolean>
  filter: Ref<string>
  initializeForOpen: () => void
  onCaptureClear: () => void
  onCaptureSet: () => void
  onCloseMain: () => void
  onOpenCapture: (row: I_dialogKeybindSettingsRow) => void
  onSaveMain: () => Promise<boolean>
  pendingChord: Ref<I_faChordSerialized | null>
  tableColumns: ComputedRef<Array<{ align: 'left', field: string, label: string, name: string }>>
  tableRows: ComputedRef<I_dialogKeybindSettingsRow[]>
  workingOverrides: Ref<I_faKeybindsRoot['overrides']>
} {
  const t = (key: string) => i18n.global.t(key)
  const s = createDialogKeybindSettingsState(t)

  onUnmounted(() => {
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
