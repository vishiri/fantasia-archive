import { afterEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

const ipcRendererOnMock = vi.hoisted(() => vi.fn())
const ipcRendererSendMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      on: ipcRendererOnMock,
      send: ipcRendererSendMock
    }
  }
})

import { faProjectOsOpenAPI } from '../faProjectOsOpenAPI'

afterEach(() => {
  ipcRendererOnMock.mockReset()
  ipcRendererSendMock.mockReset()
})

/**
 * faProjectOsOpenAPI
 *
 * installOsOpenListener
 * Registers once and forwards non-empty file paths from main.
 */
test('Test that installOsOpenListener is idempotent and invokes callback on payload', () => {
  const onOpen = vi.fn()
  faProjectOsOpenAPI.installOsOpenListener(onOpen)
  faProjectOsOpenAPI.installOsOpenListener(onOpen)
  expect(ipcRendererOnMock).toHaveBeenCalledTimes(1)
  expect(ipcRendererOnMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    expect.any(Function)
  )
  const handler = ipcRendererOnMock.mock.calls[0][1] as (
    event: unknown,
    payload: unknown
  ) => void
  handler({} as never, { filePath: 'D:\\a\\p.faproject' })
  expect(onOpen).toHaveBeenCalledWith('D:\\a\\p.faproject')
  onOpen.mockClear()
  handler({} as never, { filePath: '  ' })
  expect(onOpen).not.toHaveBeenCalled()
  handler({} as never, { filePath: 123 })
  expect(onOpen).not.toHaveBeenCalled()
  handler({} as never, {})
  expect(onOpen).not.toHaveBeenCalled()
  handler({} as never, null)
  expect(onOpen).not.toHaveBeenCalled()
})

/**
 * faProjectOsOpenAPI
 *
 * sendRendererReady
 * Posts the one-shot ready channel for main to flush queued paths.
 */
test('Test that sendRendererReady notifies main over ipcRenderer.send', () => {
  faProjectOsOpenAPI.sendRendererReady()
  expect(ipcRendererSendMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.rendererReadyToMain
  )
})
