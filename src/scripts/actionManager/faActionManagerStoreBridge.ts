import { S_FaActionManager } from 'app/src/stores/S_FaActionManager'

/**
 * Adapter that resolves the action manager Pinia store on demand and tolerates Pinia not being active.
 * Lets the manager modules avoid importing the store at module-eval time (and dodges circular imports).
 */
export function resolveFaActionManagerStore (): ReturnType<typeof S_FaActionManager> | null {
  try {
    return S_FaActionManager()
  } catch {
    return null
  }
}
