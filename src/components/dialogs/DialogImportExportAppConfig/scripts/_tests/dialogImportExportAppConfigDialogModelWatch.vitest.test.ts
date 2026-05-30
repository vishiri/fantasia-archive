/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import { useImportExportAppConfigDialogModel } from '../dialogImportExportAppConfig_manager'

test('useImportExportAppConfigDialogModel ignores non-boolean dialogModel watch values', () => {
  const m = useImportExportAppConfigDialogModel({ onRequestClose: () => {} })
  m.importSessionId.value = 'sid'
  m.view.value = 'importSelect'
  m.dialogModel.value = 'not-a-boolean' as unknown as boolean
  expect(m.view.value).toBe('importSelect')
  expect(m.importSessionId.value).toBe('sid')
})
