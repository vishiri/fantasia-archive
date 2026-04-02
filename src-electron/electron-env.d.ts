declare namespace NodeJS {
  interface ProcessEnv {
    APP_URL?: string
    /** Present when running under Quasar dev / Vite. */
    DEV?: string
    DEBUGGING?: string
    QUASAR_ELECTRON_PRELOAD_FOLDER: string
    QUASAR_ELECTRON_PRELOAD_EXTENSION: string
  }
}
