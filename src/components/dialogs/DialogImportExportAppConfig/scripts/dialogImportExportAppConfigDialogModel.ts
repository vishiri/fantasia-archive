import { ref, watch } from 'vue'

import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'

import { buildImportExportAppConfigDialogModelComputeds } from './dialogImportExportAppConfigDialogModelComputeds'

export type T_importExportView = 'export' | 'importSelect' | 'root'

export function useImportExportAppConfigDialogModel (opts: {
  onRequestClose: () => void
}) {
  const { onRequestClose } = opts
  const dialogModel = ref(false)
  const view = ref<T_importExportView>('root')
  const exportIncludeKeybinds = ref(true)
  const exportIncludeAppNoteboard = ref(true)
  const exportIncludeAppSettings = ref(true)
  const exportIncludeAppStyling = ref(true)
  const importSessionId = ref('')
  const importParts = ref<I_faAppConfigImportPartsUi | null>(null)
  const importApplyKeybinds = ref(true)
  const importApplyAppNoteboard = ref(true)
  const importApplyAppSettings = ref(true)
  const importApplyAppStyling = ref(true)

  function resetToRoot (): void {
    view.value = 'root'
    importSessionId.value = ''
    importParts.value = null
    exportIncludeKeybinds.value = true
    exportIncludeAppNoteboard.value = true
    exportIncludeAppSettings.value = true
    exportIncludeAppStyling.value = true
    importApplyKeybinds.value = true
    importApplyAppNoteboard.value = true
    importApplyAppSettings.value = true
    importApplyAppStyling.value = true
  }

  function disposeImportSessionIfAny (): void {
    const sid = importSessionId.value
    if (sid !== '') {
      void window.faContentBridgeAPIs?.faAppConfig?.disposeImportSession(sid)
    }
  }

  watch(
    dialogModel,
    (open) => {
      if (!open) {
        disposeImportSessionIfAny()
        resetToRoot()
      }
    },
    { flush: 'sync' }
  )

  const {
    createExportDisabled,
    importApplyDisabled,
    keybindsImportEnabled,
    appNoteboardImportEnabled,
    appSettingsImportEnabled,
    appStylingImportEnabled
  } = buildImportExportAppConfigDialogModelComputeds({
    exportIncludeKeybinds,
    exportIncludeAppNoteboard,
    exportIncludeAppSettings,
    exportIncludeAppStyling,
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts
  })

  return {
    createExportDisabled,
    dialogModel,
    exportIncludeKeybinds,
    exportIncludeAppNoteboard,
    exportIncludeAppSettings,
    exportIncludeAppStyling,
    importApplyDisabled,
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts,
    importSessionId,
    keybindsImportEnabled,
    onRequestClose,
    appNoteboardImportEnabled,
    appSettingsImportEnabled,
    appStylingImportEnabled,
    view
  }
}
