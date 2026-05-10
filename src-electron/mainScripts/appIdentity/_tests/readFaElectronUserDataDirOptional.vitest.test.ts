import { beforeEach, expect, test, vi } from 'vitest'

const cfg = vi.hoisted(() => {
  return {
    mode: 'ok' as 'ok' | 'bare'
  }
})

vi.mock('electron', () => {
  return {
    app: new Proxy({} as { getPath?: () => string }, {
      get (_target, prop) {
        if (cfg.mode !== 'ok' || prop !== 'getPath') {
          return undefined
        }
        return (): string => '/mock-user-data'
      }
    })
  }
})

beforeEach(async () => {
  cfg.mode = 'ok'
  vi.resetModules()
})

test('Test readFaElectronUserDataDirOptional returns userData when getPath exists', async () => {
  const { readFaElectronUserDataDirOptional } = await import('../readFaElectronUserDataDirOptional')
  expect(readFaElectronUserDataDirOptional()).toBe('/mock-user-data')
})

test('Test readFaElectronUserDataDirOptional returns null when getPath is absent', async () => {
  cfg.mode = 'bare'
  vi.resetModules()
  const { readFaElectronUserDataDirOptional } = await import('../readFaElectronUserDataDirOptional')
  expect(readFaElectronUserDataDirOptional()).toBeNull()
})
