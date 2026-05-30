import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const runAppStartupRoutingMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/scripts/appInternals/appInternals_manager', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('app/src/scripts/appInternals/appInternals_manager')>()
  return {
    ...actual,
    runAppStartupRouting: runAppStartupRoutingMock
  }
})

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: (fn: unknown) => fn
  }
})

import faRoutingEnvBoot from '../faRoutingEnv'

beforeEach(() => {
  runAppStartupRoutingMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

const routerStub = {
  currentRoute: {
    value: {
      path: '/'
    }
  },
  push: vi.fn()
}

/**
 * faRoutingEnv boot
 * Awaits getSnapshot and forwards normalized env to runAppStartupRouting.
 */
test('Test that faRoutingEnv boot awaits getSnapshot and calls runAppStartupRouting', async () => {
  const getSnapshot = vi.fn(async () => ({
    COMPONENT_NAME: 'MyComp',
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
          getSnapshot
        }
      }
    } as unknown as Window & typeof globalThis
  })

  const boot = faRoutingEnvBoot as unknown as (args: { router: typeof routerStub }) => Promise<void>
  await boot({ router: routerStub })

  expect(getSnapshot).toHaveBeenCalledOnce()
  expect(runAppStartupRoutingMock).toHaveBeenCalledWith(
    routerStub,
    'components',
    'MyComp'
  )
})

/**
 * faRoutingEnv boot
 * Polls briefly in Electron mode when the preload bridge appears just after boot starts.
 */
test('Test that faRoutingEnv boot waits for delayed Electron preload bridge', async () => {
  vi.useFakeTimers()
  vi.stubEnv('MODE', 'electron')

  const getSnapshot = vi.fn(async () => ({
    COMPONENT_NAME: 'DelayedComp',
    COMPONENT_PROPS: false,
    ELECTRON_MAIN_FILEPATH: '/x',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'components'
  }))

  const stubWindow = {} as Window & typeof globalThis

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: stubWindow
  })

  const boot = faRoutingEnvBoot as unknown as (args: { router: typeof routerStub }) => Promise<void>
  const bootPromise = boot({ router: routerStub })

  stubWindow.faContentBridgeAPIs = {
    extraEnvVariables: {
      getSnapshot
    }
  } as unknown as typeof stubWindow.faContentBridgeAPIs

  await vi.advanceTimersByTimeAsync(50)
  await bootPromise

  expect(getSnapshot).toHaveBeenCalledOnce()
  expect(runAppStartupRoutingMock).toHaveBeenCalledWith(
    routerStub,
    'components',
    'DelayedComp'
  )
})

/**
 * faRoutingEnv boot
 * When getSnapshot rejects, runAppStartupRouting still runs with empty normalized values.
 */
test('Test that faRoutingEnv boot survives getSnapshot rejection', async () => {
  const getSnapshot = vi.fn(async () => {
    throw new Error('ipc failed')
  })

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        extraEnvVariables: {
          getSnapshot
        }
      }
    } as unknown as Window & typeof globalThis
  })

  const boot = faRoutingEnvBoot as unknown as (args: { router: typeof routerStub }) => Promise<void>
  await boot({ router: routerStub })

  expect(runAppStartupRoutingMock).toHaveBeenCalledWith(
    routerStub,
    undefined,
    undefined
  )
})

/**
 * faRoutingEnv boot
 * Without a bridge, runAppStartupRouting receives undefined normalized testing fields.
 */
test('Test that faRoutingEnv boot registers router session for workspace navigation', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {} as unknown as Window & typeof globalThis
  })

  const boot = faRoutingEnvBoot as unknown as (args: { router: typeof routerStub }) => Promise<void>
  await boot({ router: routerStub })

  const { navigateToWorkspaceWhenOnWelcomeRoute, resolveFaAppRouterCurrentPath } =
    await import('app/src/scripts/appInternals/appInternals_manager')

  expect(resolveFaAppRouterCurrentPath()).toBe('/')
  await navigateToWorkspaceWhenOnWelcomeRoute()
  expect(routerStub.push).toHaveBeenCalledWith({ path: '/home' })
})

/**
 * faRoutingEnv boot
 * Without a bridge, runAppStartupRouting receives undefined normalized testing fields.
 */
test('Test that faRoutingEnv boot handles missing bridge', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {} as unknown as Window & typeof globalThis
  })

  const boot = faRoutingEnvBoot as unknown as (args: { router: typeof routerStub }) => Promise<void>
  await boot({ router: routerStub })

  expect(runAppStartupRoutingMock).toHaveBeenCalledWith(
    routerStub,
    undefined,
    undefined
  )
})
