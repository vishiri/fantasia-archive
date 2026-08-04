import { expect, test, vi } from 'vitest'

import {
  createAppUpdateAvailableNotification,
  FA_NOTIFY_APP_UPDATE_OPEN_RELEASES_DELAY_MS
} from '../createAppUpdateAvailableNotification'
import { createAlreadyNewestVersionNotification } from '../createAlreadyNewestVersionNotification'

/**
 * createAppUpdateAvailableNotification
 * Builds sticky info notify with Download in caption HTML.
 */
test('Test that createAppUpdateAvailableNotification builds sticky info notify with Download in caption', () => {
  const dismiss = vi.fn()
  const openReleasesPage = vi.fn()
  const attachDownloadClick = vi.fn()
  const delay = vi.fn()
  const createNotify = vi.fn((
    _opts: {
      actions: Array<{
        icon?: string
      }>
      avatar?: string
      caption: string
      classes: string
      color: string
      html: boolean
      message: string
      timeout: number
    }
  ) => dismiss)
  const onShown = vi.fn()
  const api = createAppUpdateAvailableNotification({
    attachDownloadClick,
    createNotify,
    delay,
    openReleasesPage,
    resolveMascotAvatar: () => 'images/fantasiaMascot/fantasia_reading.png',
    t: (key, params) => {
      if (key.endsWith('subtitle')) {
        return 'Click on the button below to download it!'
      }
      if (key.endsWith('.title') || key.endsWith('appUpdateCheck.title')) {
        return `New version is available: ${params?.version ?? ''}`
      }
      if (key.endsWith('download')) {
        return 'Download'
      }
      return key
    }
  })

  api.showAppUpdateAvailableNotification({
    hideMascot: false,
    onShown,
    version: '2.5.0'
  })

  expect(createNotify).toHaveBeenCalledWith(
    expect.objectContaining({
      avatar: 'images/fantasiaMascot/fantasia_reading.png',
      caption: 'Click on the button below to download it!<div class="fa-notifyAppUpdateAvailable__cta"><button class="q-btn q-btn-item non-selectable no-outline q-btn--push q-btn--rectangle bg-positive text-white q-btn--actionable q-focusable q-hoverable fa-notifyAppUpdateAvailable__download" tabindex="0" type="button"><span class="q-focus-helper" tabindex="-1"></span><span class="q-btn__content text-center col items-center q-anchor--skip justify-center row"><span class="block">Download</span></span></button></div>',
      classes: 'fa-notifyAppUpdateAvailable',
      color: 'info',
      html: true,
      message: 'New version is available: <span class="fa-notifyAppUpdateAvailable__version">2.5.0</span>',
      position: 'bottom-right',
      timeout: 0
    })
  )
  expect(createNotify.mock.calls[0]![0]!.actions).toEqual([
    {
      color: 'dark',
      icon: 'mdi-close'
    }
  ])
  expect(onShown).toHaveBeenCalledWith(dismiss)
  expect(attachDownloadClick).toHaveBeenCalledOnce()

  const attachArg = attachDownloadClick.mock.calls[0]![0]!
  attachArg.onDownload()
  expect(dismiss).toHaveBeenCalledOnce()
  expect(openReleasesPage).not.toHaveBeenCalled()
  expect(delay).toHaveBeenCalledWith(
    FA_NOTIFY_APP_UPDATE_OPEN_RELEASES_DELAY_MS,
    expect.any(Function)
  )
  const delayedOpen = delay.mock.calls[0]![1]!
  delayedOpen()
  expect(openReleasesPage).toHaveBeenCalledOnce()
})

/**
 * createAppUpdateAvailableNotification
 * Omits avatar when mascot is hidden.
 */
test('Test that createAppUpdateAvailableNotification omits avatar when mascot hidden', () => {
  const createNotify = vi.fn()
  const api = createAppUpdateAvailableNotification({
    attachDownloadClick: vi.fn(),
    createNotify,
    delay: vi.fn(),
    openReleasesPage: vi.fn(),
    resolveMascotAvatar: () => undefined,
    t: (key) => key
  })

  api.showAppUpdateAvailableNotification({
    hideMascot: true,
    onShown: vi.fn(),
    version: '2.5.0'
  })

  expect(createNotify.mock.calls[0]![0]!).not.toHaveProperty('avatar')
})

/**
 * createAppUpdateAvailableNotification
 * Escapes version HTML before embedding in the notify message.
 */
test('Test that createAppUpdateAvailableNotification escapes version HTML', () => {
  const createNotify = vi.fn()
  const api = createAppUpdateAvailableNotification({
    attachDownloadClick: vi.fn(),
    createNotify,
    delay: vi.fn(),
    openReleasesPage: vi.fn(),
    resolveMascotAvatar: () => undefined,
    t: (key, params) => {
      if (key.endsWith('subtitle')) {
        return 'subtitle'
      }
      if (key.endsWith('.title') || key.endsWith('appUpdateCheck.title')) {
        return `New version is available: ${params?.version ?? ''}`
      }
      if (key.endsWith('download')) {
        return 'Download'
      }
      return key
    }
  })

  api.showAppUpdateAvailableNotification({
    hideMascot: true,
    onShown: vi.fn(),
    version: '<b>1.0.0</b>'
  })

  expect(createNotify.mock.calls[0]![0]!.message).toBe(
    'New version is available: <span class="fa-notifyAppUpdateAvailable__version">&lt;b&gt;1.0.0&lt;/b&gt;</span>'
  )
})

/**
 * createAppUpdateAvailableNotification
 * Skips onShown when Notify.create does not return a dismiss function.
 */
test('Test that createAppUpdateAvailableNotification skips onShown when notify returns void', () => {
  const onShown = vi.fn()
  const attachDownloadClick = vi.fn()
  const api = createAppUpdateAvailableNotification({
    attachDownloadClick,
    createNotify: vi.fn(() => undefined),
    delay: vi.fn(),
    openReleasesPage: vi.fn(),
    resolveMascotAvatar: () => undefined,
    t: (key) => key
  })

  api.showAppUpdateAvailableNotification({
    hideMascot: true,
    onShown,
    version: '2.5.0'
  })

  expect(onShown).not.toHaveBeenCalled()
  const attachArg = attachDownloadClick.mock.calls[0]![0]!
  attachArg.onDownload()
})

/**
 * createAlreadyNewestVersionNotification
 * Uses positive type and no avatar.
 */
test('Test that createAlreadyNewestVersionNotification creates a positive toast', () => {
  const createNotify = vi.fn()
  const api = createAlreadyNewestVersionNotification({
    createNotify,
    t: () => 'You are already using the newest version of FA!'
  })

  api.showAlreadyNewestVersionNotification()

  expect(createNotify).toHaveBeenCalledWith({
    message: 'You are already using the newest version of FA!',
    type: 'positive'
  })
})
