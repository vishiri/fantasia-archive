/** @vitest-environment jsdom */
import { ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import {
  importExportDialogClickApplyImport,
  importExportDialogClickCreateExport,
  importExportDialogClickPrepareImport
} from '../dialogImportExportProgramConfigDialogActions'
import type { I_importExportDialogActionBindings } from '../dialogImportExportProgramConfigDialogActions'

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

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => ({
  runFaAction: runFaActionMock,
  runFaActionAwait: runFaActionAwaitMock
}))

const exportToFileMock = vi.fn()
const prepareImportMock = vi.fn()
const disposeImportSessionMock = vi.fn()

let prevApis: typeof window.faContentBridgeAPIs | undefined

function makeBindings (): I_importExportDialogActionBindings {
  return {
    exportIncludeKeybinds: ref(true),
    exportIncludeProgramSettings: ref(true),
    exportIncludeProgramStyling: ref(true),
    importApplyKeybinds: ref(true),
    importApplyProgramSettings: ref(true),
    importApplyProgramStyling: ref(true),
    importParts: ref(null),
    importSessionId: ref(''),
    onRequestClose: () => { onRequestCloseMock() },
    view: ref('root')
  }
}

const onRequestCloseMock = vi.fn()

/** Strips `faProgramConfig` for “no desktop bridge” cases (value is not representable in Window typings). */
function bridgeWithProgramConfigOmitted (saved: typeof window.faContentBridgeAPIs): typeof window.faContentBridgeAPIs {
  return {
    ...saved,
    faProgramConfig: undefined
  } as unknown as typeof window.faContentBridgeAPIs
}

beforeEach(() => {
  onRequestCloseMock.mockReset()
  notifyCreateMock.mockReset()
  runFaActionMock.mockReset()
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
  exportToFileMock.mockReset()
  prepareImportMock.mockReset()
  disposeImportSessionMock.mockReset()
  exportToFileMock.mockResolvedValue({ outcome: 'canceled' })
  prepareImportMock.mockResolvedValue({ outcome: 'canceled' })
  prevApis = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faProgramConfig: {
        disposeImportSession: disposeImportSessionMock,
        exportToFile: exportToFileMock,
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

test('importExportDialogClickCreateExport no-ops exportToFile when the bridge is missing', async () => {
  const b = makeBindings()
  const saved = window.faContentBridgeAPIs
  window.faContentBridgeAPIs = bridgeWithProgramConfigOmitted(saved)
  await importExportDialogClickCreateExport(b)
  expect(exportToFileMock).not.toHaveBeenCalled()
  expect(runFaActionMock).toHaveBeenCalledWith('exportProgramConfigPackage', {
    includeKeybinds: true,
    includeProgramSettings: true,
    includeProgramStyling: true
  })
  window.faContentBridgeAPIs = saved
})

test('importExportDialogClickCreateExport on saved notifies and closes', async () => {
  const b = makeBindings()
  exportToFileMock.mockResolvedValueOnce({
    filePath: 'C:\\a.faconfig',
    outcome: 'saved'
  })
  await importExportDialogClickCreateExport(b)
  expect(exportToFileMock).toHaveBeenCalled()
  expect(runFaActionMock).toHaveBeenCalledWith('exportProgramConfigSaveResult', {
    filePath: 'C:\\a.faconfig',
    status: 'saved'
  })
  expect(notifyCreateMock).toHaveBeenCalled()
  expect(onRequestCloseMock).toHaveBeenCalled()
})

test('importExportDialogClickCreateExport reports canceled save result and does not close', async () => {
  const b = makeBindings()
  exportToFileMock.mockResolvedValueOnce({ outcome: 'canceled' })
  await importExportDialogClickCreateExport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('exportProgramConfigSaveResult', {
    status: 'canceled'
  })
  expect(onRequestCloseMock).not.toHaveBeenCalled()
})

test('importExportDialogClickCreateExport reports error result', async () => {
  const b = makeBindings()
  exportToFileMock.mockResolvedValueOnce({
    errorMessage: 'e',
    errorName: 'E',
    outcome: 'error'
  })
  await importExportDialogClickCreateExport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('exportProgramConfigSaveResult', {
    errorMessage: 'e',
    errorName: 'E',
    status: 'error'
  })
})

test('importExportDialogClickPrepareImport no-ops when the bridge is missing', async () => {
  const b = makeBindings()
  const saved = window.faContentBridgeAPIs
  window.faContentBridgeAPIs = bridgeWithProgramConfigOmitted(saved)
  await importExportDialogClickPrepareImport(b)
  expect(prepareImportMock).not.toHaveBeenCalled()
  window.faContentBridgeAPIs = saved
})

test('importExportDialogClickPrepareImport records canceled in the action log', async () => {
  const b = makeBindings()
  prepareImportMock.mockResolvedValueOnce({ outcome: 'canceled' })
  await importExportDialogClickPrepareImport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('importProgramConfigStageResult', { status: 'canceled' })
})

test('importExportDialogClickPrepareImport records error stage result', async () => {
  const b = makeBindings()
  prepareImportMock.mockResolvedValueOnce({
    errorMessage: 'bad',
    errorName: 'E',
    outcome: 'error'
  })
  await importExportDialogClickPrepareImport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('importProgramConfigStageResult', {
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
      programSettings: 'ok',
      programStyling: 'ok'
    }
  })
  await importExportDialogClickPrepareImport(b)
  expect(runFaActionMock).toHaveBeenCalledWith('importProgramConfigStageResult', {
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
      programSettings: 'ok',
      programStyling: 'absent'
    },
    sessionId: 's1'
  })
  await importExportDialogClickPrepareImport(b)
  expect(b.importSessionId.value).toBe('s1')
  expect(b.view.value).toBe('importSelect')
  expect(b.importParts.value).toEqual({
    keybinds: 'ok',
    programSettings: 'ok',
    programStyling: 'absent'
  })
  expect(runFaActionMock).toHaveBeenCalledWith('importProgramConfigStageResult', {
    sessionId: 's1',
    status: 'pass'
  })
})

test('importExportDialogClickApplyImport no-ops when the bridge is missing', async () => {
  const b = makeBindings()
  b.importSessionId.value = 's'
  const saved = window.faContentBridgeAPIs
  window.faContentBridgeAPIs = bridgeWithProgramConfigOmitted(saved)
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
  expect(runFaActionAwaitMock).toHaveBeenCalledWith('importProgramConfigApply', {
    applyKeybinds: true,
    applyProgramSettings: true,
    applyProgramStyling: true,
    sessionId: 's'
  })
  expect(notifyCreateMock).toHaveBeenCalled()
  expect(onRequestCloseMock).toHaveBeenCalled()
})
