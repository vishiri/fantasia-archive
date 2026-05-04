import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import IndexPage from '../IndexPage.vue'

/**
 * IndexPage
 * Home route shows a router-link to the test path used by local experiments.
 */
test('Test that IndexPage renders a link to the testeee path', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/home',
        component: IndexPage
      },
      {
        path: '/testeee',
        component: {
          template: '<div />'
        }
      }
    ]
  })

  await router.push('/home')
  await router.isReady()

  const w = mount(IndexPage, {
    global: {
      plugins: [router],
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const link = w.find('a')
  expect(link.exists()).toBe(true)
  expect(link.attributes('href')).toContain('testeee')
  w.unmount()
})
