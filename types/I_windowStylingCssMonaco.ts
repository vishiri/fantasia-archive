/**
 * Minimal Monaco editor surface injected into window styling factories.
 */
export interface I_windowStylingMonacoEnvironment {
  __faConfigured?: boolean | undefined
  getWorker?: (moduleId: string, label: string) => Worker | undefined
}

export interface I_windowStylingMonacoApi {
  Environment?: I_windowStylingMonacoEnvironment | undefined
  editor?: unknown | undefined
  languages?: {
    css?: {
      cssDefaults?: {
        setOptions?: (options: Record<string, unknown>) => void
      }
    }
  } | undefined
}
