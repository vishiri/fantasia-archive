import { flushPromises } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { setFantasiaStorybookCanvasFlag } from 'app/src/scripts/appInternals/rendererAppInternals'
import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import { mountMainLayoutForVitest } from './mainLayoutVitestMount'

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

  const w = await mountMainLayoutForVitest()

  await flushPromises()

  expect(w.find('[data-test-stub="app-control-menus"]').exists()).toBe(true)
  expect(w.find('[data-test-stub="global-language-selector"]').exists()).toBe(true)
  expect(w.find('[data-test-stub="global-window-buttons"]').exists()).toBe(true)
  expect(w.find('.appHeader').exists()).toBe(true)
  expect(w.find('[data-test-locator="mainLayout-drawer"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="mainLayout-vitest-leaf"]').exists()).toBe(true)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / route meta faMainLayoutHideDrawer
 * Splash and similar routes omit the navigation drawer without affecting header chrome.
 */
test('Test that MainLayout hides the drawer when child route meta faMainLayoutHideDrawer is true', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'spa')

  const w = await mountMainLayoutForVitest({
    childRouteMeta: { faMainLayoutHideDrawer: true }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="mainLayout-drawer"]').exists()).toBe(false)
  expect(w.find('[data-test-stub="app-control-menus"]').exists()).toBe(true)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips Electron hydration when the Storybook canvas flag is set so the layout matches preview-only runs.
 */
test('Test that MainLayout hides GlobalLanguageSelector when isFantasiaStorybookCanvas is true', async () => {
  setFantasiaStorybookCanvasFlag(true)
  vi.stubEnv('MODE', 'electron')

  const w = await mountMainLayoutForVitest()

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

  const addSpy = vi.spyOn(window, 'addEventListener')
  const before = countKeydownCaptureAdds(addSpy)

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(countKeydownCaptureAdds(addSpy)).toBe(before)
  w.unmount()
  addSpy.mockRestore()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Hydrates user settings and persists languageCode (i18n sync lives in S_FaUserSettings.refreshSettings).
 */
test('Test that MainLayout hydrates user settings when persisted languageCode is supported', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  getSettings.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'de'
  })

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(getSettings).toHaveBeenCalled()
  expect(S_FaUserSettings().settings?.languageCode).toBe('de')
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

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  getSettings.mockResolvedValueOnce(
    {
      ...FA_USER_SETTINGS_DEFAULTS,
      languageCode: 'xx-XX'
    } as unknown as I_faUserSettings
  )

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(S_FaUserSettings().settings?.languageCode).toBe('xx-XX')
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

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  const snapshot = {
    ...FA_USER_SETTINGS_DEFAULTS
  }
  delete (snapshot as { languageCode?: string }).languageCode
  getSettings.mockResolvedValueOnce(snapshot)

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(
    (S_FaUserSettings().settings as { languageCode?: string } | null)?.languageCode
  ).toBeUndefined()
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

  const prev = window.faContentBridgeAPIs.faUserSettings
  const getSettings = prev.getSettings as ReturnType<typeof vi.fn>
  const before = getSettings.mock.calls.length
  delete (window.faContentBridgeAPIs as { faUserSettings?: unknown }).faUserSettings

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(getSettings.mock.calls.length).toBe(before)
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

  const w = await mountMainLayoutForVitest()
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

  const w = await mountMainLayoutForVitest()
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

  const w = await mountMainLayoutForVitest()
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

/**
 * MainLayout / onMounted
 * Refreshes persisted program styling when the bridge exposes faProgramStyling.
 */
test('Test that MainLayout refreshes program styling when faProgramStyling bridge is present', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const stylingStore = S_FaProgramStyling()
  const refreshSpy = vi.spyOn(stylingStore, 'refreshProgramStyling').mockResolvedValue(true)

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).toHaveBeenCalledTimes(1)

  refreshSpy.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips program styling hydration when the bridge omits faProgramStyling.
 */
test('Test that MainLayout skips program styling refresh when faProgramStyling bridge is absent', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const stylingStore = S_FaProgramStyling()
  const refreshSpy = vi.spyOn(stylingStore, 'refreshProgramStyling').mockResolvedValue(true)

  const prev = window.faContentBridgeAPIs.faProgramStyling
  delete (window.faContentBridgeAPIs as { faProgramStyling?: unknown }).faProgramStyling

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).not.toHaveBeenCalled()

  window.faContentBridgeAPIs.faProgramStyling = prev
  refreshSpy.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

afterEach(() => {
  setFantasiaStorybookCanvasFlag(false)
})
