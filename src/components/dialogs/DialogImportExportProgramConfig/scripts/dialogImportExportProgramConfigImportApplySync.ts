import type { Ref } from 'vue'
import { watch } from 'vue'

import type { I_faProgramConfigImportPartsUi } from 'app/types/I_faProgramConfigDomain'

/**
 * When staged import parts load, keep apply checkboxes aligned with available files.
 */
export function registerImportExportApplyCheckboxSync (opts: {
  importApplyKeybinds: Ref<boolean>
  importApplyProgramSettings: Ref<boolean>
  importApplyProgramStyling: Ref<boolean>
  importParts: Ref<I_faProgramConfigImportPartsUi | null>
}): void {
  const {
    importApplyKeybinds,
    importApplyProgramSettings,
    importApplyProgramStyling,
    importParts
  } = opts
  watch(
    [importParts],
    () => {
      const p = importParts.value
      if (p === null) {
        return
      }
      importApplyProgramSettings.value = p.programSettings === 'ok'
      importApplyKeybinds.value = p.keybinds === 'ok'
      importApplyProgramStyling.value = p.programStyling === 'ok'
    },
    { deep: true }
  )
}
