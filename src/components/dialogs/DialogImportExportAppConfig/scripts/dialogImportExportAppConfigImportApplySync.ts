import type { Ref } from 'vue'
import { watch } from 'vue'

import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'

/**
 * When staged import parts load, keep apply checkboxes aligned with available files.
 */
export function registerImportExportApplyCheckboxSync (opts: {
  importApplyKeybinds: Ref<boolean>
  importApplyAppNoteboard: Ref<boolean>
  importApplyAppSettings: Ref<boolean>
  importApplyAppStyling: Ref<boolean>
  importParts: Ref<I_faAppConfigImportPartsUi | null>
}): void {
  const {
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts
  } = opts
  watch(
    [importParts],
    () => {
      const p = importParts.value
      if (p === null) {
        return
      }
      importApplyKeybinds.value = p.keybinds === 'ok'
      importApplyAppNoteboard.value = p.appNoteboard === 'ok'
      importApplyAppSettings.value = p.appSettings === 'ok'
      importApplyAppStyling.value = p.appStyling === 'ok'
    },
    { deep: true }
  )
}
