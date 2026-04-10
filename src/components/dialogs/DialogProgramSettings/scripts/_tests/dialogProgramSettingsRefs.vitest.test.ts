import { expect, test } from 'vitest'

import { createDialogProgramSettingsRefs } from 'app/src/components/dialogs/DialogProgramSettings/scripts/dialogProgramSettingsRefs'

/**
 * createDialogProgramSettingsRefs
 * Returns fresh reactive refs with the expected initial values for the program settings dialog.
 */
test('createDialogProgramSettingsRefs initializes dialog and tree refs', () => {
  const r = createDialogProgramSettingsRefs()

  expect(r.dialogModel.value).toBe(false)
  expect(r.documentName.value).toBe('')
  expect(r.localSettings.value).toBe(null)
  expect(r.programSettingsTree.value).toEqual({})
  expect(r.searchSettingsQuery.value).toBe('')
  expect(r.selectedCategoryTab.value).toBe('')
})
