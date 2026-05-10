import { computed, type ComputedRef, type Ref } from 'vue'

import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'

import { registerImportExportApplyCheckboxSync } from './dialogImportExportAppConfigImportApplySync'

export function buildImportExportAppConfigDialogModelComputeds (opts: {
  exportIncludeKeybinds: Ref<boolean>
  exportIncludeAppNoteboard: Ref<boolean>
  exportIncludeAppSettings: Ref<boolean>
  exportIncludeAppStyling: Ref<boolean>
  importApplyKeybinds: Ref<boolean>
  importApplyAppNoteboard: Ref<boolean>
  importApplyAppSettings: Ref<boolean>
  importApplyAppStyling: Ref<boolean>
  importParts: Ref<I_faAppConfigImportPartsUi | null>
}): {
    createExportDisabled: ComputedRef<boolean>
    importApplyDisabled: ComputedRef<boolean>
    keybindsImportEnabled: ComputedRef<boolean>
    appNoteboardImportEnabled: ComputedRef<boolean>
    appSettingsImportEnabled: ComputedRef<boolean>
    appStylingImportEnabled: ComputedRef<boolean>
  } {
  const {
    exportIncludeKeybinds,
    exportIncludeAppNoteboard,
    exportIncludeAppSettings,
    exportIncludeAppStyling,
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts
  } = opts

  const createExportDisabled = computed(() => {
    return (
      !exportIncludeKeybinds.value &&
      !exportIncludeAppNoteboard.value &&
      !exportIncludeAppSettings.value &&
      !exportIncludeAppStyling.value
    )
  })

  const appSettingsImportEnabled = computed(() => {
    return importParts.value?.appSettings === 'ok'
  })
  const keybindsImportEnabled = computed(() => {
    return importParts.value?.keybinds === 'ok'
  })
  const appNoteboardImportEnabled = computed(() => {
    return importParts.value?.appNoteboard === 'ok'
  })
  const appStylingImportEnabled = computed(() => {
    return importParts.value?.appStyling === 'ok'
  })

  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts
  })

  const importApplyDisabled = computed(() => {
    if (importParts.value === null) {
      return true
    }
    const a =
      (appSettingsImportEnabled.value && importApplyAppSettings.value) ||
      (keybindsImportEnabled.value && importApplyKeybinds.value) ||
      (appNoteboardImportEnabled.value && importApplyAppNoteboard.value) ||
      (appStylingImportEnabled.value && importApplyAppStyling.value)
    return !a
  })

  return {
    createExportDisabled,
    importApplyDisabled,
    keybindsImportEnabled,
    appNoteboardImportEnabled,
    appSettingsImportEnabled,
    appStylingImportEnabled
  }
}
