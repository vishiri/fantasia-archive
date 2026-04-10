import { expect, test, vi } from 'vitest'

import { resolveDialogComponentStore } from 'app/src/components/dialogs/DialogProgramSettings/scripts/dialogProgramSettingsDialogStore'
import { S_DialogComponent } from 'src/stores/S_Dialog'

vi.mock('src/stores/S_Dialog', () => ({
  S_DialogComponent: vi.fn()
}))

/**
 * resolveDialogComponentStore
 * Returns null when the dialog store constructor throws (for example without an active Pinia).
 */
test('resolveDialogComponentStore returns null when S_DialogComponent throws', () => {
  vi.mocked(S_DialogComponent).mockImplementation(() => {
    throw new Error('no pinia')
  })

  expect(resolveDialogComponentStore()).toBe(null)
})

/**
 * resolveDialogComponentStore
 * Returns the live store instance when Pinia and the dialog store are available.
 */
test('resolveDialogComponentStore returns the dialog store instance on success', () => {
  const fake = {
    dialogUUID: 'uuid',
    dialogToOpen: 'ProgramSettings'
  }
  vi.mocked(S_DialogComponent).mockReturnValue(fake as never)

  expect(resolveDialogComponentStore()).toBe(fake)
})
