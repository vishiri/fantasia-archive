/** Injected clock and sleep for project OS-open bridge polling in boot. */
export type T_faProjectOsOpenBridgePollDeps = {
  nowMs: () => number
  sleepMs: (ms: number) => Promise<void>
  hasProjectOsOpenBridge: () => boolean
}

/** Injected clock and sleep while waiting for preload extra-env snapshot in boot. */
export type T_faRoutingEnvBridgePollDeps = {
  isElectronMode: boolean
  nowMs: () => number
  sleepMs: (ms: number) => Promise<void>
  hasExtraEnvSnapshot: () => boolean
}
