import type { I_nativeShellTweaksDeps } from 'app/types/I_faElectronMainStoreApiDeps'

export function createNativeShellTweaksApi (deps: I_nativeShellTweaksDeps): {
  tweakMenuRemover: () => void
  tweakRetriveOS: () => string
} {
  const tweakRetriveOS = (): string => {
    return deps.getPlatform() || deps.osPlatform()
  }

  const tweakMenuRemover = (): void => {
    deps.setApplicationMenu(null)
  }

  return {
    tweakMenuRemover,
    tweakRetriveOS
  }
}
