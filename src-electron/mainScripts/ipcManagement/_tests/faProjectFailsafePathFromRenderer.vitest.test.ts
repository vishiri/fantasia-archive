import type { IpcMainEvent, WebContents } from 'electron'

import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_FAILSAFE_IPC } from 'app/src-electron/electron-ipc-bridge'

const ipcMainOnMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => {
  return {
    ipcMain: {
      on: ipcMainOnMock
    }
  }
})

vi.mock('node:crypto', () => {
  return {
    randomUUID: (): string => {
      return 'corr-uuid-fixed'
    }
  }
})

let installModule: typeof import('../faProjectFailsafePathFromRenderer')

beforeEach(async () => {
  vi.resetModules()
  ipcMainOnMock.mockReset()
  installModule = await import('../faProjectFailsafePathFromRenderer')
})

function getReplyHandler (): (event: IpcMainEvent, payload: unknown) => void {
  const entry = ipcMainOnMock.mock.calls.find((c) => {
    return c[0] === FA_PROJECT_FAILSAFE_IPC.replyActiveProjectPathToMain
  })
  expect(entry).toBeDefined()
  return entry?.[1] as (event: IpcMainEvent, payload: unknown) => void
}

test('installFaProjectFailsafePathReplyListener registers the reply channel once', () => {
  installModule.installFaProjectFailsafePathReplyListener()
  installModule.installFaProjectFailsafePathReplyListener()
  expect(ipcMainOnMock).toHaveBeenCalledTimes(1)
  expect(ipcMainOnMock.mock.calls[0][0]).toBe(FA_PROJECT_FAILSAFE_IPC.replyActiveProjectPathToMain)
})

test('request resolves null when payload is not an object, after timeout', async () => {
  vi.useFakeTimers()
  try {
    const wc = { send: vi.fn() } as unknown as WebContents
    const p = installModule.requestRendererActiveProjectPathForFailsafe(wc)
    const handler = getReplyHandler()
    handler({} as IpcMainEvent, null)
    await vi.advanceTimersByTimeAsync(2000)
    await expect(p).resolves.toBeNull()
  } finally {
    vi.useRealTimers()
  }
})

test('request resolves trimmed valid absolute path from renderer reply', async () => {
  const absolutePath = 'D:\\world\\p.faproject'
  const wc = { send: vi.fn() } as unknown as WebContents
  const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
  const handler = getReplyHandler()
  handler({} as IpcMainEvent, {
    correlationId: 'corr-uuid-fixed',
    filePath: `  ${absolutePath}  `
  })
  await expect(pending).resolves.toBe(absolutePath)
})

test('request resolves null when filePath fails pathLooksLikeFaProjectFile', async () => {
  const wc = { send: vi.fn() } as unknown as WebContents
  const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
  const handler = getReplyHandler()
  handler({} as IpcMainEvent, {
    correlationId: 'corr-uuid-fixed',
    filePath: 'relative-only.faproject'
  })
  await expect(pending).resolves.toBeNull()
})

test('unknown correlation id times out with null', async () => {
  vi.useFakeTimers()
  try {
    const wc = { send: vi.fn() } as unknown as WebContents
    const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
    const handler = getReplyHandler()
    handler({} as IpcMainEvent, {
      correlationId: 'wrong-id',
      filePath: 'D:\\x\\y.faproject'
    })
    await vi.advanceTimersByTimeAsync(2000)
    await expect(pending).resolves.toBeNull()
  } finally {
    vi.useRealTimers()
  }
})

test('non-string correlation id in reply is treated as empty and does not clear the pending request', async () => {
  vi.useFakeTimers()
  try {
    const wc = { send: vi.fn() } as unknown as WebContents
    const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
    const handler = getReplyHandler()
    handler({} as IpcMainEvent, {
      correlationId: 999,
      filePath: 'D:\\world\\p.faproject'
    })
    await vi.advanceTimersByTimeAsync(2000)
    await expect(pending).resolves.toBeNull()
  } finally {
    vi.useRealTimers()
  }
})

test('timeout deletes pending entry so stuck resolve is skipped safely', async () => {
  vi.useFakeTimers()
  try {
    const wc = { send: vi.fn() } as unknown as WebContents
    const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
    getReplyHandler()
    await vi.advanceTimersByTimeAsync(2000)
    await expect(pending).resolves.toBeNull()
  } finally {
    vi.useRealTimers()
  }
})

test('request resolves null when correlation matches but filePath is empty', async () => {
  const wc = { send: vi.fn() } as unknown as WebContents
  const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
  const handler = getReplyHandler()
  handler({} as IpcMainEvent, {
    correlationId: 'corr-uuid-fixed',
    filePath: ''
  })
  await expect(pending).resolves.toBeNull()
})

test('request resolves null when filePath is not a string', async () => {
  const wc = { send: vi.fn() } as unknown as WebContents
  const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
  const handler = getReplyHandler()
  handler({} as IpcMainEvent, {
    correlationId: 'corr-uuid-fixed',
    filePath: 12345
  })
  await expect(pending).resolves.toBeNull()
})

test('timeout fires after reply without rejecting a settled request', async () => {
  vi.useFakeTimers()
  try {
    const wc = { send: vi.fn() } as unknown as WebContents
    const pending = installModule.requestRendererActiveProjectPathForFailsafe(wc)
    const handler = getReplyHandler()
    handler({} as IpcMainEvent, {
      correlationId: 'corr-uuid-fixed',
      filePath: 'D:\\world\\p.faproject'
    })
    await expect(pending).resolves.toBe('D:\\world\\p.faproject')
    await vi.advanceTimersByTimeAsync(2000)
  } finally {
    vi.useRealTimers()
  }
})
