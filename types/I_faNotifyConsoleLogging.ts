/**
 * Subset of Quasar Notify options used by console-mirror helpers.
 */
export interface I_faQNotifyCreateOptions {
  caption?: string | undefined
  color?: string | undefined
  faSkipNotifyConsoleLog?: boolean | undefined
  message?: string | undefined
  timeout?: number | undefined
  type?: string | undefined
}

export type T_faQNotifyCreateOptionsInput = I_faQNotifyCreateOptions | string

export interface I_faNotifyLike {
  create: (opts: T_faQNotifyCreateOptionsInput) => void
}
