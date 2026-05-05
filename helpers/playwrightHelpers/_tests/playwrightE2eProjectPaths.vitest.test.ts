import fs from 'node:fs'
import path from 'node:path'

import { afterEach, expect, test, vi } from 'vitest'

vi.mock('../playwrightUserDataReset', () => {
  return {
    getFaPlaywrightIsolatedUserDataDir: vi.fn(() => path.join('C:', 'iso', 'ud'))
  }
})

import {
  e2eSetNextProjectCreatePath,
  tryUnlinkE2eFaprojectFixture
} from '../playwrightE2eProjectPaths'

afterEach(() => {
  vi.clearAllMocks()
  const g = globalThis as unknown as Record<string, unknown>
  delete g.__faE2eSetNextProjectCreatePath
})

test('e2eSetNextProjectCreatePath runs evaluate payload against globalThis setter', async () => {
  const setter = vi.fn()
  const g = globalThis as unknown as Record<string, ((v: string) => void) | undefined>
  g.__faE2eSetNextProjectCreatePath = setter
  const evaluate = vi.fn(async (fn: (exp: unknown, arg: { k: string, p: string }) => void, arg: { k: string, p: string }) => {
    fn({}, arg)
  })
  const electronApp = {
    evaluate
  } as unknown as import('playwright').ElectronApplication
  await e2eSetNextProjectCreatePath(electronApp, 'my.faproject')
  expect(setter).toHaveBeenCalledWith(path.join('C:', 'iso', 'ud', 'my.faproject'))
  expect(evaluate).toHaveBeenCalledOnce()
})

test('e2eSetNextProjectCreatePath evaluate no-ops when setter is absent on globalThis', async () => {
  const g = globalThis as unknown as Record<string, unknown>
  delete g.__faE2eSetNextProjectCreatePath
  const evaluate = vi.fn(async (fn: (exp: unknown, arg: { k: string, p: string }) => void, arg: { k: string, p: string }) => {
    expect(() => {
      fn({}, arg)
    }).not.toThrow()
  })
  const electronApp = {
    evaluate
  } as unknown as import('playwright').ElectronApplication
  await e2eSetNextProjectCreatePath(electronApp, 'orphan.faproject')
})

test('tryUnlinkE2eFaprojectFixture removes file under isolated userData', () => {
  const spy = vi.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined)
  tryUnlinkE2eFaprojectFixture('x.faproject')
  expect(spy).toHaveBeenCalledWith(path.join('C:', 'iso', 'ud', 'x.faproject'))
  spy.mockRestore()
})
