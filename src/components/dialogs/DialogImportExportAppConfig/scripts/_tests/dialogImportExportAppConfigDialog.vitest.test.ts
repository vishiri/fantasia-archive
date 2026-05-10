/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import { useDialogImportExportAppConfigDialog } from '../dialogImportExportAppConfigDialog'

const createExport = vi.hoisted(() => vi.fn())
const applyImport = vi.hoisted(() => vi.fn())
const prepare = vi.hoisted(() => vi.fn())

vi.mock('../dialogImportExportAppConfigDialogActions', () => ({
  importExportDialogClickApplyImport: applyImport,
  importExportDialogClickCreateExport: createExport,
  importExportDialogClickPrepareImport: prepare
}))

test('useDialogImportExportAppConfigDialog wires the action helpers', async () => {
  const c = useDialogImportExportAppConfigDialog({ onRequestClose: () => {} })
  expect(c.view.value).toBe('root')
  expect(c.createExportDisabled.value).toBe(false)
  await c.onClickCreateExport()
  expect(createExport).toHaveBeenCalled()
  await c.onClickImport()
  expect(prepare).toHaveBeenCalled()
  await c.onClickImportSelected()
  expect(applyImport).toHaveBeenCalled()
})
