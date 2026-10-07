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
test('Test that runDialogNewProjectCreate stays open when the name changes during create', async () => {
  const runFaActionAwaitMock = vi.mocked(runFaActionAwait)
  let liveName = 'Alpha'
  runFaActionAwaitMock.mockImplementationOnce(async () => {
    liveName = 'Alpha revised'
    return true
  })
  const closeDialog = vi.fn()
  await runDialogNewProjectCreate('Alpha', closeDialog, () => liveName)
  expect(runFaActionAwaitMock).toHaveBeenCalledWith('createNewProject', { projectName: 'Alpha' })
  expect(closeDialog).not.toHaveBeenCalled()
})

test('Test that a second new project create is ignored while the first create is in flight', async () => {
  const runFaActionAwaitMock = vi.mocked(runFaActionAwait)
  runFaActionAwaitMock.mockClear()
  let releaseCreate: (() => void) | undefined
  const createGate = new Promise<boolean>((resolve) => {
    releaseCreate = () => {
      resolve(true)
    }
  })
  runFaActionAwaitMock.mockImplementationOnce(() => createGate)
  const closeDialog = vi.fn()
  const firstCreate = runDialogNewProjectCreate('Alpha', closeDialog)
  const secondCreate = runDialogNewProjectCreate('Alpha', closeDialog)
  await Promise.resolve()
  expect(runFaActionAwaitMock).toHaveBeenCalledTimes(1)
  const finishCreate = releaseCreate
  if (finishCreate === undefined) {
    throw new Error('missing create resolver')
  }
  finishCreate()
  await firstCreate
  await secondCreate
  expect(runFaActionAwaitMock).toHaveBeenCalledTimes(1)
  expect(closeDialog).toHaveBeenCalledTimes(1)
})

test('Test that runDialogNewProjectCreate does not close when createNewProject fails', async () => {
  const runFaActionAwaitMock = vi.mocked(runFaActionAwait)
  runFaActionAwaitMock.mockResolvedValueOnce(false)
  const closeDialog = vi.fn()
  await runDialogNewProjectCreate('Beta', closeDialog)
  expect(closeDialog).not.toHaveBeenCalled()
})
