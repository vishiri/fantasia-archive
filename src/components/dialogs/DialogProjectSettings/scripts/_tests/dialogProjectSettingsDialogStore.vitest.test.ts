import { expect, test, vi } from 'vitest'

import { resolveDialogComponentStore } from '../dialogProjectSettingsDialogStore'
import { S_DialogComponent } from 'src/stores/S_Dialog'

vi.mock('src/stores/S_Dialog', () => {
  return {
    S_DialogComponent: vi.fn()
  }
})

/**
 * resolveDialogComponentStore
 * Returns null when the dialog store constructor throws.
 */
test('Test that resolveDialogComponentStore returns null when S_DialogComponent throws', () => {
  vi.mocked(S_DialogComponent).mockImplementation(() => {
    throw new Error('no pinia')
  })

  expect(resolveDialogComponentStore()).toBe(null)
})

/**
 * resolveDialogComponentStore
 * Returns the live store instance when Pinia is active.
 */
test('Test that resolveDialogComponentStore returns the dialog store instance on success', () => {
  const fake = {
    dialogToOpen: 'ProjectSettings',
    dialogUUID: 'uuid'
  }
  vi.mocked(S_DialogComponent).mockReturnValue(fake as never)

  expect(resolveDialogComponentStore()).toBe(fake)
})
