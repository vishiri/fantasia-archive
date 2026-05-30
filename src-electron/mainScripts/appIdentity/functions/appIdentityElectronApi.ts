import type { I_appIdentityElectronApiDeps } from 'app/types/I_faElectronMainStoreApiDeps'

export function createAppIdentityElectronApi (deps: I_appIdentityElectronApiDeps): {
  determineAppName: () => string
  fixAppName: () => void
} {
  const determineAppName = (): string => {
    return deps.determineAppNameFromEnv(deps.getDebugging(), deps.packageName)
  }

  const fixAppName = (): void => {
    const appName = deps.determineAppNameFromEnv(deps.getDebugging(), deps.packageName)
    if (appName) {
      deps.app.setName(appName)
      const appData = deps.app.getPath('appData')
      const userDataRootFolderName = deps.resolveUserDataRootFolderName(
        deps.getTestEnv(),
        deps.packageName,
        appName
      )
      let userDataDir = deps.pathJoin(appData, userDataRootFolderName)
      if (deps.isPlaywrightTestEnv(deps.getTestEnv())) {
        userDataDir = deps.pathJoin(userDataDir, deps.playwrightIsolatedUserDataDirName)
      }
      deps.app.setPath('userData', userDataDir)
    }
  }

  return {
    determineAppName,
    fixAppName
  }
}
