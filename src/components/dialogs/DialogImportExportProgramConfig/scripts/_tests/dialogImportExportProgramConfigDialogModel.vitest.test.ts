/** @vitest-environment jsdom */
import { nextTick } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useImportExportProgramConfigDialogModel } from '../dialogImportExportProgramConfigDialogModel'

const disposeImportSessionMock = vi.fn()
let prevApis: typeof window.faContentBridgeAPIs | undefined

beforeEach(() => {
  disposeImportSessionMock.mockReset()
  prevApis = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faProgramConfig: {
        ...window.faContentBridgeAPIs?.faProgramConfig,
        disposeImportSession: disposeImportSessionMock
      }
    } as never
  })
})

afterEach(() => {
  if (prevApis !== undefined) {
    window.faContentBridgeAPIs = prevApis
  }
})

test('useImportExportProgramConfigDialogModel importApplyDisabled is true when import parts are not loaded', () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  expect(m.importApplyDisabled.value).toBe(true)
})

test('useImportExportProgramConfigDialogModel createExportDisabled reflects export checkboxes', () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  m.exportIncludeProgramSettings.value = false
  m.exportIncludeKeybinds.value = false
  m.exportIncludeProgramStyling.value = false
  expect(m.createExportDisabled.value).toBe(true)
  m.exportIncludeKeybinds.value = true
  expect(m.createExportDisabled.value).toBe(false)
})

test('useImportExportProgramConfigDialogModel importApplyDisabled tracks enabled parts and checkboxes', async () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'ok',
    programSettings: 'absent',
    programStyling: 'ok'
  }
  await nextTick()
  m.importApplyKeybinds.value = false
  m.importApplyProgramStyling.value = true
  expect(m.importApplyDisabled.value).toBe(false)
  m.importApplyProgramStyling.value = false
  expect(m.importApplyDisabled.value).toBe(true)
})

test('useImportExportProgramConfigDialogModel importApplyDisabled is false when only program settings apply', async () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'absent',
    programSettings: 'ok',
    programStyling: 'absent'
  }
  await nextTick()
  m.importApplyProgramSettings.value = true
  m.importApplyKeybinds.value = false
  m.importApplyProgramStyling.value = false
  expect(m.importApplyDisabled.value).toBe(false)
})

test('useImportExportProgramConfigDialogModel importApplyDisabled is false when only keybinds apply', async () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'ok',
    programSettings: 'absent',
    programStyling: 'absent'
  }
  await nextTick()
  m.importApplyKeybinds.value = true
  m.importApplyProgramSettings.value = false
  m.importApplyProgramStyling.value = false
  expect(m.importApplyDisabled.value).toBe(false)
})

test('useImportExportProgramConfigDialogModel importApplyDisabled is false when only program styling apply', async () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'absent',
    programSettings: 'absent',
    programStyling: 'ok'
  }
  await nextTick()
  m.importApplyProgramStyling.value = true
  m.importApplyProgramSettings.value = false
  m.importApplyKeybinds.value = false
  expect(m.importApplyDisabled.value).toBe(false)
})

test('useImportExportProgramConfigDialogModel closes disposes a session and resets state', () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  m.importSessionId.value = 'sid'
  m.view.value = 'importSelect'
  m.dialogModel.value = true
  m.dialogModel.value = false
  expect(disposeImportSessionMock).toHaveBeenCalledWith('sid')
  expect(m.view.value).toBe('root')
  expect(m.importSessionId.value).toBe('')
  expect(m.importParts.value).toBe(null)
})

test('useImportExportProgramConfigDialogModel close without session still resets', () => {
  const m = useImportExportProgramConfigDialogModel({ onRequestClose: () => {} })
  m.dialogModel.value = true
  m.view.value = 'export'
  m.dialogModel.value = false
  expect(disposeImportSessionMock).not.toHaveBeenCalled()
  expect(m.view.value).toBe('root')
})
