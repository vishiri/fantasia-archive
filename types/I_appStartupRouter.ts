/**
 * Minimal router surface used while wiring startup-time navigation from non-Vue modules.
 */
export interface I_appStartupRouter {
  push: (payload: { path: string }) => void | Promise<unknown>
}
