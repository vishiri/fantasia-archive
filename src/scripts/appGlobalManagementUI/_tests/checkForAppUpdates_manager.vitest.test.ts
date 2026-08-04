/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const {
  notifyCreateMock,
  tMock,
  determineCurrentImageMock
} = vi.hoisted(() => {
  return {
    determineCurrentImageMock: vi.fn(() => 'images/fantasiaMascot/fantasia_reading.png'),
    notifyCreateMock: vi.fn(() => vi.fn()),
    tMock: vi.fn((key: string, params?: { version: string }) => {
      if (params?.version !== undefined) {
        return `${key}|${params.version}`
      }
      return key
    })
  }
})

vi.mock('quasar', () => {
  return {
    Notify: {
      create: notifyCreateMock
    }
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: tMock
      }
    }
  }
})

vi.mock('../functions/fantasiaMascotImageManagement', () => {
  return {
    determineCurrentImage: determineCurrentImageMock,
    fantasiaImageList: { reading: 'images/fantasiaMascot/fantasia_reading.png' }
  }
})

import { checkForAppUpdates } from '../checkForAppUpdates_manager'

beforeEach(() => {
  notifyCreateMock.mockReset()
  notifyCreateMock.mockImplementation(() => vi.fn())
  determineCurrentImageMock.mockClear()
  tMock.mockClear()
  document.body.innerHTML = ''
  vi.stubGlobal('fetch', vi.fn())
  window.faContentBridgeAPIs = {
    appDetails: {
      getProjectVersion: vi.fn(async () => '2.4.16')
    },
    faExternalLinksManager: {
      openExternal: vi.fn()
    },
    faUserSettings: {
      getSettings: vi.fn(async () => ({ hidePlushes: false }))
    }
  } as unknown as Window['faContentBridgeAPIs']
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/**
 * checkForAppUpdates_manager
 * Shows update available notify when GitHub latest is newer.
 */
test('Test that checkForAppUpdates manager shows update notify for newer GitHub release', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v2.5.0' })
  } as Response)

  await checkForAppUpdates('startup')

  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      classes: 'fa-notifyAppUpdateAvailable',
      color: 'info',
      html: true,
      timeout: 0
    })
  )
  expect(determineCurrentImageMock).toHaveBeenCalled()
})

/**
 * checkForAppUpdates_manager
 * Menu throws when local version cannot be read.
 */
test('Test that checkForAppUpdates manager throws for menu when version bridge missing', async () => {
  window.faContentBridgeAPIs = {
    appDetails: undefined
  } as unknown as Window['faContentBridgeAPIs']

  await expect(checkForAppUpdates('menu')).rejects.toThrow(
    'Could not read the installed app version.'
  )
})

/**
 * checkForAppUpdates_manager
 * Hides mascot when hidePlushes is enabled.
 */
test('Test that checkForAppUpdates manager omits mascot when hidePlushes is on', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v9.0.0' })
  } as Response)
  vi.mocked(window.faContentBridgeAPIs!.faUserSettings!.getSettings).mockResolvedValue({
    hidePlushes: true
  } as never)

  await checkForAppUpdates('startup')

  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      classes: 'fa-notifyAppUpdateAvailable'
    })
  )
  const hidePlushesCalls = notifyCreateMock.mock.calls as unknown as Array<[Record<string, unknown>]>
  expect(hidePlushesCalls[0]![0]).not.toHaveProperty('avatar')
})

/**
 * checkForAppUpdates_manager
 * Defaults hidePlushes off when user-settings bridge is missing.
 */
test('Test that checkForAppUpdates manager shows mascot when user settings bridge missing', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v9.0.0' })
  } as Response)
  window.faContentBridgeAPIs = {
    appDetails: {
      getProjectVersion: vi.fn(async () => '2.4.16')
    },
    faUserSettings: undefined
  } as unknown as Window['faContentBridgeAPIs']

  await checkForAppUpdates('startup')

  const missingBridgeCalls = notifyCreateMock.mock.calls as unknown as Array<[Record<string, unknown>]>
  expect(missingBridgeCalls[0]![0]).toHaveProperty('avatar')
})

/**
 * checkForAppUpdates_manager
 * Menu shows already-newest toast when remote is not newer.
 */
test('Test that checkForAppUpdates manager shows already-newest toast for menu', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v2.4.16' })
  } as Response)

  await checkForAppUpdates('menu')

  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'positive'
    })
  )
})

/**
 * checkForAppUpdates_manager
 * Propagates non-ok GitHub responses for menu.
 */
test('Test that checkForAppUpdates manager throws on non-ok GitHub response for menu', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
    status: 503,
    json: async () => ({})
  } as Response)

  await expect(checkForAppUpdates('menu')).rejects.toThrow('503')
})

/**
 * checkForAppUpdates_manager
 * Replaces an open update notify when a newer check runs again.
 */
test('Test that checkForAppUpdates manager dismisses existing update notify on replace', async () => {
  const firstDismiss = vi.fn()
  const secondDismiss = vi.fn()
  notifyCreateMock
    .mockReturnValueOnce(firstDismiss)
    .mockReturnValueOnce(secondDismiss)
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v3.0.0' })
  } as Response)

  await checkForAppUpdates('startup')
  await checkForAppUpdates('startup')

  expect(firstDismiss).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledTimes(2)
})

/**
 * checkForAppUpdates_manager
 * Download button opens releases after delay and dismisses notify.
 */
test('Test that checkForAppUpdates manager download click opens releases after delay', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout'] })
  const dismiss = vi.fn()
  notifyCreateMock.mockReturnValue(dismiss)
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v3.0.0' })
  } as Response)

  const root = document.createElement('div')
  root.className = 'fa-notifyAppUpdateAvailable'
  root.innerHTML =
    '<button type="button" class="fa-notifyAppUpdateAvailable__download">Download</button>'
  document.body.appendChild(root)

  await checkForAppUpdates('startup')
  await Promise.resolve()
  await Promise.resolve()

  const button = document.querySelector(
    '.fa-notifyAppUpdateAvailable .fa-notifyAppUpdateAvailable__download'
  )
  expect(button).toBeInstanceOf(HTMLElement)
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(dismiss).toHaveBeenCalledOnce()
  expect(window.faContentBridgeAPIs!.faExternalLinksManager!.openExternal).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(500)
  expect(window.faContentBridgeAPIs!.faExternalLinksManager!.openExternal).toHaveBeenCalled()
})

/**
 * checkForAppUpdates_manager
 * Attach download click no-ops when toast DOM is missing.
 */
test('Test that checkForAppUpdates manager attach download no-ops without toast DOM', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ tag_name: 'v3.0.0' })
  } as Response)

  await checkForAppUpdates('startup')
  await Promise.resolve()
  await Promise.resolve()

  expect(notifyCreateMock).toHaveBeenCalledOnce()
})
