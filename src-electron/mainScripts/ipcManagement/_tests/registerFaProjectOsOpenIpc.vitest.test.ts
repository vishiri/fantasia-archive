import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

const onRendererReadyMock = vi.hoisted(() => vi.fn())
const isSenderReadyMock = vi.hoisted(() => vi.fn(() => true))

vi.mock('app/src-electron/mainScripts/projectManagement/projectManagement_manager', () => {
  return {
    isFaProjectOsOpenRendererReadySender: isSenderReadyMock,
    onFaProjectOsOpenRendererReady: onRendererReadyMock
  }
})

const ipcMainOnMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => {
  return {
    ipcMain: {
      on: ipcMainOnMock
    }
  }
})

beforeEach(() => {
  vi.resetModules()
  onRendererReadyMock.mockReset()
  isSenderReadyMock.mockReset()
  isSenderReadyMock.mockReturnValue(true)
  ipcMainOnMock.mockReset()
})

/**
 * registerFaProjectOsOpenIpc
 *
 * Installs a single ipcMain listener that forwards to the delivery helper.
 */
test('Test that registerFaProjectOsOpenIpc registers once and routes renderer ready', async () => {
  const { registerFaProjectOsOpenIpc } = await import('../registerFaProjectOsOpenIpc')
  isSenderReadyMock.mockReturnValue(true)
  registerFaProjectOsOpenIpc()
  registerFaProjectOsOpenIpc()
  expect(ipcMainOnMock).toHaveBeenCalledTimes(1)
  expect(ipcMainOnMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.rendererReadyToMain,
    expect.any(Function)
  )
  const handler = ipcMainOnMock.mock.calls[0]![1]! as (event: { sender: unknown }) => void
  handler({ sender: { id: 1 } })
  expect(onRendererReadyMock).toHaveBeenCalledOnce()
})

/**
 * registerFaProjectOsOpenIpc
 * Ignores renderer ready from non-main senders.
 */
test('Test that registerFaProjectOsOpenIpc ignores renderer ready from foreign sender', async () => {
  const { registerFaProjectOsOpenIpc } = await import('../registerFaProjectOsOpenIpc')
  isSenderReadyMock.mockReturnValue(false)
  registerFaProjectOsOpenIpc()
  const handler = ipcMainOnMock.mock.calls[0]![1]! as (event: { sender: unknown }) => void
  handler({ sender: { id: 99 } })
  expect(onRendererReadyMock).not.toHaveBeenCalled()
})
