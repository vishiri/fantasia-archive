import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const installMock = vi.hoisted(() => vi.fn())
const activeProjectMock = vi.hoisted(() => {
  return vi.fn((): { activeProject: { filePath: string } | undefined } => {
    return {
      activeProject: { filePath: 'D:\\t\\p.faproject' }
    }
  })
})

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: (fn: unknown) => {
      return fn
    }
  }
})

vi.mock('app/src/stores/S_FaActiveProject', () => {
  return {
    S_FaActiveProject: activeProjectMock
  }
})

import faProjectFailsafePathReply from '../faProjectFailsafePathReply'

beforeEach(() => {
  installMock.mockReset()
  activeProjectMock.mockImplementation(() => {
    return {
      activeProject: { filePath: 'D:\\t\\p.faproject' }
    }
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

test('faProjectFailsafePathReply installs bridge callback in electron mode', () => {
  vi.stubEnv('MODE', 'electron')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faProjectFailsafe: {
          installActiveProjectPathReply: installMock
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const run = faProjectFailsafePathReply as () => void
  run()
  expect(installMock).toHaveBeenCalledOnce()
  const getPath = installMock.mock.calls[0]![0]! as () => string | null
  expect(getPath()).toBe('D:\\t\\p.faproject')
})

test('faProjectFailsafePathReply skips work outside electron mode', () => {
  vi.stubEnv('MODE', 'spa')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faProjectFailsafe: {
          installActiveProjectPathReply: installMock
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const run = faProjectFailsafePathReply as () => void
  run()
  expect(installMock).not.toHaveBeenCalled()
})

test('faProjectFailsafePathReply tolerates missing faProjectFailsafe on the bridge object', () => {
  vi.stubEnv('MODE', 'electron')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {}
    } as unknown as Window & typeof globalThis
  })
  const run = faProjectFailsafePathReply as () => void
  run()
  expect(installMock).not.toHaveBeenCalled()
})

test('faProjectFailsafePathReply supplies null when no active project is open', () => {
  vi.stubEnv('MODE', 'electron')
  activeProjectMock.mockImplementationOnce(() => {
    return {
      activeProject: undefined
    }
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faProjectFailsafe: {
          installActiveProjectPathReply: installMock
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const run = faProjectFailsafePathReply as () => void
  run()
  const getPath = installMock.mock.calls[0]![0]! as () => string | null
  expect(getPath()).toBeNull()
})
