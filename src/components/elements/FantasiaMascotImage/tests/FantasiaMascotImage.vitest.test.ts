import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import { fantasiaImageList } from 'app/src/scripts/appInfo/fantasiaMascotImageManager'

import FantasiaMascotImage from '../FantasiaMascotImage.vue'

/**
 * FantasiaMascotImage
 * Fixed 'fantasiaImage' prop should bind a deterministic list URL and not random mode.
 */
test('Test that FantasiaMascotImage renders list image and disables random mode when prop is set', () => {
  const w = mount(FantasiaMascotImage, {
    props: {
      fantasiaImage: 'error',
      width: '10px',
      height: '10px'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const img = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(img.attributes('data-test-is-random')).toBe('false')
  expect(img.attributes('src')).toBe(fantasiaImageList.error)
  w.unmount()
})

/**
 * FantasiaMascotImage
 * Empty prop should enable random selection from the mascot list.
 */
test('Test that FantasiaMascotImage enables random mode when fantasiaImage prop is empty', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.25)
  const w = mount(FantasiaMascotImage, {
    props: {
      fantasiaImage: '',
      width: '10px',
      height: '10px'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const img = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(img.attributes('data-test-is-random')).toBe('true')
  expect(img.attributes('src')).toBeTruthy()
  w.unmount()
})
