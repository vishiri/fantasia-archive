/** @vitest-environment jsdom */
import { nextTick, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'

import { registerImportExportApplyCheckboxSync } from '../dialogImportExportAppConfigImportApplySync'

test('registerImportExportApplyCheckboxSync sets apply flags from part availability', async () => {
  const importApplyKeybinds = ref(true)
  const importApplyAppNoteboard = ref(true)
  const importApplyAppSettings = ref(true)
  const importApplyAppStyling = ref(true)
  const importParts = ref<I_faAppConfigImportPartsUi | null>(null)

  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts
  })
  importParts.value = {
    keybinds: 'ok',
    appNoteboard: 'absent',
    appSettings: 'absent',
    appStyling: 'ok'
  }
  await nextTick()
  expect(importApplyKeybinds.value).toBe(true)
  expect(importApplyAppNoteboard.value).toBe(false)
  expect(importApplyAppSettings.value).toBe(false)
  expect(importApplyAppStyling.value).toBe(true)
})

test('registerImportExportApplyCheckboxSync does not write when importParts stays null', async () => {
  const importApplyKeybinds = ref(false)
  const importApplyAppNoteboard = ref(false)
  const importApplyAppSettings = ref(false)
  const importApplyAppStyling = ref(false)
  const importParts = ref<I_faAppConfigImportPartsUi | null>(null)
  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts
  })
  await nextTick()
  expect(importApplyKeybinds.value).toBe(false)
})

test('registerImportExportApplyCheckboxSync early-returns when importParts is set back to null', async () => {
  const importApplyKeybinds = ref(true)
  const importApplyAppNoteboard = ref(true)
  const importApplyAppSettings = ref(true)
  const importApplyAppStyling = ref(true)
  const importParts = ref<I_faAppConfigImportPartsUi | null>({
    keybinds: 'ok',
    appNoteboard: 'ok',
    appSettings: 'ok',
    appStyling: 'ok'
  })
  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyAppNoteboard,
    importApplyAppSettings,
    importApplyAppStyling,
    importParts
  })
  await nextTick()
  importApplyKeybinds.value = false
  importApplyAppNoteboard.value = false
  importApplyAppSettings.value = false
  importApplyAppStyling.value = false
  importParts.value = null
  await nextTick()
  expect(importApplyKeybinds.value).toBe(false)
})
