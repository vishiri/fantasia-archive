/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

import { useDialogImportExportAppConfigDialog } from '../dialogImportExportAppConfig_manager'

const { prepareImportMock, runFaActionAwaitMock, runFaActionMock } = vi.hoisted(() => ({
  prepareImportMock: vi.fn(async () => ({
    outcome: 'canceled' as const
  })),
  runFaActionAwaitMock: vi.fn(async () => true),
  runFaActionMock: vi.fn()
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaAction: runFaActionMock,
  runFaActionAwait: runFaActionAwaitMock
}))

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (k: string) => k } }
}))

beforeEach(() => {
  runFaActionAwaitMock.mockClear()
  runFaActionMock.mockClear()
  prepareImportMock.mockClear()
  window.faContentBridgeAPIs = {
    faAppConfig: {
      prepareImport: prepareImportMock
    }
  } as unknown as typeof window.faContentBridgeAPIs
})

test('useDialogImportExportAppConfigDialog wires the action helpers', async () => {
  const c = useDialogImportExportAppConfigDialog({ onRequestClose: () => {} })
  expect(c.view.value).toBe('root')
  expect(c.createExportDisabled.value).toBe(false)
  await c.onClickCreateExport()
  expect(runFaActionAwaitMock).toHaveBeenCalledWith(
    'exportAppConfigPackage',
    expect.objectContaining({
      includeAppNoteboard: expect.anything(),
      includeAppSettings: expect.anything(),
      includeAppStyling: expect.anything(),
      includeKeybinds: expect.anything()
    })
  )
  await c.onClickImport()
  expect(prepareImportMock).toHaveBeenCalled()
  expect(runFaActionMock).toHaveBeenCalledWith(
    'importAppConfigStageResult',
    expect.objectContaining({ status: 'canceled' })
  )
  c.importSessionId.value = 'session-1'
  await c.onClickImportSelected()
  expect(runFaActionAwaitMock).toHaveBeenCalledWith(
    'importAppConfigApply',
    expect.objectContaining({ sessionId: 'session-1' })
  )
})
