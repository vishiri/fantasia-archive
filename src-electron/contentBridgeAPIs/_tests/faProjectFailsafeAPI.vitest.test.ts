import { afterEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_FAILSAFE_IPC } from 'app/src-electron/electron-ipc-bridge'

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

import { faProjectFailsafeAPI } from '../faProjectFailsafeAPI'

afterEach(() => {
  ipcRendererOnMock.mockReset()
  ipcRendererSendMock.mockReset()
})

test('faProjectFailsafeAPI installActiveProjectPathReply registers once and replies on request', () => {
  const getPath = vi.fn((): string | null => 'D:\\p\\a.faproject')
  faProjectFailsafeAPI.installActiveProjectPathReply(getPath)
  faProjectFailsafeAPI.installActiveProjectPathReply(getPath)
  expect(ipcRendererOnMock).toHaveBeenCalledTimes(1)
  expect(ipcRendererOnMock).toHaveBeenCalledWith(
    FA_PROJECT_FAILSAFE_IPC.requestActiveProjectPathFromRenderer,
    expect.any(Function)
  )
  const listener = ipcRendererOnMock.mock.calls[0]![1]! as (
    event: unknown,
    correlationId: unknown
  ) => void
  listener({} as never, 'cid-1')
  expect(getPath).toHaveBeenCalledOnce()
  expect(ipcRendererSendMock).toHaveBeenCalledWith(
    FA_PROJECT_FAILSAFE_IPC.replyActiveProjectPathToMain,
    {
      correlationId: 'cid-1',
      filePath: 'D:\\p\\a.faproject'
    }
  )
  getPath.mockReturnValueOnce(null)
  ipcRendererSendMock.mockClear()
  listener({} as never, 404)
  expect(getPath).toHaveBeenCalledTimes(2)
  expect(ipcRendererSendMock).toHaveBeenCalledWith(
    FA_PROJECT_FAILSAFE_IPC.replyActiveProjectPathToMain,
    {
      correlationId: '',
      filePath: null
    }
  )
})
