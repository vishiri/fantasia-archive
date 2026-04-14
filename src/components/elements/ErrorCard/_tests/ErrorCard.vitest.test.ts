import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import { fantasiaImageList } from 'app/src/scripts/appInfo/fantasiaMascotImageManager'

import ErrorCard from '../ErrorCard.vue'

/**
 * ErrorCard
 * Renders the title, mascot image for the chosen variant, and optional details under the image.
 */
test('Test that ErrorCard renders title, mascot src, and details when details prop is set', () => {
  const w = mount(ErrorCard, {
    props: {
      title: 'Title line',
      details: 'First detail line\nSecond detail line',
      imageName: 'reading',
      width: 500
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.text()).toContain('Title line')
  expect(w.text()).toContain('First detail line')
  expect(w.text()).toContain('Second detail line')

  const img = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(img.attributes('src')).toBe(fantasiaImageList.reading)
  expect(w.attributes('data-test-error-card-width')).toBe('500')

  const detailsEl = w.get('[data-test-locator="errorCard-details"]')
  expect(detailsEl.text()).toContain('First detail line')
  expect(detailsEl.text()).toContain('Second detail line')

  const markup = w.html()
  const titleIndex = markup.indexOf('errorCard-title')
  const mascotIndex = markup.indexOf('fantasiaMascotImage-image')
  const detailsIndex = markup.indexOf('errorCard-details')
  expect(titleIndex).toBeGreaterThanOrEqual(0)
  expect(mascotIndex).toBeGreaterThan(titleIndex)
  expect(detailsIndex).toBeGreaterThan(mascotIndex)

  w.unmount()
})

/**
 * ErrorCard
 * Omits the details paragraph when the details prop is omitted.
 */
test('Test that ErrorCard hides the details block when details prop is absent', () => {
  const w = mount(ErrorCard, {
    props: {
      title: 'Only title',
      imageName: 'error'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="errorCard-details"]').exists()).toBe(false)
  w.unmount()
})

/**
 * ErrorCard
 * Custom width prop is forwarded to the data attribute for layout contracts.
 */
test('Test that ErrorCard applies a custom width prop to the data-test-error-card-width attribute', () => {
  const w = mount(ErrorCard, {
    props: {
      title: 'W',
      imageName: 'hug',
      width: 420
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.attributes('data-test-error-card-width')).toBe('420')
  w.unmount()
})
