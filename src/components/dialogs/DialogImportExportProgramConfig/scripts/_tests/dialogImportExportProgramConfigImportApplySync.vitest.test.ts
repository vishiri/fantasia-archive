/** @vitest-environment jsdom */
import { nextTick, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faProgramConfigImportPartsUi } from 'app/types/I_faProgramConfigDomain'

import { registerImportExportApplyCheckboxSync } from '../dialogImportExportProgramConfigImportApplySync'

test('registerImportExportApplyCheckboxSync sets apply flags from part availability', async () => {
  const importApplyKeybinds = ref(true)
  const importApplyProgramSettings = ref(true)
  const importApplyProgramStyling = ref(true)
  const importParts = ref<I_faProgramConfigImportPartsUi | null>(null)

  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyProgramSettings,
    importApplyProgramStyling,
    importParts
  })
  importParts.value = {
    keybinds: 'ok',
    programSettings: 'absent',
    programStyling: 'ok'
  }
  await nextTick()
  expect(importApplyKeybinds.value).toBe(true)
  expect(importApplyProgramSettings.value).toBe(false)
  expect(importApplyProgramStyling.value).toBe(true)
})

test('registerImportExportApplyCheckboxSync does not write when importParts stays null', async () => {
  const importApplyKeybinds = ref(false)
  const importApplyProgramSettings = ref(false)
  const importApplyProgramStyling = ref(false)
  const importParts = ref<I_faProgramConfigImportPartsUi | null>(null)
  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyProgramSettings,
    importApplyProgramStyling,
    importParts
  })
  await nextTick()
  expect(importApplyKeybinds.value).toBe(false)
})

test('registerImportExportApplyCheckboxSync early-returns when importParts is set back to null', async () => {
  const importApplyKeybinds = ref(true)
  const importApplyProgramSettings = ref(true)
  const importApplyProgramStyling = ref(true)
  const importParts = ref<I_faProgramConfigImportPartsUi | null>({
    keybinds: 'ok',
    programSettings: 'ok',
    programStyling: 'ok'
  })
  registerImportExportApplyCheckboxSync({
    importApplyKeybinds,
    importApplyProgramSettings,
    importApplyProgramStyling,
    importParts
  })
  await nextTick()
  importApplyKeybinds.value = false
  importApplyProgramSettings.value = false
  importApplyProgramStyling.value = false
  importParts.value = null
  await nextTick()
  expect(importApplyKeybinds.value).toBe(false)
})
