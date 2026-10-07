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
  getInstalledVersionUnreadableMessage: () => string
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
  let checkSerial = 0

  const checkForAppUpdates = async (source: T_faAppUpdateCheckSource): Promise<void> => {
    checkSerial += 1
    const serial = checkSerial
    const localRaw = await deps.getLocalVersion()
    if (serial !== checkSerial) {
      return
    }
    const localStripped = deps.stripFaSemverVersion(localRaw)
    if (localStripped.length === 0) {
      if (source === 'menu') {
        throw new Error(deps.getInstalledVersionUnreadableMessage())
      }
      return
    }

    const remoteResult = await deps.fetchLatestGithubReleaseVersion()
    if (serial !== checkSerial) {
      return
    }
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
    if (serial !== checkSerial) {
      return
    }
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
