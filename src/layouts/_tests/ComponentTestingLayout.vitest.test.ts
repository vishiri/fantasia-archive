import { flushPromises, mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { setFantasiaStorybookCanvasFlag } from 'app/src/scripts/appInternals/rendererAppInternals'

import ComponentTestingLayout from '../ComponentTestingLayout.vue'

/**
 * ComponentTestingLayout
 * Nested default child renders inside the layout router-view when the router is on a component-testing route.
 */
test('Test that ComponentTestingLayout renders nested default route inside router-view', async () => {
  const Child = {
    name: 'LayoutChildStub',
    template: '<div data-test-layout-child>child-route</div>'
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTestingLayout,
        children: [
          {
            path: '',
            component: Child
          }
        ]
      }
    ]
  })

  await router.push('/componentTesting/Example')
  await router.isReady()

  const w = mount(ComponentTestingLayout, {
    global: {
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-child]').exists()).toBe(true)
  expect(w.find('[data-test-layout-child]').text()).toContain('child-route')
  w.unmount()
})

/**
 * ComponentTestingLayout
 * Hydrates persisted user settings from main on mount in Electron so component tests match **MainLayout** after reload.
 */
test('Test that ComponentTestingLayout refreshes user settings when MODE is electron', async () => {
  vi.stubEnv('MODE', 'electron')

  const Child = {
    name: 'LayoutChildStub',
    template: '<div data-test-layout-child>child-route</div>'
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTestingLayout,
        children: [
          {
            path: '',
            component: Child
          }
        ]
      }
    ]
  })

  await router.push('/componentTesting/Example')
  await router.isReady()

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  getSettings.mockClear()
  getSettings.mockResolvedValue({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'de'
  })

  const w = mount(ComponentTestingLayout, {
    global: {
      plugins: [router]
    }
  })

  await flushPromises()

  expect(getSettings).toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * ComponentTestingLayout / onMounted
 * Skips user-settings refresh when the Storybook canvas flag is set so preview routes stay isolated.
 */
test('Test that ComponentTestingLayout skips user settings refresh when storybook canvas flag is true', async () => {
  setFantasiaStorybookCanvasFlag(true)
  vi.stubEnv('MODE', 'electron')

  const Child = {
    name: 'LayoutChildStub',
    template: '<div data-test-layout-child>child-route</div>'
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTestingLayout,
        children: [
          {
            path: '',
            component: Child
          }
        ]
      }
    ]
  })

  await router.push('/componentTesting/Example')
  await router.isReady()

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  getSettings.mockClear()

  const w = mount(ComponentTestingLayout, {
    global: {
      plugins: [router]
    }
  })

  await flushPromises()

  expect(getSettings).not.toHaveBeenCalled()
  w.unmount()
  setFantasiaStorybookCanvasFlag(false)
  vi.unstubAllEnvs()
})

/**
 * ComponentTestingLayout / onMounted
 * Skips user-settings refresh when MODE is not electron even outside Storybook canvas.
 */
test('Test that ComponentTestingLayout skips user settings refresh when MODE is not electron', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'spa')

  const Child = {
    name: 'LayoutChildStub',
    template: '<div data-test-layout-child>child-route</div>'
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTestingLayout,
        children: [
          {
            path: '',
            component: Child
          }
        ]
      }
    ]
  })

  await router.push('/componentTesting/Example')
  await router.isReady()

  const getSettings = window.faContentBridgeAPIs.faUserSettings.getSettings as ReturnType<typeof vi.fn>
  getSettings.mockClear()

  const w = mount(ComponentTestingLayout, {
    global: {
      plugins: [router]
    }
  })

  await flushPromises()

  expect(getSettings).not.toHaveBeenCalled()
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * ComponentTestingLayout / onMounted
 * Skips refresh when the Electron bridge omits faUserSettings.
 */
test('Test that ComponentTestingLayout skips user settings refresh when faUserSettings bridge is absent', async () => {
  setFantasiaStorybookCanvasFlag(false)
  vi.stubEnv('MODE', 'electron')

  const prev = window.faContentBridgeAPIs.faUserSettings
  delete (window.faContentBridgeAPIs as { faUserSettings?: unknown }).faUserSettings

  const Child = {
    name: 'LayoutChildStub',
    template: '<div data-test-layout-child>child-route</div>'
  }

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTestingLayout,
        children: [
          {
            path: '',
            component: Child
          }
        ]
      }
    ]
  })

  await router.push('/componentTesting/Example')
  await router.isReady()

  const w = mount(ComponentTestingLayout, {
    global: {
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-child]').exists()).toBe(true)
  w.unmount()

  window.faContentBridgeAPIs.faUserSettings = prev
  vi.unstubAllEnvs()
})
