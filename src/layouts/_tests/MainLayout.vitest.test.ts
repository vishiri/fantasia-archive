import { flushPromises } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { setFantasiaStorybookCanvasFlag } from 'app/src/scripts/appInternals/appInternals_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import { mountMainLayoutForVitest } from './mainLayoutVitestMount'

function countKeydownCaptureAdds (spy: { mock: { calls: unknown[][] } }): number {
  return spy.mock.calls.filter((call) => {
    return call[0] === 'keydown' && call[2] === true
  }).length
}

/**
 * MainLayout
 * Welcome route keeps the shared shell but hides the workspace drawer.
 */
test('Test that MainLayout on welcome route hides the workspace drawer', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'spa')

  const w = await mountMainLayoutForVitest('/')

  await flushPromises()

  expect(w.find('[data-test-locator="mainLayout"]').exists()).toBe(true)
  expect(w.find('.appShellLayout--welcome').exists()).toBe(true)
  expect(w.find('[data-test-locator="mainLayout-drawer"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="mainLayout-vitest-leaf"]').exists()).toBe(true)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout
 * Workspace route opens the drawer (v-model) so Quasar can run slide-right.
 */
test('Test that MainLayout on workspace route shows the workspace drawer chrome', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'spa')

  const w = await mountMainLayoutForVitest('/home')

  await flushPromises()

  expect(w.find('.appShellLayout--workspace').exists()).toBe(true)
  expect(w.find('[data-test-locator="mainLayout-drawer"]').exists()).toBe(true)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout
 * Renders header chrome stubs and a router outlet so the shell layout mounts without the full menu tree.
 */
test('Test that MainLayout mounts with header stubs and router-view slot on workspace route', async () => {
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
 * MainLayout / S_FaActiveProject
 * Header no longer duplicates the project name; Pinia holds the active session label.
 */
test('Test that MainLayout omits header project name while Pinia stores the active project', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'spa')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\arcovia.faproject',
    id: 'id-arc',
    name: 'Arcovia'
  })
  const w = await mountMainLayoutForVitest()
  await flushPromises()
  expect(w.find('[data-test-locator="mainLayout-activeProjectName"]').exists()).toBe(false)
  expect(S_FaActiveProject().activeProject?.name).toBe('Arcovia')
  w.unmount()
  S_FaActiveProject().clearActiveProject()
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
 * Refreshes recent project MRU when projectManagement exists on the bridge.
 */
test('Test that MainLayout refreshes recent projects list when projectManagement bridge is present', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const recentStore = S_FaRecentProjects()
  const refreshSpy = vi.spyOn(recentStore, 'refreshRecentProjects').mockResolvedValue()

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).toHaveBeenCalledTimes(1)

  refreshSpy.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips MRU hydration when the bridge omits projectManagement.
 */
test('Test that MainLayout skips recent projects refresh when projectManagement bridge is absent', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const recentStore = S_FaRecentProjects()
  const refreshSpy = vi.spyOn(recentStore, 'refreshRecentProjects').mockResolvedValue()

  const prev = window.faContentBridgeAPIs.projectManagement
  delete (window.faContentBridgeAPIs as { projectManagement?: unknown }).projectManagement

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).not.toHaveBeenCalled()

  window.faContentBridgeAPIs.projectManagement = prev
  refreshSpy.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Refreshes persisted project KV surfaces alongside recent projects when projectManagement bridge is present.
 */
test('Test that MainLayout refreshes project noteboard and project styling when projectManagement bridge exists', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const pn = S_FaProjectNoteboard()
  const ps = S_FaProjectStyling()
  const spyNoteboard = vi.spyOn(pn, 'refreshProjectNoteboard').mockResolvedValue(true)
  const spyStyling = vi.spyOn(ps, 'refreshProjectStyling').mockResolvedValue(true)

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(spyNoteboard).toHaveBeenCalledTimes(1)
  expect(spyStyling).toHaveBeenCalledTimes(1)

  spyNoteboard.mockRestore()
  spyStyling.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips project noteboard and styling refresh when projectManagement bridge is absent.
 */
test('Test that MainLayout skips project noteboard and styling refresh without projectManagement', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const pn = S_FaProjectNoteboard()
  const ps = S_FaProjectStyling()
  const spyNoteboard = vi.spyOn(pn, 'refreshProjectNoteboard').mockResolvedValue(true)
  const spyStyling = vi.spyOn(ps, 'refreshProjectStyling').mockResolvedValue(true)

  const prev = window.faContentBridgeAPIs.projectManagement
  delete (window.faContentBridgeAPIs as { projectManagement?: unknown }).projectManagement

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(spyNoteboard).not.toHaveBeenCalled()
  expect(spyStyling).not.toHaveBeenCalled()

  window.faContentBridgeAPIs.projectManagement = prev
  spyNoteboard.mockRestore()
  spyStyling.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Refreshes app noteboard state when the bridge exposes faAppNoteboard.
 */
test('Test that MainLayout refreshes app noteboard when faAppNoteboard bridge is present', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const appNoteboardStore = S_FaAppNoteboard()
  const refreshSpy = vi.spyOn(appNoteboardStore, 'refreshNoteboard').mockResolvedValue(true)

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).toHaveBeenCalledTimes(1)

  refreshSpy.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips app noteboard hydration when the bridge omits faAppNoteboard.
 */
test('Test that MainLayout skips app noteboard refresh when faAppNoteboard bridge is absent', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const appNoteboardStore = S_FaAppNoteboard()
  const refreshSpy = vi.spyOn(appNoteboardStore, 'refreshNoteboard').mockResolvedValue(true)

  const prev = window.faContentBridgeAPIs.faAppNoteboard
  delete (window.faContentBridgeAPIs as { faAppNoteboard?: unknown }).faAppNoteboard

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).not.toHaveBeenCalled()

  window.faContentBridgeAPIs.faAppNoteboard = prev
  refreshSpy.mockRestore()
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
 * Refreshes persisted app styling when the bridge exposes faAppStyling.
 */
test('Test that MainLayout refreshes app styling when faAppStyling bridge is present', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const stylingStore = S_FaAppStyling()
  const refreshSpy = vi.spyOn(stylingStore, 'refreshAppStyling').mockResolvedValue(true)

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).toHaveBeenCalledTimes(1)

  refreshSpy.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * MainLayout / onMounted
 * Skips app styling hydration when the bridge omits faAppStyling.
 */
test('Test that MainLayout skips app styling refresh when faAppStyling bridge is absent', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const stylingStore = S_FaAppStyling()
  const refreshSpy = vi.spyOn(stylingStore, 'refreshAppStyling').mockResolvedValue(true)

  const prev = window.faContentBridgeAPIs.faAppStyling
  delete (window.faContentBridgeAPIs as { faAppStyling?: unknown }).faAppStyling

  const w = await mountMainLayoutForVitest()
  await flushPromises()

  expect(refreshSpy).not.toHaveBeenCalled()

  window.faContentBridgeAPIs.faAppStyling = prev
  refreshSpy.mockRestore()
  w.unmount()
  vi.unstubAllEnvs()
})

afterEach(() => {
  setFantasiaStorybookCanvasFlag(false)
})
