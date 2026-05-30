import type {
  I_windowStylingMonacoApi,
  I_windowStylingMonacoEnvironment
} from 'app/types/I_windowStylingCssMonaco'

function configureWindowStylingMonacoEnvironment (deps: {
  CssWorker: new () => Worker
  EditorWorker: new () => Worker
  getMonacoEnvironment: () => I_windowStylingMonacoEnvironment | undefined
  setMonacoEnvironment: (env: I_windowStylingMonacoEnvironment) => void
}): void {
  const env = deps.getMonacoEnvironment()
  if (env !== undefined && env.__faConfigured === true) {
    return
  }
  const next: I_windowStylingMonacoEnvironment = {
    getWorker (_workerId: string, label: string): Worker {
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new deps.CssWorker()
      }
      return new deps.EditorWorker()
    },
    __faConfigured: true
  }
  deps.setMonacoEnvironment(next)
}

export function createWindowStylingCssMonaco (deps: {
  CssWorker: new () => Worker
  EditorWorker: new () => Worker
  getMonacoEnvironment: () => I_windowStylingMonacoEnvironment | undefined
  monaco: I_windowStylingMonacoApi
  setMonacoEnvironment: (env: I_windowStylingMonacoEnvironment) => void
}): {
    configureMonacoEnvironment: () => void
    monaco: I_windowStylingMonacoApi
  } {
  const configureMonacoEnvironment = (): void => {
    configureWindowStylingMonacoEnvironment(deps)
  }

  return {
    configureMonacoEnvironment,
    monaco: deps.monaco
  }
}
