import { afterEach, expect, test, vi } from 'vitest'

const registerFaE2eActiveProjectSnapshotProbeMock = vi.hoisted(() => vi.fn())

vi.mock('app/src/scripts/e2e/e2e_manager', () => ({
  registerFaE2eActiveProjectSnapshotProbe: registerFaE2eActiveProjectSnapshotProbeMock
}))

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: (fn: unknown) => fn
  }
})

import { resolveFaRendererProbeTestEnvFromBridge } from '../scripts/functions/createRunFaE2eRendererProbesBoot'
import faE2eRendererProbesBoot from '../faE2eRendererProbes'

afterEach(() => {
  vi.unstubAllEnvs()
  registerFaE2eActiveProjectSnapshotProbeMock.mockReset()
})

/**
 * faE2eRendererProbes boot
 * Registers the active-project probe only in Electron when TEST_ENV is 'e2e'.
 */
test('Test that faE2eRendererProbes boot installs probe when TEST_ENV is e2e', async () => {
  vi.stubEnv('MODE', 'electron')
  const getCachedSnapshot = vi.fn(() => ({
    COMPONENT_NAME: '',
    COMPONENT_PROPS: false,
    ELECTRON_MAIN_FILEPATH: '/x',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'e2e'
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot,
          getSnapshot: vi.fn()
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faE2eRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaE2eActiveProjectSnapshotProbeMock).toHaveBeenCalledOnce()
})

/**
 * faE2eRendererProbes boot
 * Awaits getSnapshot when the preload cache is still empty at boot time.
 */
test('Test that faE2eRendererProbes boot awaits getSnapshot when cache is empty', async () => {
  vi.stubEnv('MODE', 'electron')
  const getSnapshot = vi.fn(async () => ({
    COMPONENT_NAME: '',
    COMPONENT_PROPS: false,
    ELECTRON_MAIN_FILEPATH: '/x',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'e2e'
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot: vi.fn(() => null),
          getSnapshot
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faE2eRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(getSnapshot).toHaveBeenCalledOnce()
  expect(registerFaE2eActiveProjectSnapshotProbeMock).toHaveBeenCalledOnce()
})

/**
 * resolveFaRendererProbeTestEnvFromBridge
 * Returns undefined when the preload bridge does not expose getSnapshot.
 */
test('Test that resolveFaRendererProbeTestEnvFromBridge returns undefined without getSnapshot', async () => {
  await expect(resolveFaRendererProbeTestEnvFromBridge({})).resolves.toBeUndefined()
  await expect(resolveFaRendererProbeTestEnvFromBridge(undefined)).resolves.toBeUndefined()
})

/**
 * faE2eRendererProbes boot
 */
test('Test that faE2eRendererProbes boot skips probe when MODE is not electron', async () => {
  vi.stubEnv('MODE', 'spa')
  const boot = faE2eRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaE2eActiveProjectSnapshotProbeMock).not.toHaveBeenCalled()
})

/**
 * faE2eRendererProbes boot
 */
test('Test that faE2eRendererProbes boot skips probe when TEST_ENV is not e2e', async () => {
  vi.stubEnv('MODE', 'electron')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot: vi.fn(() => ({
            COMPONENT_NAME: '',
            COMPONENT_PROPS: false,
            ELECTRON_MAIN_FILEPATH: '/x',
            FA_FRONTEND_RENDER_TIMER: 0,
            TEST_ENV: 'components'
          })),
          getSnapshot: vi.fn()
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faE2eRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaE2eActiveProjectSnapshotProbeMock).not.toHaveBeenCalled()
})

/**
 * faE2eRendererProbes boot
 * Non-string TEST_ENV values are treated as absent so the probe is not registered.
 */
test('Test that faE2eRendererProbes boot skips probe when TEST_ENV is not a string', async () => {
  vi.stubEnv('MODE', 'electron')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getCachedSnapshot: vi.fn(() => ({
            COMPONENT_NAME: '',
            COMPONENT_PROPS: false,
            ELECTRON_MAIN_FILEPATH: '/x',
            FA_FRONTEND_RENDER_TIMER: 0,
            TEST_ENV: false
          })),
          getSnapshot: vi.fn()
        }
      }
    } as unknown as Window & typeof globalThis
  })
  const boot = faE2eRendererProbesBoot as unknown as () => Promise<void>
  await boot()
  expect(registerFaE2eActiveProjectSnapshotProbeMock).not.toHaveBeenCalled()
})
