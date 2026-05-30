import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'
import type { I_vueRouter } from 'app/types/I_vueRouterShims'

export function createRunFaRoutingEnvBoot (deps: {
  getMode: () => string | undefined
  nowMs: () => number
  sleepMs: (ms: number) => Promise<void>
  hasExtraEnvSnapshot: () => boolean
  getExtraEnvSnapshot: () => Promise<I_extraEnvVariablesAPI | undefined>
  registerFaAppRouterSession: (args: {
    getCurrentPath: () => string
    push: (payload: unknown) => void | Promise<unknown>
  }) => void
  runAppStartupRouting: (
    router: I_vueRouter,
    testingType: string | undefined,
    testingComponentName: string | undefined
  ) => Promise<void>
  waitForPreloadExtraEnvBridgeWhenElectron: (args: {
    hasExtraEnvSnapshot: () => boolean
    isElectronMode: boolean
    nowMs: () => number
    sleepMs: (ms: number) => Promise<void>
  }) => Promise<void>
}): (args: { router: I_vueRouter }) => Promise<void> {
  return async function runFaRoutingEnvBoot ({ router }: { router: I_vueRouter }): Promise<void> {
    deps.registerFaAppRouterSession({
      getCurrentPath (): string {
        return router.currentRoute.value.path
      },
      push (payload): void | Promise<unknown> {
        return router.push(payload as never)
      }
    })

    await deps.waitForPreloadExtraEnvBridgeWhenElectron({
      hasExtraEnvSnapshot: deps.hasExtraEnvSnapshot,
      isElectronMode: deps.getMode() === 'electron',
      nowMs: deps.nowMs,
      sleepMs: deps.sleepMs
    })

    const extra = await deps.getExtraEnvSnapshot()

    const testingType = extra?.TEST_ENV ?? ''
    const testingComponentName = extra?.COMPONENT_NAME ?? ''

    const normalizedTestingType = testingType || undefined
    const normalizedTestingComponentName = testingComponentName || undefined

    await deps.runAppStartupRouting(
      router,
      normalizedTestingType,
      normalizedTestingComponentName
    )
  }
}
