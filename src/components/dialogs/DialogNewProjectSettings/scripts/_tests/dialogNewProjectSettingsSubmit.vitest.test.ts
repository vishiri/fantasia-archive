import { beforeEach, expect, test, vi } from 'vitest'

const { notifyCreateMock, runFaActionAwaitMock } = vi.hoisted(() => ({
  notifyCreateMock: vi.fn(),
  runFaActionAwaitMock: vi.fn()
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => ({
  runFaAction: vi.fn(),
  runFaActionAwait: runFaActionAwaitMock
}))

vi.mock('quasar', () => ({
  Notify: {
    create: notifyCreateMock
  }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: {
    global: {
      t: (key: string) => key
    }
  }
}))

import { runDialogNewProjectSettingsCreate } from '../dialogNewProjectSettingsSubmit'

beforeEach(() => {
  notifyCreateMock.mockReset()
  runFaActionAwaitMock.mockReset()
})

/**
 * runDialogNewProjectSettingsCreate
 * Failure from the action manager skips close and skips a positive toast.
 */
test('skips notify and close when create action returns false', async () => {
  runFaActionAwaitMock.mockResolvedValue(false)
  const closeDialog = vi.fn()
  await runDialogNewProjectSettingsCreate('Alpha', closeDialog)
  expect(runFaActionAwaitMock).toHaveBeenCalledWith('createNewProject', { projectName: 'Alpha' })
  expect(notifyCreateMock).not.toHaveBeenCalled()
  expect(closeDialog).not.toHaveBeenCalled()
})

/**
 * runDialogNewProjectSettingsCreate
 * Success closes the dialog and surfaces a positive notification.
 */
test('notifies and closes when create action returns true', async () => {
  runFaActionAwaitMock.mockResolvedValue(true)
  const closeDialog = vi.fn()
  await runDialogNewProjectSettingsCreate('Beta', closeDialog)
  expect(notifyCreateMock).toHaveBeenCalledTimes(1)
  expect(notifyCreateMock.mock.calls[0]?.[0]).toEqual({
    message: 'dialogs.newProjectSettings.notifyCreated',
    type: 'positive'
  })
  expect(closeDialog).toHaveBeenCalledTimes(1)
})
