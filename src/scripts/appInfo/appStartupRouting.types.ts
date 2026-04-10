export interface I_appStartupRouter {
  push: (payload: { path: string }) => void | Promise<unknown>
}
