/**
 * Fantasia-only options merged into Quasar notify payloads.
 * Loaded from the notify boot file; keep this module as a side-effect import.
 */
declare module 'quasar' {
  export interface QNotifyCreateOptions {
    /**
     * Skip the boot-time console mirror when this notification is paired with a caller-owned console line.
     */
    faSkipNotifyConsoleLog?: boolean | undefined
  }
}

export {}
