import { computed, ref, watch } from 'vue'

import type { I_faProgramConfigImportPartsUi } from 'app/types/I_faProgramConfigDomain'

import { registerImportExportApplyCheckboxSync } from './dialogImportExportProgramConfigImportApplySync'

export type T_importExportView = 'export' | 'importSelect' | 'root'

export function useImportExportProgramConfigDialogModel (opts: {
  onRequestClose: () => void
}) {
  const { onRequestClose } = opts
  const dialogModel = ref(false)
  const view = ref<T_importExportView>('root')
  const exportIncludeProgramSettings = ref(true)
  const exportIncludeKeybinds = ref(true)
  const exportIncludeProgramStyling = ref(true)
  const importSessionId = ref('')
  const importParts = ref<I_faProgramConfigImportPartsUi | null>(null)
  const importApplyProgramSettings = ref(true)
  const importApplyKeybinds = ref(true)
  const importApplyProgramStyling = ref(true)

  function resetToRoot (): void {
    view.value = 'root'
    importSessionId.value = ''
    importParts.value = null
    exportIncludeProgramSettings.value = true
    exportIncludeKeybinds.value = true
    exportIncludeProgramStyling.value = true
    importApplyProgramSettings.value = true
    importApplyKeybinds.value = true
    importApplyProgramStyling.value = true
  }

  function disposeImportSessionIfAny (): void {
    const sid = importSessionId.value
    if (sid !== '') {
      void window.faContentBridgeAPIs?.faProgramConfig?.disposeImportSession(sid)
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

  const createExportDisabled = computed(() => {
    return !exportIncludeProgramSettings.value && !exportIncludeKeybinds.value && !exportIncludeProgramStyling.value
  })

  const programSettingsImportEnabled = computed(() => {
    return importParts.value?.programSettings === 'ok'
  })
  const keybindsImportEnabled = computed(() => {
    return importParts.value?.keybinds === 'ok'
  })
  const programStylingImportEnabled = computed(() => {
    return importParts.value?.programStyling === 'ok'
  })

  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyProgramSettings,
    importApplyProgramStyling,
    importParts
  })

  const importApplyDisabled = computed(() => {
    if (importParts.value === null) {
      return true
    }
    const a =
      (programSettingsImportEnabled.value && importApplyProgramSettings.value) ||
      (keybindsImportEnabled.value && importApplyKeybinds.value) ||
      (programStylingImportEnabled.value && importApplyProgramStyling.value)
    return !a
  })

  return {
    createExportDisabled,
    dialogModel,
    exportIncludeKeybinds,
    exportIncludeProgramSettings,
    exportIncludeProgramStyling,
    importApplyDisabled,
    importApplyKeybinds,
    importApplyProgramSettings,
    importApplyProgramStyling,
    importParts,
    importSessionId,
    keybindsImportEnabled,
    onRequestClose,
    programSettingsImportEnabled,
    programStylingImportEnabled,
    view
  }
}
