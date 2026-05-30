import type { I_windowsDevToolsExtensionsFixDeps } from 'app/types/I_faElectronMainStoreApiDeps'

/**
 * Windows dark-mode DevTools extension folder hot-fix (Electron issue 19468).
 */
export function createWindowsDevToolsExtensionsFix (
  deps: I_windowsDevToolsExtensionsFixDeps
): (platform: string) => void {
  const windowsDevToolsExtensionsFix = (platform: string): void => {
    if (platform === 'win32' && deps.getNativeThemeShouldUseDarkColors() === true) {
      const devToolsExtensionsPath = deps.joinPath(deps.getUserDataPath(), 'DevTools Extensions')

      if (deps.devToolsExtensionsFolderExists(devToolsExtensionsPath)) {
        deps.unlinkDevToolsExtensionsFolder(devToolsExtensionsPath)
      }
    }
  }

  return windowsDevToolsExtensionsFix
}
