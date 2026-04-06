import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
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
