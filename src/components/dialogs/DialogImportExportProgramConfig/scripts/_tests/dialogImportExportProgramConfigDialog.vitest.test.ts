/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import { useDialogImportExportProgramConfigDialog } from '../dialogImportExportProgramConfigDialog'

const createExport = vi.hoisted(() => vi.fn())
const applyImport = vi.hoisted(() => vi.fn())
const prepare = vi.hoisted(() => vi.fn())

vi.mock('../dialogImportExportProgramConfigDialogActions', () => ({
  importExportDialogClickApplyImport: applyImport,
  importExportDialogClickCreateExport: createExport,
  importExportDialogClickPrepareImport: prepare
}))

test('useDialogImportExportProgramConfigDialog wires the action helpers', async () => {
  const c = useDialogImportExportProgramConfigDialog({ onRequestClose: () => {} })
  expect(c.view.value).toBe('root')
  expect(c.createExportDisabled.value).toBe(false)
  await c.onClickCreateExport()
  expect(createExport).toHaveBeenCalled()
  await c.onClickImport()
  expect(prepare).toHaveBeenCalled()
  await c.onClickImportSelected()
  expect(applyImport).toHaveBeenCalled()
})
