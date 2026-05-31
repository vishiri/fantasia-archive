import { afterEach, expect, test, vi } from 'vitest'

const registerFaComponentTestingStoreSeedProbeMock = vi.hoisted(() => vi.fn())

vi.mock('app/src/scripts/componentTesting/componentTesting_manager', () => ({
  registerFaComponentTestingStoreSeedProbe: registerFaComponentTestingStoreSeedProbeMock
}))

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: (fn: unknown) => fn
  }
})

import faComponentTestingRendererProbesBoot from '../faComponentTestingRendererProbes'

afterEach(() => {
  vi.unstubAllEnvs()
  registerFaComponentTestingStoreSeedProbeMock.mockReset()
})

/**
 * faComponentTestingRendererProbes boot
 * Registers the store seed probe only in Electron when cached TEST_ENV is 'components'.
 */
test('Test that faComponentTestingRendererProbes boot registers probe when TEST_ENV is components', async () => {
  vi.stubEnv('MODE', 'electron')
  const getCachedSnapshot = vi.fn(() => ({
    COMPONENT_NAME: '',
    COMPONENT_PROPS: false,
    ELECTRON_MAIN_FILEPATH: '/x',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'components'
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faComponentTestingRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaComponentTestingStoreSeedProbeMock).toHaveBeenCalledOnce()
})

/**
 * faComponentTestingRendererProbes boot
 * Skips registration outside Electron mode.
 */
test('Test that faComponentTestingRendererProbes boot skips outside electron mode', async () => {
  vi.stubEnv('MODE', 'spa')
  const getCachedSnapshot = vi.fn(() => ({
    TEST_ENV: 'components'
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faComponentTestingRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaComponentTestingStoreSeedProbeMock).not.toHaveBeenCalled()
})

/**
 * faComponentTestingRendererProbes boot
 * Skips registration when TEST_ENV is not components.
 */
test('Test that faComponentTestingRendererProbes boot skips when TEST_ENV is not a string', async () => {
  vi.stubEnv('MODE', 'electron')
  const getCachedSnapshot = vi.fn(() => ({
    TEST_ENV: 1
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faComponentTestingRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaComponentTestingStoreSeedProbeMock).not.toHaveBeenCalled()
})

test('Test that faComponentTestingRendererProbes boot skips when extraEnv is missing', async () => {
  vi.stubEnv('MODE', 'electron')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {} as unknown as Window & typeof globalThis
  })
  const boot = faComponentTestingRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaComponentTestingStoreSeedProbeMock).not.toHaveBeenCalled()
})

test('Test that faComponentTestingRendererProbes boot skips for e2e TEST_ENV', async () => {
  vi.stubEnv('MODE', 'electron')
  const getCachedSnapshot = vi.fn(() => ({
    TEST_ENV: 'e2e'
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faComponentTestingRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaComponentTestingStoreSeedProbeMock).not.toHaveBeenCalled()
})
