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
    getInstalledVersionUnreadableMessage: () => 'Could not read the installed app version.',
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
 * A slower earlier check does not toast after a newer check already finished.
 */
test('Test that createCheckForAppUpdates ignores a stale check after a newer one', async () => {
  let releaseSlowFetch: ((value: {
    error: Error
    isErr: () => boolean
    value: string
  }) => void) | undefined
  let fetches = 0
  const {
    api,
    showAlreadyNewestVersionNotification,
    showAppUpdateAvailableNotification
  } = buildApi({
    fetchLatestGithubReleaseVersion: () => {
      fetches += 1
      if (fetches === 1) {
        return new Promise((resolve) => {
          releaseSlowFetch = resolve
        })
      }
      return Promise.resolve({
        error: new Error('unused'),
        isErr: () => false,
        value: '2.4.16'
      })
    }
  })

  const firstCheck = api.checkForAppUpdates('startup')
  await Promise.resolve()
  await api.checkForAppUpdates('menu')
  const finishSlowFetch = releaseSlowFetch
  if (finishSlowFetch === undefined) {
    throw new Error('slow update check was not started')
  }
  finishSlowFetch({
    error: new Error('unused'),
    isErr: () => false,
    value: '9.0.0'
  })
  await firstCheck

  expect(showAlreadyNewestVersionNotification).toHaveBeenCalledOnce()
  expect(showAppUpdateAvailableNotification).not.toHaveBeenCalled()
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

test('Test that createCheckForAppUpdates ignores a local version read from an older check', async () => {
  let releaseLocal: ((value: string) => void) | undefined
  const pendingLocal = new Promise<string>((resolve) => {
    releaseLocal = resolve
  })
  const { api, showAppUpdateAvailableNotification } = buildApi({
    getLocalVersion: () => pendingLocal
  })
  const firstCheck = api.checkForAppUpdates('startup')
  const secondCheck = api.checkForAppUpdates('menu')
  const finishLocal = releaseLocal
  if (finishLocal === undefined) {
    throw new Error('missing local version resolver')
  }
  finishLocal('2.4.16')
  await firstCheck
  await secondCheck
  expect(showAppUpdateAvailableNotification).toHaveBeenCalledOnce()
})

test('Test that createCheckForAppUpdates ignores a hide-mascot read from an older check', async () => {
  let releaseHide: ((value: boolean) => void) | undefined
  const pendingHide = new Promise<boolean>((resolve) => {
    releaseHide = resolve
  })
  const { api, showAppUpdateAvailableNotification } = buildApi({
    getHideMascot: () => pendingHide
  })
  const firstCheck = api.checkForAppUpdates('startup')
  await Promise.resolve()
  const secondCheck = api.checkForAppUpdates('startup')
  const finishHide = releaseHide
  if (finishHide === undefined) {
    throw new Error('missing hide mascot resolver')
  }
  finishHide(false)
  await firstCheck
  await secondCheck
  expect(showAppUpdateAvailableNotification).toHaveBeenCalledOnce()
})
