import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

const { applyLocaleMock } = vi.hoisted(() => {
  return {
    applyLocaleMock: vi.fn()
  }
})

vi.mock('app/src/scripts/appInternals/rendererAppInternals', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('app/src/scripts/appInternals/rendererAppInternals')>()
  return {
    ...actual,
    applyFaI18nLocaleFromLanguageCode: applyLocaleMock
  }
})

import { setFantasiaStorybookCanvasFlag } from 'app/src/scripts/appInternals/rendererAppInternals'

import MainLayout from '../MainLayout.vue'

const mountMainLayoutStubs = () => {
  return mount(MainLayout, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        AppControlMenus: {
          template: '<div data-test-stub="app-control-menus" />'
        },
        GlobalLanguageSelector: {
          template: '<div data-test-stub="global-language-selector" />'
        },
        GlobalWindowButtons: {
          template: '<div data-test-stub="global-window-buttons" />'
        },
        RouterView: true
      }
    }
  })
}

function countKeydownCaptureAdds (spy: { mock: { calls: unknown[][] } }): number {
  return spy.mock.calls.filter((call) => {
    return call[0] === 'keydown' && call[2] === true
  }).length
}

/**
 * MainLayout
 * Renders header chrome stubs and a router outlet so the shell layout mounts without the full menu tree.
 */
test('Test that MainLayout mounts with header stubs and router-view slot', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'spa')
  applyLocaleMock.mockClear()

  const w = mountMainLayoutStubs()

  await flushPromises()

  expect(w.find('[data-test-stub="app-control-menus"]').exists()).toBe(true)
  expect(w.find('[data-test-stub="global-language-selector"]').exists()).toBe(true)
  expect(w.find('[data-test-stub="global-window-buttons"]').exists()).toBe(true)
  expect(w.find('.appHeader').exists()).toBe(true)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips Electron hydration when the Storybook canvas flag is set so the layout matches preview-only runs.
 */
test('Test that MainLayout hides GlobalLanguageSelector when isFantasiaStorybookCanvas is true', () => {
  setFantasiaStorybookCanvasFlag(true)
  vi.stubEnv('MODE', 'electron')

  const w = mountMainLayoutStubs()

  expect(w.find('[data-test-stub="global-language-selector"]').exists()).toBe(false)
  expect(w.find('[data-test-stub="app-control-menus"]').exists()).toBe(true)
  w.unmount()
  setFantasiaStorybookCanvasFlag(false)
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Does not register global keybind listeners when MODE is not electron.
 */
test('Test that MainLayout skips keybind wiring when MODE is not electron', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'spa')
  applyLocaleMock.mockClear()

  const addSpy = vi.spyOn(window, 'addEventListener')
  const before = countKeydownCaptureAdds(addSpy)

  const w = mountMainLayoutStubs()
  await flushPromises()

  expect(countKeydownCaptureAdds(addSpy)).toBe(before)
  expect(applyLocaleMock).not.toHaveBeenCalled()
  w.unmount()
  addSpy.mockRestore()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Applies vue-i18n locale from persisted user settings when the language code is supported.
 */
test('Test that MainLayout applies locale after refreshSettings when languageCode is supported', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')
  applyLocaleMock.mockClear()

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  getSettings.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'de'
  })

  const w = mountMainLayoutStubs()
  await flushPromises()

  expect(applyLocaleMock).toHaveBeenCalledWith('de')
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips locale application when persisted languageCode is not a supported user-settings code.
 */
test('Test that MainLayout does not apply locale when languageCode is unsupported', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')
  applyLocaleMock.mockClear()

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  getSettings.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'xx-XX'
  })

  const w = mountMainLayoutStubs()
  await flushPromises()

  expect(applyLocaleMock).not.toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips locale application when settings carry no languageCode after refresh.
 */
test('Test that MainLayout does not apply locale when languageCode is missing after refresh', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')
  applyLocaleMock.mockClear()

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  const snapshot = {
    ...FA_USER_SETTINGS_DEFAULTS
  }
  delete (snapshot as { languageCode?: string }).languageCode
  getSettings.mockResolvedValueOnce(snapshot)

  const w = mountMainLayoutStubs()
  await flushPromises()

  expect(applyLocaleMock).not.toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips user-settings hydration when the bridge omits faUserSettings.
 */
test('Test that MainLayout skips user settings refresh when faUserSettings bridge is absent', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')
  applyLocaleMock.mockClear()

  const prev = window.faContentBridgeAPIs.faUserSettings
  delete (window.faContentBridgeAPIs as { faUserSettings?: unknown }).faUserSettings

  const w = mountMainLayoutStubs()
  await flushPromises()

  expect(applyLocaleMock).not.toHaveBeenCalled()
  w.unmount()

  window.faContentBridgeAPIs.faUserSettings = prev
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Registers capture-phase keydown when faKeybinds exists on the bridge.
 */
test('Test that MainLayout registers capture keydown listener when faKeybinds bridge is present', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const addSpy = vi.spyOn(window, 'addEventListener')
  const before = countKeydownCaptureAdds(addSpy)

  const w = mountMainLayoutStubs()
  await flushPromises()

  expect(countKeydownCaptureAdds(addSpy)).toBeGreaterThan(before)
  w.unmount()
  addSpy.mockRestore()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips keybind listener registration when the bridge omits faKeybinds.
 */
test('Test that MainLayout skips keybind listener when faKeybinds bridge is absent', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const prev = window.faContentBridgeAPIs.faKeybinds
  delete (window.faContentBridgeAPIs as { faKeybinds?: unknown }).faKeybinds

  const addSpy = vi.spyOn(window, 'addEventListener')
  const before = countKeydownCaptureAdds(addSpy)

  const w = mountMainLayoutStubs()
  await flushPromises()

  expect(countKeydownCaptureAdds(addSpy)).toBe(before)
  w.unmount()

  window.faContentBridgeAPIs.faKeybinds = prev
  addSpy.mockRestore()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onUnmounted
 * Removes the capture keydown listener when keybind wiring ran on mount.
 */
test('Test that MainLayout removes capture keydown listener on unmount after keybind wiring', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const removeSpy = vi.spyOn(window, 'removeEventListener')

  const w = mountMainLayoutStubs()
  await flushPromises()

  const keydownRemoves = removeSpy.mock.calls.filter((call) => {
    return call[0] === 'keydown' && call[2] === true
  })
  expect(keydownRemoves.length).toBe(0)

  w.unmount()

  const afterUnmount = removeSpy.mock.calls.filter((call) => {
    return call[0] === 'keydown' && call[2] === true
  })
  expect(afterUnmount.length).toBe(1)

  removeSpy.mockRestore()
  vi.unstubAllEnvs()
})

afterEach(() => {
  setFantasiaStorybookCanvasFlag(false)
})
