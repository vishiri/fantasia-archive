import { expect, test, vi } from 'vitest'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

const onRendererReadyMock = vi.hoisted(() => vi.fn())

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectOsOpenDelivery', () => {
  return {
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

import { registerFaProjectOsOpenIpc } from '../registerFaProjectOsOpenIpc'

/**
 * registerFaProjectOsOpenIpc
 *
 * Installs a single ipcMain listener that forwards to the delivery helper.
 */
test('Test that registerFaProjectOsOpenIpc registers once and routes renderer ready', () => {
  registerFaProjectOsOpenIpc()
  registerFaProjectOsOpenIpc()
  expect(ipcMainOnMock).toHaveBeenCalledTimes(1)
  expect(ipcMainOnMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.rendererReadyToMain,
    expect.any(Function)
  )
  const handler = ipcMainOnMock.mock.calls[0][1] as () => void
  handler()
  expect(onRendererReadyMock).toHaveBeenCalledOnce()
})
