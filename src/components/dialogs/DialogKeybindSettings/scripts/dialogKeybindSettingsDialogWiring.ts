import type { StoreGeneric } from 'pinia'
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, watch } from 'vue'

import { formatFaChordForDisplay } from 'app/src/scripts/keybinds/faKeybindsChordDisplayAndConflict'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

function resolveDialogComponentStore (): StoreGeneric | null {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

function registerDialogKeybindSettingsStoreUuidWatch (openDialog: () => void): void {
  watch(
    () => resolveDialogComponentStore()?.dialogUUID,
    () => {
      const st = resolveDialogComponentStore()
      if (st?.dialogToOpen === 'KeybindSettings') {
        openDialog()
      }
    }
  )
}

function registerDialogKeybindSettingsDirectInputWatch (
  props: { directInput?: T_dialogName },
  openDialog: () => void
): void {
  watch(
    () => props.directInput,
    () => {
      if (props.directInput === 'KeybindSettings') {
        openDialog()
      }
    }
  )
}

function registerDialogKeybindSettingsDirectInputOnMounted (
  props: { directInput?: T_dialogName },
  openDialog: () => void
): void {
  onMounted(() => {
    if (props.directInput === 'KeybindSettings') {
      openDialog()
    }
  })
}

/**
 * Loads keybind snapshot then shows the dialog. Component-dialog visibility is tracked by registerComponentDialogStackGuard from dialogManagement on the root q-dialog.
 */
export function runDialogKeybindSettingsOpen (params: {
  dialogModel: Ref<boolean>
  documentName: Ref<T_dialogName>
  initializeForOpen: () => void
  keybindsStore: ReturnType<typeof S_FaKeybinds>
}): void {
  const {
    dialogModel,
    documentName,
    initializeForOpen,
    keybindsStore
  } = params

  documentName.value = 'KeybindSettings'
  void keybindsStore.refreshKeybinds()
    .then(() => {
      initializeForOpen()
      dialogModel.value = true
    })
    .catch(() => {
      /* Bridge errors leave the dialog closed; component dialog stack guard count was not incremented yet. */
    })
}

export function setupDialogKeybindSettingsDialogRouting (params: {
  dialogModel: Ref<boolean>
  documentName: Ref<T_dialogName>
  initializeForOpen: () => void
  keybindsStore: ReturnType<typeof S_FaKeybinds>
  onSaveMain: () => Promise<boolean>
  props: { directInput?: T_dialogName }
}): {
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

  const platform = computed(() => keybindsStore.snapshot?.platform ?? 'win32')

  function formatChord (chord: I_faChordSerialized): string {
    return formatFaChordForDisplay(chord, platform.value)
  }

  async function saveMain (): Promise<void> {
    const ok = await onSaveMain()
    if (ok) {
      dialogModel.value = false
    }
  }

  function openDialog (): void {
    runDialogKeybindSettingsOpen({
      dialogModel,
      documentName,
      initializeForOpen,
      keybindsStore
    })
  }

  registerDialogKeybindSettingsStoreUuidWatch(openDialog)
  registerDialogKeybindSettingsDirectInputWatch(props, openDialog)
  registerDialogKeybindSettingsDirectInputOnMounted(props, openDialog)

  return {
    formatChord,
    saveMain
  }
}

/**
 * Suspends the app-wide keybind dispatcher while the keybind settings dialog or its capture popup is open.
 */
export function registerDialogKeybindSettingsGlobalSuspend (params: {
  captureOpen: Ref<boolean>
  dialogModel: Ref<boolean>
}): void {
  const {
    captureOpen,
    dialogModel
  } = params
  const keybindsStore = S_FaKeybinds()

  watch(
    () => dialogModel.value || captureOpen.value,
    (active) => {
      keybindsStore.setSuspendGlobalKeybindDispatch(active)
    },
    {
      immediate: true
    }
  )

  onUnmounted(() => {
    keybindsStore.setSuspendGlobalKeybindDispatch(false)
  })
}
