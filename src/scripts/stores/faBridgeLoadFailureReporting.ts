import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'

/**
 * Routes a bridge hydration failure through the action manager's single error toast surface.
 */
export function reportFaBridgeLoadFailure (message: string): void {
  void runFaAction('reportBridgeLoadFailure', { message })
}

/**
 * Runs a bridge hydration task and reports failures through the action manager instead of duplicating toasts.
 */
export async function hydrateFromBridgeOrReport (action: () => Promise<unknown>): Promise<void> {
  try {
    await action()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    reportFaBridgeLoadFailure(message)
  }
}
