import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { T_dialogKeybindSettingsDialogWiringModuleDeps } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

let keybindSettingsOpenGeneration = 0

export function runDialogKeybindSettingsOpen (
  deps: T_dialogKeybindSettingsDialogWiringModuleDeps,
  params: {
    dialogModel: I_ref<boolean>
    documentName: I_ref<T_dialogName>
    initializeForOpen: () => void
    keybindsStore: {
      refreshKeybinds: () => Promise<unknown>
    }
  }
): void {
  const {
    dialogModel,
    documentName,
    initializeForOpen,
    keybindsStore
  } = params

  keybindSettingsOpenGeneration += 1
  const openGeneration = keybindSettingsOpenGeneration
  documentName.value = 'KeybindSettings'
  deps.refreshKeybindsAsync(
    () => keybindsStore.refreshKeybinds(),
    (error): unknown => error
  ).match(
    () => {
      if (openGeneration !== keybindSettingsOpenGeneration) {
        return
      }
      initializeForOpen()
      dialogModel.value = true
    },
    (error: unknown) => {
      if (openGeneration !== keybindSettingsOpenGeneration) {
        return
      }
      console.error('[DialogKeybindSettings] refreshKeybinds failed before open', error)
      const message = error instanceof Error
        ? error.message
        : deps.translateKeybindLoadError()
      deps.reportFaBridgeLoadFailure(message)
    }
  )
}

export function registerDialogKeybindSettingsGlobalSuspend (
  deps: T_dialogKeybindSettingsDialogWiringModuleDeps,
  params: {
    captureOpen: I_ref<boolean>
    dialogModel: I_ref<boolean>
  }
): void {
  const {
    captureOpen,
    dialogModel
  } = params
  const keybindsStore = deps.getKeybindsStore()

  deps.watch(
    () => dialogModel.value || captureOpen.value,
    (active) => {
      keybindsStore.setSuspendGlobalKeybindDispatch(Boolean(active))
    },
    {
      immediate: true
    }
  )

  deps.onUnmounted(() => {
    keybindsStore.setSuspendGlobalKeybindDispatch(false)
  })
}
