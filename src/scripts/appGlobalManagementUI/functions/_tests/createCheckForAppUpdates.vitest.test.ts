import { expect, test, vi } from 'vitest'

import { createCheckForAppUpdates } from '../createCheckForAppUpdates'
import { isFaRemoteSemverNewer, stripFaSemverVersion } from '../faAppUpdateSemver'

function buildApi (overrides: Partial<Parameters<typeof createCheckForAppUpdates>[0]> = {}) {
  const dismissExistingUpdateNotify = vi.fn()
  const showAlreadyNewestVersionNotification = vi.fn()
  const showAppUpdateAvailableNotification = vi.fn()
  const setUpdateNotifyDismiss = vi.fn()
  const api = createCheckForAppUpdates({
    dismissExistingUpdateNotify,
    fetchLatestGithubReleaseVersion: async () => {
      return {
        error: new Error('unused'),
        isErr: () => false,
        value: '2.5.0'
      }
    },
    getHideMascot: async () => false,
    getLocalVersion: async () => '2.4.16',
    isFaRemoteSemverNewer,
    setUpdateNotifyDismiss,
    showAlreadyNewestVersionNotification,
    showAppUpdateAvailableNotification,
    stripFaSemverVersion,
    ...overrides
  })
  return {
    api,
    dismissExistingUpdateNotify,
    setUpdateNotifyDismiss,
    showAlreadyNewestVersionNotification,
    showAppUpdateAvailableNotification
  }
}

/**
 * createCheckForAppUpdates
 * Shows the update notify when remote is newer.
 */
test('Test that createCheckForAppUpdates shows update notify when remote is newer', async () => {
  const {
    api,
    dismissExistingUpdateNotify,
    showAppUpdateAvailableNotification
  } = buildApi()

  await api.checkForAppUpdates('startup')

  expect(dismissExistingUpdateNotify).toHaveBeenCalledOnce()
  expect(showAppUpdateAvailableNotification).toHaveBeenCalledWith(
    expect.objectContaining({
      hideMascot: false,
      version: '2.5.0'
    })
  )
})

/**
 * createCheckForAppUpdates
 * Startup stays silent when already newest.
 */
test('Test that createCheckForAppUpdates stays silent on startup when already newest', async () => {
  const {
    api,
    showAlreadyNewestVersionNotification,
    showAppUpdateAvailableNotification
  } = buildApi({
    fetchLatestGithubReleaseVersion: async () => {
      return {
        error: new Error('unused'),
        isErr: () => false,
        value: '2.4.16'
      }
    },
    getLocalVersion: async () => '2.4.16'
  })

  await api.checkForAppUpdates('startup')

  expect(showAlreadyNewestVersionNotification).not.toHaveBeenCalled()
  expect(showAppUpdateAvailableNotification).not.toHaveBeenCalled()
})

/**
 * createCheckForAppUpdates
 * Menu shows success toast when already newest.
 */
test('Test that createCheckForAppUpdates shows already-newest toast for menu source', async () => {
  const {
    api,
    showAlreadyNewestVersionNotification,
    showAppUpdateAvailableNotification
  } = buildApi({
    fetchLatestGithubReleaseVersion: async () => {
      return {
        error: new Error('unused'),
        isErr: () => false,
        value: '2.4.16'
      }
    },
    getLocalVersion: async () => '2.4.16'
  })

  await api.checkForAppUpdates('menu')

  expect(showAlreadyNewestVersionNotification).toHaveBeenCalledOnce()
  expect(showAppUpdateAvailableNotification).not.toHaveBeenCalled()
})

/**
 * createCheckForAppUpdates
 * Startup swallows fetch errors.
 */
test('Test that createCheckForAppUpdates swallows fetch errors on startup', async () => {
  const { api, showAppUpdateAvailableNotification } = buildApi({
    fetchLatestGithubReleaseVersion: async () => {
      return {
        error: new Error('boom'),
        isErr: () => true,
        value: ''
      }
    }
  })

  await expect(api.checkForAppUpdates('startup')).resolves.toBeUndefined()
  expect(showAppUpdateAvailableNotification).not.toHaveBeenCalled()
})

/**
 * createCheckForAppUpdates
 * Menu rethrows fetch errors.
 */
test('Test that createCheckForAppUpdates throws fetch errors for menu source', async () => {
  const { api } = buildApi({
    fetchLatestGithubReleaseVersion: async () => {
      return {
        error: new Error('boom'),
        isErr: () => true,
        value: ''
      }
    }
  })

  await expect(api.checkForAppUpdates('menu')).rejects.toThrow('boom')
})

/**
 * createCheckForAppUpdates
 * Startup stays silent when local version is blank.
 */
test('Test that createCheckForAppUpdates stays silent on startup when local version blank', async () => {
  const { api, showAppUpdateAvailableNotification } = buildApi({
    getLocalVersion: async () => ''
  })

  await expect(api.checkForAppUpdates('startup')).resolves.toBeUndefined()
  expect(showAppUpdateAvailableNotification).not.toHaveBeenCalled()
})

/**
 * createCheckForAppUpdates
 * Menu throws when local version is blank.
 */
test('Test that createCheckForAppUpdates throws for menu when local version blank', async () => {
  const { api } = buildApi({
    getLocalVersion: async () => '   '
  })

  await expect(api.checkForAppUpdates('menu')).rejects.toThrow(
    'Could not read the installed app version.'
  )
})

/**
 * createCheckForAppUpdates
 * Stores dismiss callback from update notify onShown.
 */
test('Test that createCheckForAppUpdates stores dismiss from update notify onShown', async () => {
  const {
    api,
    setUpdateNotifyDismiss,
    showAppUpdateAvailableNotification
  } = buildApi()
  const dismiss = vi.fn()

  showAppUpdateAvailableNotification.mockImplementation((input) => {
    input.onShown(dismiss)
  })

  await api.checkForAppUpdates('startup')

  expect(setUpdateNotifyDismiss).toHaveBeenCalledWith(dismiss)
})
