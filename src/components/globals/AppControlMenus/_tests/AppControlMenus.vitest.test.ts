import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

import * as dialogManagement from 'app/src/scripts/appGlobalManagementUI/dialogManagement'

import { buildDocumentsMenu } from '../_data/documents'
import { buildHelpInfoMenu } from '../_data/helpInfo'
import { buildToolsMenu } from '../_data/tools'
import AppControlMenus from '../AppControlMenus.vue'

/**
 * WindowProgramStyling uses _FaFloatingWindowBodyTeleport (body Teleport); Vitest jsdom has no Quasar root until we add it.
 */
beforeEach(() => {
  if (document.getElementById('q-app') === null) {
    const root = document.createElement('div')
    root.id = 'q-app'
    document.body.appendChild(root)
  }
})

afterEach(() => {
  document.getElementById('q-app')?.remove()
})

/**
 * helpInfo, documents, and tools menu data
 * Triggers are plain callables wired to dialog and markdown helpers; they should not throw with Vitest Pinia active.
 */
test('Test that helpInfo, documents, and tools menu item triggers run without throwing', () => {
  const helpInfo = buildHelpInfoMenu()
  const documents = buildDocumentsMenu({ hasActiveProject: true })
  const tools = buildToolsMenu({ hasActiveProject: true })
  for (const entry of [...helpInfo.data, ...documents.data, ...tools.data]) {
    if (entry.mode === 'item' && typeof entry.trigger === 'function') {
      expect(() => entry.trigger?.()).not.toThrow()
    }
  }
})

/**
 * AppControlMenus
 * Shell layout class should mount for standard env wiring (non-component tests).
 */
test('Test that AppControlMenus renders host layout class', () => {
  const w = mount(AppControlMenus, {
    global: { mocks: { $t: (k: string) => k } }
  })

  expect(w.find('.appControlMenus').exists()).toBe(true)
  w.unmount()
})

/**
 * AppControlMenus
 * Cached snapshot without TEST_ENV should coerce testing type to an empty string.
 */
test('Test that AppControlMenus treats missing TEST_ENV in cached snapshot as empty string', async () => {
  window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot = vi.fn((): I_extraEnvVariablesAPI | null => ({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: undefined,
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0
  }))
  window.faContentBridgeAPIs.extraEnvVariables.getSnapshot = vi.fn(async (): Promise<I_extraEnvVariablesAPI> => ({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: undefined,
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: undefined
  }))

  const w = mount(AppControlMenus, {
    global: { mocks: { $t: (k: string) => k } },
    props: { embedDialogs: false }
  })

  await flushPromises()
  expect(w.find('[data-test-menu-test="appControlMenus-testMenu"]').exists()).toBe(false)
  expect(w.find('[data-test-menu-any="appControlMenus-anyMenu"]').exists()).toBe(true)
  w.unmount()
})

/**
 * AppControlMenus
 * TEST_ENV components should mount the isolated component-testing menu instead of product menus.
 */
test('Test that AppControlMenus renders component-testing menu when TEST_ENV is components', async () => {
  window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot = vi.fn((): I_extraEnvVariablesAPI | null => ({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: undefined,
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'components'
  }))
  window.faContentBridgeAPIs.extraEnvVariables.getSnapshot = vi.fn(async (): Promise<I_extraEnvVariablesAPI> => ({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: undefined,
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'components'
  }))

  const w = mount(AppControlMenus, {
    global: { mocks: { $t: (k: string) => k } },
    props: { embedDialogs: false }
  })

  await flushPromises()
  expect(w.find('[data-test-menu-test="appControlMenus-testMenu"]').exists()).toBe(true)
  w.unmount()
})

/**
 * AppControlMenus
 * When the bridge omits getSnapshot, onMounted should leave testing type from the cached reader only.
 */
test('Test that AppControlMenus skips async snapshot refresh without getSnapshot', async () => {
  const prev = window.faContentBridgeAPIs.extraEnvVariables
  window.faContentBridgeAPIs.extraEnvVariables = {
    getCachedSnapshot: vi.fn((): I_extraEnvVariablesAPI | null => ({
      COMPONENT_NAME: undefined,
      COMPONENT_PROPS: undefined,
      ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
      FA_FRONTEND_RENDER_TIMER: 0,
      TEST_ENV: 'components'
    }))
  } as unknown as typeof prev

  const w = mount(AppControlMenus, {
    global: { mocks: { $t: (k: string) => k } },
    props: { embedDialogs: false }
  })

  await flushPromises()
  expect(w.find('[data-test-menu-test="appControlMenus-testMenu"]').exists()).toBe(true)
  window.faContentBridgeAPIs.extraEnvVariables = prev
  w.unmount()
})

/**
 * AppControlMenus
 * Component-testing menu wiring should invoke openDialogMarkdownDocument for the Markdown document row.
 */
test('Test that AppControlMenus component-testing menu triggers openDialogMarkdownDocument for changeLog', async () => {
  window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot = vi.fn((): I_extraEnvVariablesAPI | null => ({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: undefined,
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'components'
  }))
  window.faContentBridgeAPIs.extraEnvVariables.getSnapshot = vi.fn(async (): Promise<I_extraEnvVariablesAPI> => ({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: undefined,
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: 'components'
  }))

  const spy = vi.spyOn(dialogManagement, 'openDialogMarkdownDocument').mockImplementation(() => {})

  const w = mount(AppControlMenus, {
    attachTo: document.body,
    global: { mocks: { $t: (k: string) => k } },
    props: { embedDialogs: false }
  })

  await flushPromises()

  await w.get('[data-test-menu-test="appControlMenus-testMenu"]').trigger('click')
  await flushPromises()

  const itemTexts = document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem-text"]')
  expect(itemTexts.length).toBeGreaterThan(0)
  ;(itemTexts[0] as HTMLElement).click()
  await flushPromises()

  expect(spy).toHaveBeenCalledWith('changeLog')

  spy.mockRestore()
  w.unmount()
})
