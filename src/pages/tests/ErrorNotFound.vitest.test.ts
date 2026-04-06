import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ErrorNotFound from '../ErrorNotFound.vue'

/**
 * ErrorNotFound
 * Fullscreen error card shows translated title copy and the Fantasia error mascot.
 */
test('Test that ErrorNotFound renders error title keys and mascot image hook', () => {
  const w = mount(ErrorNotFound, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.text()).toContain('errorNotFound.title')
  expect(w.find('[data-test-locator="fantasiaMascotImage-image"]').exists()).toBe(true)
  w.unmount()
})
