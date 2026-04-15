import { flushPromises, mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import ComponentTesting from '../ComponentTesting.vue'

/**
 * ComponentTesting
 * Resolves the SFC named by the route param and mounts it when the name matches script setup inference.
 */
test('Test that ComponentTesting mounts FantasiaMascotImage when componentName matches SFC name', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="fantasiaMascotImage-image"]').exists()).toBe(true)
  w.unmount()
})

/**
 * ComponentTesting
 * Unknown route param values do not resolve to a component, so the dynamic component slot stays empty.
 */
test('Test that ComponentTesting renders no matched component when componentName does not exist', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/ZzzNonexistentComponentXxx')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="fantasiaMascotImage-image"]').exists()).toBe(false)
  expect(w.find('q-page').exists()).toBe(true)
  w.unmount()
})

/**
 * ComponentTesting / readInitialComponentProps
 * Ignores COMPONENT_PROPS from getCachedSnapshot when the value is an array.
 */
test('Test that ComponentTesting ignores cached COMPONENT_PROPS when it is an array', async () => {
  const getCachedSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot as ReturnType<typeof vi.fn>
  getCachedSnapshot.mockReturnValue({
    COMPONENT_PROPS: ['not', 'props']
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-width="initial"]').exists()).toBe(true)
  w.unmount()
})

/**
 * ComponentTesting / currentComponent
 * Uses empty-string resolution when the route omits the componentName param key entirely.
 */
test('Test that ComponentTesting resolves no component when the route has no componentName param key', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting-static',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting-static')
  await router.isReady()

  expect(router.currentRoute.value.params.componentName).toBeUndefined()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="fantasiaMascotImage-image"]').exists()).toBe(false)
  w.unmount()
})

/**
 * ComponentTesting / readInitialComponentProps
 * Uses plain-object COMPONENT_PROPS from getCachedSnapshot for the initial prop list.
 */
test('Test that ComponentTesting applies cached plain-object COMPONENT_PROPS on first render', async () => {
  const getCachedSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot as ReturnType<typeof vi.fn>
  getCachedSnapshot.mockReturnValue({
    COMPONENT_PROPS: {
      width: 77
    }
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-width="77"]').exists()).toBe(true)
  w.unmount()
})

/**
 * ComponentTesting / onMounted
 * Leaves propList unchanged when extraEnvVariables omits getSnapshot.
 */
test('Test that ComponentTesting skips snapshot prop refresh when getSnapshot is absent', async () => {
  const getCachedSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot as ReturnType<typeof vi.fn>
  getCachedSnapshot.mockReturnValue({
    COMPONENT_PROPS: {
      width: 88
    }
  })

  const bridge = window.faContentBridgeAPIs.extraEnvVariables
  const prevGetSnapshot = bridge.getSnapshot
  delete (bridge as { getSnapshot?: unknown }).getSnapshot

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-width="88"]').exists()).toBe(true)
  w.unmount()

  bridge.getSnapshot = prevGetSnapshot
})

/**
 * ComponentTesting / onMounted
 * Keeps cached props when getSnapshot resolves without COMPONENT_PROPS.
 */
test('Test that ComponentTesting keeps initial props when snapshot lacks COMPONENT_PROPS', async () => {
  const getCachedSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot as ReturnType<typeof vi.fn>
  getCachedSnapshot.mockReturnValue({
    COMPONENT_PROPS: {
      width: 88
    }
  })

  const getSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getSnapshot as ReturnType<typeof vi.fn>
  getSnapshot.mockResolvedValueOnce({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: undefined,
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: undefined
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-width="88"]').exists()).toBe(true)
  w.unmount()
})

/**
 * ComponentTesting / onMounted
 * Replaces propList when getSnapshot returns COMPONENT_PROPS.
 */
test('Test that ComponentTesting replaces props from async getSnapshot COMPONENT_PROPS', async () => {
  const getCachedSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot as ReturnType<typeof vi.fn>
  getCachedSnapshot.mockReturnValue(null)

  const getSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getSnapshot as ReturnType<typeof vi.fn>
  getSnapshot.mockResolvedValueOnce({
    COMPONENT_NAME: undefined,
    COMPONENT_PROPS: {
      width: 33
    },
    ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 0,
    TEST_ENV: undefined
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-width="33"]').exists()).toBe(true)
  w.unmount()
})

/**
 * ComponentTesting / currentComponent
 * Uses the first segment when the route exposes componentName as a string array from a repeatable param.
 */
test('Test that ComponentTesting resolves FantasiaMascotImage when componentName param is a string array', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName+',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage/extra')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="fantasiaMascotImage-image"]').exists()).toBe(true)
  w.unmount()
})

/**
 * ComponentTesting / currentComponent
 * Resolves no component when a zero-or-more param yields an empty componentName array.
 */
test('Test that ComponentTesting resolves no component when repeatable componentName resolves to an empty array', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName*',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="fantasiaMascotImage-image"]').exists()).toBe(false)
  w.unmount()
})

/**
 * ComponentTesting / readInitialComponentProps
 * Ignores cached COMPONENT_PROPS when the value is a non-object primitive.
 */
test('Test that ComponentTesting ignores cached COMPONENT_PROPS when it is a string primitive', async () => {
  const getCachedSnapshot = window.faContentBridgeAPIs.extraEnvVariables.getCachedSnapshot as ReturnType<typeof vi.fn>
  getCachedSnapshot.mockReturnValue({
    COMPONENT_PROPS: 'not-an-object'
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/componentTesting/:componentName',
        component: ComponentTesting
      }
    ]
  })

  await router.push('/componentTesting/FantasiaMascotImage')
  await router.isReady()

  const w = mount(ComponentTesting, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [router]
    }
  })

  await flushPromises()

  expect(w.find('[data-test-layout-width="initial"]').exists()).toBe(true)
  w.unmount()
})
