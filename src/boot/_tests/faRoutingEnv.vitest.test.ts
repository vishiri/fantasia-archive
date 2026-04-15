import { beforeEach, expect, test, vi } from 'vitest'

const runAppStartupRoutingMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/scripts/appInternals/rendererAppInternals', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('app/src/scripts/appInternals/rendererAppInternals')>()
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

const routerStub = {
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
