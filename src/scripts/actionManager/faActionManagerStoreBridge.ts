import { Result } from 'neverthrow'

import { S_FaActionManager } from 'app/src/stores/S_FaActionManager'

/**
 * Adapter that resolves the action manager Pinia store on demand and tolerates Pinia not being active.
 * Lets the manager modules avoid importing the store at module-eval time (and dodges circular imports).
 */
export function resolveFaActionManagerStore (): ReturnType<typeof S_FaActionManager> | null {
  return Result.fromThrowable(
    (): ReturnType<typeof S_FaActionManager> => S_FaActionManager(),
    (): null => null
  )().unwrapOr(null)
}
