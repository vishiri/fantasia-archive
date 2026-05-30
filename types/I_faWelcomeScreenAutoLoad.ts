/** Whether welcome auto-load ran from boot or from an explicit user action. */
export type T_faWelcomeScreenAutoLoadInvocation = 'automatic' | 'user'

/** Resolved welcome-screen auto-load target before opening a project. */
export type T_faWelcomeScreenAutoLoadTarget =
  | {
    kind: 'none'
  }
  | {
    filePath: string
    kind: 'activeSession'
  }
  | {
    filePath: string
    kind: 'mruHead'
  }
  | {
    displayName: string
    filePath: string
    kind: 'mruHeadMissing'
  }
