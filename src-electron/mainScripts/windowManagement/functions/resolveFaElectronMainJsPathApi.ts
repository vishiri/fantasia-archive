import type { I_resolveFaElectronMainJsPathApiDeps } from 'app/types/I_faElectronMainStoreApiDeps'

/**
 * Absolute path to the main-process script Electron was started with (electron-main.js).
 */
export function createResolveFaElectronMainJsPathApi (
  deps: I_resolveFaElectronMainJsPathApiDeps
): () => string {
  const resolveFaElectronMainJsPath = (): string => {
    const fromArgv = deps.pickElectronMainScriptFromArgv(deps.argv)
    if (fromArgv !== null) {
      return fromArgv
    }

    return deps.fileURLToPath(deps.importMetaUrl)
  }

  return resolveFaElectronMainJsPath
}
