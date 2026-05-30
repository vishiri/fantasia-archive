import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { T_dialogKeybindSettingsDialogWiringModuleDeps } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

import { runDialogKeybindSettingsOpen } from './dialogKeybindSettingsDialogOpenSuspend'

function resolveDialogComponentStore (
  deps: T_dialogKeybindSettingsDialogWiringModuleDeps
): {
  dialogToOpen?: unknown
  dialogUUID?: unknown
} | null {
  const resolved = deps.fromThrowable(
    () => deps.getDialogComponentStore(),
    (): null => null
  )()
  if (resolved.isErr()) {
    return null
  }
  return resolved.value
}

function registerDialogKeybindSettingsStoreUuidWatch (
  deps: T_dialogKeybindSettingsDialogWiringModuleDeps,
  openDialog: () => void
): void {
  deps.watch(
    () => resolveDialogComponentStore(deps)?.dialogUUID,
    () => {
      const st = resolveDialogComponentStore(deps)
      if (st?.dialogToOpen === 'KeybindSettings') {
        openDialog()
      }
    }
  )
}

function registerDialogKeybindSettingsDirectInputOpeners (
  deps: T_dialogKeybindSettingsDialogWiringModuleDeps,
  props: { directInput?: T_dialogName },
  openDialog: () => void
): void {
  deps.watch(
    () => props.directInput,
    () => {
      if (props.directInput === 'KeybindSettings') {
        openDialog()
      }
    }
  )
  deps.onMounted(() => {
    if (props.directInput === 'KeybindSettings') {
      openDialog()
    }
  })
}

export function setupDialogKeybindSettingsDialogRouting (
  deps: T_dialogKeybindSettingsDialogWiringModuleDeps,
  params: {
    dialogModel: I_ref<boolean>
    documentName: I_ref<T_dialogName>
    initializeForOpen: () => void
    keybindsStore: {
      refreshKeybinds: () => Promise<unknown>
      snapshot: { platform: NodeJS.Platform } | null
    }
    onSaveMain: () => Promise<boolean>
    props: { directInput?: T_dialogName }
  }
): {
    formatChord: (chord: I_faChordSerialized) => string
    saveMain: () => Promise<void>
  } {
  const {
    dialogModel,
    documentName,
    initializeForOpen,
    keybindsStore,
    onSaveMain,
    props
  } = params

  const platform = deps.computed(() => keybindsStore.snapshot?.platform ?? 'win32')

  function formatChord (chord: I_faChordSerialized): string {
    return deps.formatFaKeybindChordForUi(chord, platform.value)
  }

  async function saveMain (): Promise<void> {
    const ok = await onSaveMain()
    if (ok) {
      dialogModel.value = false
    }
  }

  function openDialog (): void {
    runDialogKeybindSettingsOpen(deps, {
      dialogModel,
      documentName,
      initializeForOpen,
      keybindsStore
    })
  }

  registerDialogKeybindSettingsStoreUuidWatch(deps, openDialog)
  registerDialogKeybindSettingsDirectInputOpeners(deps, props, openDialog)

  return {
    formatChord,
    saveMain
  }
}
