/**
 * Subset of Quasar Notify options used by console-mirror helpers.
 */
export interface I_faQNotifyCreateOptions {
  caption?: string
  color?: string
  faSkipNotifyConsoleLog?: boolean
  message?: string
  timeout?: number
  type?: string
}

export type T_faQNotifyCreateOptionsInput = I_faQNotifyCreateOptions | string

export interface I_faNotifyLike {
  create: (opts: T_faQNotifyCreateOptionsInput) => void
}
