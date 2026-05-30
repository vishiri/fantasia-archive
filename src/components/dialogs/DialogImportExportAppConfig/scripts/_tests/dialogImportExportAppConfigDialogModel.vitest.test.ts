/** @vitest-environment jsdom */
import { nextTick } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useImportExportAppConfigDialogModel } from '../dialogImportExportAppConfig_manager'

const disposeImportSessionMock = vi.fn()
let prevApis: typeof window.faContentBridgeAPIs | undefined

beforeEach(() => {
  disposeImportSessionMock.mockReset()
  prevApis = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faAppConfig: {
        ...window.faContentBridgeAPIs?.faAppConfig,
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

test('useImportExportAppConfigDialogModel importApplyDisabled is true when import parts are not loaded', () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  expect(m.importApplyDisabled.value).toBe(true)
})

test('useImportExportAppConfigDialogModel createExportDisabled reflects export checkboxes', () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.exportIncludeAppSettings.value = false
  m.exportIncludeKeybinds.value = false
  m.exportIncludeAppStyling.value = false
  m.exportIncludeAppNoteboard.value = false
  expect(m.createExportDisabled.value).toBe(true)
  m.exportIncludeKeybinds.value = true
  expect(m.createExportDisabled.value).toBe(false)
})

test('useImportExportAppConfigDialogModel importApplyDisabled tracks enabled parts and checkboxes', async () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'ok',
    appNoteboard: 'absent',
    appSettings: 'absent',
    appStyling: 'ok'
  }
  await nextTick()
  m.importApplyKeybinds.value = false
  m.importApplyAppStyling.value = true
  expect(m.importApplyDisabled.value).toBe(false)
  m.importApplyAppStyling.value = false
  expect(m.importApplyDisabled.value).toBe(true)
})

test('useImportExportAppConfigDialogModel importApplyDisabled is false when only app settings apply', async () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'absent',
    appNoteboard: 'absent',
    appSettings: 'ok',
    appStyling: 'absent'
  }
  await nextTick()
  m.importApplyAppSettings.value = true
  m.importApplyKeybinds.value = false
  m.importApplyAppStyling.value = false
  expect(m.importApplyDisabled.value).toBe(false)
})

test('useImportExportAppConfigDialogModel importApplyDisabled is false when only keybinds apply', async () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'ok',
    appNoteboard: 'absent',
    appSettings: 'absent',
    appStyling: 'absent'
  }
  await nextTick()
  m.importApplyKeybinds.value = true
  m.importApplyAppSettings.value = false
  m.importApplyAppStyling.value = false
  expect(m.importApplyDisabled.value).toBe(false)
})

test('useImportExportAppConfigDialogModel importApplyDisabled is false when only app styling apply', async () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.importParts.value = {
    keybinds: 'absent',
    appNoteboard: 'absent',
    appSettings: 'absent',
    appStyling: 'ok'
  }
  await nextTick()
  m.importApplyAppStyling.value = true
  m.importApplyAppSettings.value = false
  m.importApplyKeybinds.value = false
  expect(m.importApplyDisabled.value).toBe(false)
})

test('useImportExportAppConfigDialogModel closes disposes a session and resets state', () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.importSessionId.value = 'sid'
  m.view.value = 'importSelect'
  m.dialogModel.value = true
  m.dialogModel.value = false
  expect(disposeImportSessionMock).toHaveBeenCalledWith('sid')
  expect(m.view.value).toBe('root')
  expect(m.importSessionId.value).toBe('')
  expect(m.importParts.value).toBe(null)
})

test('useImportExportAppConfigDialogModel close without session still resets', () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.dialogModel.value = true
  m.view.value = 'export'
  m.dialogModel.value = false
  expect(disposeImportSessionMock).not.toHaveBeenCalled()
  expect(m.view.value).toBe('root')
})
