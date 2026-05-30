export function createFaBridgeLoadFailureReporting (deps: {
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
    try {
      await action()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      reportFaBridgeLoadFailure(message)
    }
  }

  return {
    hydrateFromBridgeOrReport,
    reportFaBridgeLoadFailure
  }
}
