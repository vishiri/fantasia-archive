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

  const root = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(root.attributes('data-test-is-random')).toBe('false')
  expect(root.attributes('src')).toBe(fantasiaImageList.error)
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

  const root = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(root.attributes('data-test-is-random')).toBe('true')
  expect(root.attributes('src')).toBe(fantasiaImageList.flop)
  w.unmount()
})

/**
 * FantasiaMascotImage
 * The reading variant matches production usage in program settings search empty state.
 */
test('Test that FantasiaMascotImage binds reading prop to the reading list URL', () => {
  const w = mount(FantasiaMascotImage, {
    props: {
      fantasiaImage: 'reading',
      width: '10px',
      height: '10px'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const root = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(root.attributes('src')).toBe(fantasiaImageList.reading)
  w.unmount()
})

/**
 * FantasiaMascotImage
 * Unknown keys fall through determineCurrentImage to an undefined list lookup; img still renders without src.
 */
test('Test that FantasiaMascotImage leaves src undefined when fantasiaImage key is not in the list', () => {
  const w = mount(FantasiaMascotImage, {
    props: {
      fantasiaImage: 'notARegisteredMascotKey',
      width: '10px',
      height: '10px'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const root = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(root.attributes('src')).toBeUndefined()
  w.unmount()
})

/**
 * FantasiaMascotImage
 * Alt text combines the shared label message and the resolved variant name for accessibility.
 */
test('Test that FantasiaMascotImage alt combines i18n label and variant name for a fixed prop', () => {
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

  const root = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(root.attributes('alt')).toBe('fantasiaMascotImage.label - error')
  w.unmount()
})

/**
 * FantasiaMascotImage
 * Image URL and random flag are resolved once at setup; later prop changes do not re-resolve (callers should key-remount if needed).
 */
test('Test that FantasiaMascotImage keeps the initial src when fantasiaImage prop changes after mount', async () => {
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

  await w.setProps({
    fantasiaImage: 'reading'
  })

  const root = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(root.attributes('src')).toBe(fantasiaImageList.error)
  expect(root.attributes('data-test-image')).toBe('reading')
  w.unmount()
})
