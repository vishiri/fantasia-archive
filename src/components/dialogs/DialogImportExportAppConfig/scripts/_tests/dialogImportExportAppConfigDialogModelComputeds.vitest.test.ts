/** @vitest-environment jsdom */
import { nextTick, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'
import { buildImportExportAppConfigDialogModelComputeds } from '../dialogImportExportAppConfig_manager'

test('buildImportExportAppConfigDialogModelComputeds importApplyDisabled is false when only noteboard can be applied', async () => {
  const exportIncludeKeybinds = ref(true)
  const exportIncludeAppNoteboard = ref(true)
  const exportIncludeAppSettings = ref(true)
  const exportIncludeAppStyling = ref(true)
  const importApplyKeybinds = ref(false)
  const importApplyAppNoteboard = ref(true)
  const importApplyAppSettings = ref(false)
  const importApplyAppStyling = ref(false)
  const importParts = ref<I_faAppConfigImportPartsUi>({
    keybinds: 'absent',
    appNoteboard: 'ok',
    appSettings: 'absent',
    appStyling: 'absent'
  })

  const { importApplyDisabled } = buildImportExportAppConfigDialogModelComputeds({
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

  await nextTick()
  expect(importApplyDisabled.value).toBe(false)
})
