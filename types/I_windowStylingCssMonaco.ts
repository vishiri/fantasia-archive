/**
 * Minimal Monaco editor surface injected into window styling factories.
 */
export interface I_windowStylingMonacoEnvironment {
  __faConfigured?: boolean
  getWorker?: (moduleId: string, label: string) => Worker
}

export interface I_windowStylingMonacoApi {
  Environment?: I_windowStylingMonacoEnvironment
  editor?: unknown
  languages?: {
    css?: {
      cssDefaults?: {
        setOptions?: (options: Record<string, unknown>) => void
      }
    }
  }
}
