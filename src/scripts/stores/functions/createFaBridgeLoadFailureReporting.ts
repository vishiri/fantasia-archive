import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

export function createFaBridgeLoadFailureReporting (deps: {
  ResultAsync: T_injectedResultAsync
  runFaAction: (
    id: 'reportBridgeLoadFailure',
    payload: { message: string }
  ) => void
}): {
    hydrateFromBridgeOrReport: (action: () => Promise<unknown>) => Promise<void>
    reportFaBridgeLoadFailure: (message: string) => void
  } {
  const reportFaBridgeLoadFailure = (message: string): void => {
    void deps.runFaAction('reportBridgeLoadFailure', { message })
  }

  const hydrateFromBridgeOrReport = async (
    action: () => Promise<unknown>
  ): Promise<void> => {
    const result = await deps.ResultAsync.fromPromise(
      action(),
      (error): unknown => error
    )
    if (result.isErr()) {
      const error = result.error
      const message = error instanceof Error ? error.message : String(error)
      reportFaBridgeLoadFailure(message)
    }
  }

  return {
    hydrateFromBridgeOrReport,
    reportFaBridgeLoadFailure
  }
}
