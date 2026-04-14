import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ErrorNotFound from '../ErrorNotFound.vue'

/**
 * ErrorNotFound
 * Fullscreen route wires ErrorCard with title and details, matching ErrorCard markup: errorCard-title, mascot, then errorCard-details.
 */
test('Test that ErrorNotFound renders ErrorCard title hook, details block, and error mascot', () => {
  const w = mount(ErrorNotFound, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="errorCard"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="errorCard"]').attributes('data-test-error-card-width')).toBe('600')

  const titleEl = w.get('[data-test-locator="errorCard-title"]')
  expect(titleEl.text()).toBe('errorNotFound.title')

  const detailsEl = w.get('[data-test-locator="errorCard-details"]')
  expect(detailsEl.text()).toContain('errorNotFound.subTitleFirst')
  expect(detailsEl.text()).toContain('errorNotFound.subTitleSecond')

  expect(w.get('[data-test-locator="fantasiaMascotImage-image"]').attributes('data-test-image')).toBe(
    'error'
  )

  w.unmount()
})
