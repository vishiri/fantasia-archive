/** @vitest-environment jsdom */
import { ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import {
  importExportDialogClickApplyImport,
  importExportDialogClickCreateExport,
  importExportDialogClickPrepareImport
} from '../dialogImportExportAppConfig_manager'
import type { I_importExportDialogActionBindings } from 'app/types/I_dialogImportExportAppConfig'

const { notifyCreateMock, runFaActionAwaitMock, runFaActionMock } = vi.hoisted(() => ({
  notifyCreateMock: vi.fn(),
  runFaActionAwaitMock: vi.fn(async () => true),
  runFaActionMock: vi.fn()
}))

vi.mock('quasar', () => ({
  Notify: { create: notifyCreateMock }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (k: string) => k } }
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaAction: runFaActionMock,
  runFaActionAwait: runFaActionAwaitMock
}))

const prepareImportMock = vi.fn()
const disposeImportSessionMock = vi.fn()

let prevApis: typeof window.faContentBridgeAPIs | undefined

function makeBindings (): I_importExportDialogActionBindings {
  return {
    exportIncludeKeybinds: ref(true),
    exportIncludeAppNoteboard: ref(true),
    exportIncludeAppSettings: ref(true),
    exportIncludeAppStyling: ref(true),
    importApplyKeybinds: ref(true),
    importApplyAppNoteboard: ref(true),
    importApplyAppSettings: ref(true),
    importApplyAppStyling: ref(true),
    importParts: ref(null),
    importSessionId: ref(''),
    onRequestClose: () => { onRequestCloseMock() },
    view: ref('root')
  }
}

const onRequestCloseMock = vi.fn()

/** Strips `faAppConfig` for “no desktop bridge” cases (value is not representable in Window typings). */
function bridgeWithAppConfigOmitted (saved: typeof window.faContentBridgeAPIs): typeof window.faContentBridgeAPIs {
  return {
    ...saved,
    faAppConfig: undefined
  } as unknown as typeof window.faContentBridgeAPIs
}

beforeEach(() => {
  onRequestCloseMock.mockReset()
  notifyCreateMock.mockReset()
  runFaActionMock.mockReset()
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
  prepareImportMock.mockReset()
  disposeImportSessionMock.mockReset()
  prepareImportMock.mockResolvedValue({ outcome: 'canceled' })
  prevApis = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faAppConfig: {
        disposeImportSession: disposeImportSessionMock,
        exportToFile: vi.fn(),
        prepareImport: prepareImportMock
      }
    } as never
  })
})

afterEach(() => {
  if (prevApis !== undefined) {
    window.faContentBridgeAPIs = prevApis
  }
})

test('importExportDialogClickCreateExport awaits exportAppConfigPackage with include flags', async () => {
  const b = makeBindings()
  await importExportDialogClickCreateExport(b)
  expect(runFaActionAwaitMock).toHaveBeenCalledWith('exportAppConfigPackage', {
    includeKeybinds: true,
    includeAppNoteboard: true,
    includeAppSettings: true,
    includeAppStyling: true
  })
})

test('importExportDialogClickCreateExport on success notifies and closes', async () => {
  const b = makeBindings()
  runFaActionAwaitMock.mockResolvedValueOnce(true)
  await importExportDialogClickCreateExport(b)
  expect(notifyCreateMock).toHaveBeenCalled()
  expect(onRequestCloseMock).toHaveBeenCalled()
})

test('importExportDialogClickCreateExport does not close when export action fails', async () => {
  const b = makeBindings()
  runFaActionAwaitMock.mockResolvedValueOnce(false)
  await importExportDialogClickCreateExport(b)
  expect(notifyCreateMock).not.toHaveBeenCalled()
  expect(onRequestCloseMock).not.toHaveBeenCalled()
})

test('importExportDialogClickPrepareImport no-ops when the bridge is missing', async () => {
  const b = makeBindings()
  const saved = window.faContentBridgeAPIs
  window.faContentBridgeAPIs = bridgeWithAppConfigOmitted(saved)
  await importExportDialogClickPrepareImport(b)
  expect(prepareImportMock).not.toHaveBeenCalled()
  window.faContentBridgeAPIs = saved
})

test('importExportDialogClickPrepareImport records canceled in the action log', async () => {
  const b = makeBindings()
  prepareImportMock.mockResolvedValueOnce({ outcome: 'canceled' })
  await importExportDialogClickPrepareImport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('importAppConfigStageResult', { status: 'canceled' })
})

test('importExportDialogClickPrepareImport records error stage result', async () => {
  const b = makeBindings()
  prepareImportMock.mockResolvedValueOnce({
    errorMessage: 'bad',
    errorName: 'E',
    outcome: 'error'
  })
  await importExportDialogClickPrepareImport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('importAppConfigStageResult', {
    errorCode: 'E',
    errorMessage: 'bad',
    status: 'fail'
  })
})

test('importExportDialogClickPrepareImport treats a ready result without a session as failure', async () => {
  const b = makeBindings()
  prepareImportMock.mockResolvedValueOnce({
    outcome: 'ready',
    parts: {
      keybinds: 'ok',
      appNoteboard: 'ok',
      appSettings: 'ok',
      appStyling: 'ok'
    }
  })
  await importExportDialogClickPrepareImport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('importAppConfigStageResult', {
    errorCode: undefined,
    errorMessage: undefined,
    status: 'fail'
  })
})

test('importExportDialogClickPrepareImport moves to import select on success', async () => {
  const b = makeBindings()
  prepareImportMock.mockResolvedValueOnce({
    outcome: 'ready',
    parts: {
      keybinds: 'ok',
      appNoteboard: 'absent',
      appSettings: 'ok',
      appStyling: 'absent'
    },
    sessionId: 's1'
  })
  await importExportDialogClickPrepareImport(b)
  expect(b.importSessionId.value).toBe('s1')
  expect(b.view.value).toBe('importSelect')
  expect(b.importParts.value).toEqual({
    keybinds: 'ok',
    appNoteboard: 'absent',
    appSettings: 'ok',
    appStyling: 'absent'
  })
  expect(runFaActionMock).toHaveBeenCalledWith('importAppConfigStageResult', {
    sessionId: 's1',
    status: 'pass'
  })
})

test('importExportDialogClickApplyImport no-ops when the bridge is missing', async () => {
  const b = makeBindings()
  b.importSessionId.value = 's'
  const saved = window.faContentBridgeAPIs
  window.faContentBridgeAPIs = bridgeWithAppConfigOmitted(saved)
  await importExportDialogClickApplyImport(b)
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
  window.faContentBridgeAPIs = saved
})

test('importExportDialogClickApplyImport no-ops when the session id is empty', async () => {
  const b = makeBindings()
  b.importSessionId.value = ''
  await importExportDialogClickApplyImport(b)
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

test('importExportDialogClickApplyImport does not close when the action is rejected in the monitor', async () => {
  const b = makeBindings()
  b.importSessionId.value = 's'
  runFaActionAwaitMock.mockResolvedValueOnce(false)
  await importExportDialogClickApplyImport(b)
  expect(notifyCreateMock).not.toHaveBeenCalled()
  expect(onRequestCloseMock).not.toHaveBeenCalled()
})

test('importExportDialogClickApplyImport notifies and closes on success', async () => {
  const b = makeBindings()
  b.importSessionId.value = 's'
  runFaActionAwaitMock.mockResolvedValueOnce(true)
  await importExportDialogClickApplyImport(b)
  expect(runFaActionAwaitMock).toHaveBeenCalledWith('importAppConfigApply', {
    applyKeybinds: true,
    applyAppNoteboard: true,
    applyAppSettings: true,
    applyAppStyling: true,
    sessionId: 's'
  })
  expect(notifyCreateMock).toHaveBeenCalled()
  expect(onRequestCloseMock).toHaveBeenCalled()
})
