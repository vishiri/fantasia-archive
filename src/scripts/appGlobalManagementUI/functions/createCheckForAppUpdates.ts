import type { T_faAppUpdateCheckSource } from 'app/types/I_faAppUpdateCheck'

type T_faGithubLatestVersionResult = {
  error: Error
  isErr: () => boolean
  value: string
}

/**
 * Orchestrates GitHub latest-release check and notify side effects by source.
 */
export function createCheckForAppUpdates (deps: {
  dismissExistingUpdateNotify: () => void
  fetchLatestGithubReleaseVersion: () => Promise<T_faGithubLatestVersionResult>
  getLocalVersion: () => Promise<string>
  getHideMascot: () => Promise<boolean>
  isFaRemoteSemverNewer: (localStripped: string, remoteStripped: string) => boolean
  setUpdateNotifyDismiss: (dismiss: (() => void) | undefined) => void
  showAlreadyNewestVersionNotification: () => void
  showAppUpdateAvailableNotification: (input: {
    hideMascot: boolean
    onShown: (dismiss: () => void) => void
    version: string
  }) => void
  stripFaSemverVersion: (raw: string) => string
}): {
    checkForAppUpdates: (source: T_faAppUpdateCheckSource) => Promise<void>
  } {
  const checkForAppUpdates = async (source: T_faAppUpdateCheckSource): Promise<void> => {
    const localRaw = await deps.getLocalVersion()
    const localStripped = deps.stripFaSemverVersion(localRaw)
    if (localStripped.length === 0) {
      if (source === 'menu') {
        throw new Error('Could not read the installed app version.')
      }
      return
    }

    const remoteResult = await deps.fetchLatestGithubReleaseVersion()
    if (remoteResult.isErr()) {
      if (source === 'menu') {
        throw remoteResult.error
      }
      return
    }

    const remoteStripped = remoteResult.value
    if (!deps.isFaRemoteSemverNewer(localStripped, remoteStripped)) {
      if (source === 'menu') {
        deps.showAlreadyNewestVersionNotification()
      }
      return
    }

    deps.dismissExistingUpdateNotify()
    const hideMascot = await deps.getHideMascot()
    deps.showAppUpdateAvailableNotification({
      hideMascot,
      onShown: (dismiss) => {
        deps.setUpdateNotifyDismiss(dismiss)
      },
      version: remoteStripped
    })
  }

  return {
    checkForAppUpdates
  }
}
