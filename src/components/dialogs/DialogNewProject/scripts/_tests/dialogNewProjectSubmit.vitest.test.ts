import { expect, test, vi } from 'vitest'

import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { runDialogNewProjectCreate } from '../dialogNewProject_manager'

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaActionAwait: vi.fn()
}))

/**
 * runDialogNewProjectCreate
 * Should forward the trimmed name through the action manager and close on success.
 */
test('Test that runDialogNewProjectCreate asks createNewProject and closes on success', async () => {
  const runFaActionAwaitMock = vi.mocked(runFaActionAwait)
  runFaActionAwaitMock.mockResolvedValueOnce(true)
  const closeDialog = vi.fn()
  await runDialogNewProjectCreate('Alpha', closeDialog)
  expect(runFaActionAwaitMock).toHaveBeenCalledWith('createNewProject', { projectName: 'Alpha' })
  expect(closeDialog).toHaveBeenCalledTimes(1)
})

/**
 * runDialogNewProjectCreate
 * Should omit close when creation action reports failure.
 */
test('Test that runDialogNewProjectCreate does not close when createNewProject fails', async () => {
  const runFaActionAwaitMock = vi.mocked(runFaActionAwait)
  runFaActionAwaitMock.mockResolvedValueOnce(false)
  const closeDialog = vi.fn()
  await runDialogNewProjectCreate('Beta', closeDialog)
  expect(closeDialog).not.toHaveBeenCalled()
})
