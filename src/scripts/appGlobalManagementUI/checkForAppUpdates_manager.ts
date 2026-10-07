import { Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'

import { i18n } from 'app/i18n/externalFileLoader'
import {
  FA_APP_UPDATE_GITHUB_LATEST_API_URL,
  FA_APP_UPDATE_GITHUB_RELEASES_PAGE_URL
} from 'app/types/I_faAppUpdateCheck'

import { createAlreadyNewestVersionNotification } from './functions/createAlreadyNewestVersionNotification'
import {
  createAppUpdateAvailableNotification,
  FA_NOTIFY_APP_UPDATE_AVAILABLE_CLASS,
  FA_NOTIFY_APP_UPDATE_DOWNLOAD_CLASS
} from './functions/createAppUpdateAvailableNotification'
import { createCheckForAppUpdates } from './functions/createCheckForAppUpdates'
import { createFetchLatestGithubReleaseVersion } from './functions/createFetchLatestGithubReleaseVersion'
import {
  determineCurrentImage,
  fantasiaImageList
} from './functions/fantasiaMascotImageManagement'
import {
  isFaRemoteSemverNewer,
  stripFaSemverVersion
} from './functions/faAppUpdateSemver'

let updateNotifyDismiss: (() => void) | undefined

const fetchLatestApi = createFetchLatestGithubReleaseVersion({
  ResultAsync,
  fetchLatestReleaseJson: async (url) => {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    })
    if (!response.ok) {
      throw new Error(i18n.global.t('appUpdateCheck.githubRequestFailed', {
        status: String(response.status)
      }))
    }
    return await response.json()
  },
  latestApiUrl: FA_APP_UPDATE_GITHUB_LATEST_API_URL,
  releaseErrorMessages: {
    emptyAfterStrip: () => i18n.global.t('appUpdateCheck.githubEmptyTagName'),
    missingTagName: () => i18n.global.t('appUpdateCheck.githubMissingTagName'),
    responseNotObject: () => i18n.global.t('appUpdateCheck.githubResponseNotObject')
  },
  stripFaSemverVersion
})

const updateAvailableApi = createAppUpdateAvailableNotification({
  attachDownloadClick: ({ onDownload }) => {
    queueMicrotask(() => {
      const downloadButton = document.querySelector(
        `.${FA_NOTIFY_APP_UPDATE_AVAILABLE_CLASS} .${FA_NOTIFY_APP_UPDATE_DOWNLOAD_CLASS}`
      )
      if (!(downloadButton instanceof HTMLElement)) {
        return
      }
      downloadButton.addEventListener('click', onDownload)
    })
  },
  createNotify: (opts) => Notify.create(opts),
  delay: (ms, callback) => {
    window.setTimeout(callback, ms)
  },
  openReleasesPage: () => {
    window.faContentBridgeAPIs?.faExternalLinksManager?.openExternal(
      FA_APP_UPDATE_GITHUB_RELEASES_PAGE_URL
    )
  },
  resolveMascotAvatar: (hideMascot) => {
    if (hideMascot) {
      return undefined
    }
    return determineCurrentImage(fantasiaImageList, false, 'reading')
  },
  t: (key, params) => {
    if (params !== undefined) {
      return i18n.global.t(key, params)
    }
    return i18n.global.t(key)
  }
})

const alreadyNewestApi = createAlreadyNewestVersionNotification({
  createNotify: (opts) => {
    Notify.create(opts)
  },
  t: (key) => i18n.global.t(key)
})

const checkForAppUpdatesApi = createCheckForAppUpdates({
  dismissExistingUpdateNotify: () => {
    if (updateNotifyDismiss !== undefined) {
      updateNotifyDismiss()
      updateNotifyDismiss = undefined
    }
  },
  fetchLatestGithubReleaseVersion: fetchLatestApi.fetchLatestGithubReleaseVersion,
  getHideMascot: async () => {
    const userSettingsBridge = window.faContentBridgeAPIs?.faUserSettings
    if (userSettingsBridge?.getSettings === undefined) {
      return false
    }
    const persistedSettings = await userSettingsBridge.getSettings()
    return persistedSettings.hidePlushes === true
  },
  getInstalledVersionUnreadableMessage: () => i18n.global.t('appUpdateCheck.installedVersionUnreadable'),
  getLocalVersion: async () => {
    const appDetails = window.faContentBridgeAPIs?.appDetails
    if (appDetails?.getProjectVersion === undefined) {
      return ''
    }
    return await appDetails.getProjectVersion()
  },
  isFaRemoteSemverNewer,
  setUpdateNotifyDismiss: (dismiss) => {
    updateNotifyDismiss = dismiss
  },
  showAlreadyNewestVersionNotification: alreadyNewestApi.showAlreadyNewestVersionNotification,
  showAppUpdateAvailableNotification: updateAvailableApi.showAppUpdateAvailableNotification,
  stripFaSemverVersion
})

export const checkForAppUpdates = checkForAppUpdatesApi.checkForAppUpdates
