import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { I_socialContactButton } from 'app/types/I_socialContactButtons'

import SocialContactSingleButton from '../SocialContactSingleButton.vue'

const sampleInput: I_socialContactButton = {
  title: 'Unit title',
  label: 'Unit label',
  url: 'https://example.com',
  icon: 'unit.png',
  width: 12,
  height: 14,
  cssClass: 'website'
}

/**
 * SocialContactSingleButton
 * Production path should surface prop payload on the root link and label text.
 */
test('Test that SocialContactSingleButton renders dataInput for default env wiring', () => {
  const w = mount(SocialContactSingleButton, {
    props: { dataInput: sampleInput },
    global: { mocks: { $t: (k: string) => k } }
  })

  expect(w.attributes('title')).toBe(sampleInput.title)
  expect(w.get('[data-test-locator="socialContactSingleButton-text"]').text()).toBe(sampleInput.label)
  w.unmount()
})

/**
 * SocialContactSingleButton
 * q-btn should expose href and merged layout classes from dataInput.
 */
test('Test that SocialContactSingleButton binds href and cssClass on the contact button', () => {
  const w = mount(SocialContactSingleButton, {
    props: { dataInput: sampleInput },
    global: { mocks: { $t: (k: string) => k } }
  })

  const btn = w.get('[data-test-locator="socialContactSingleButton"]')
  expect(btn.attributes('href')).toBe(sampleInput.url)
  expect(btn.classes()).toContain('socialContactSingleButton')
  expect(btn.classes()).toContain(sampleInput.cssClass)
  w.unmount()
})

/**
 * SocialContactSingleButton
 * Icon region should use label-based alt text and a public-folder path under BASE_URL rules.
 */
test('Test that SocialContactSingleButton image alt and resolved icon path match dataInput', () => {
  const w = mount(SocialContactSingleButton, {
    props: { dataInput: sampleInput },
    global: { mocks: { $t: (k: string) => k } }
  })

  const img = w.get('[data-test-locator="socialContactSingleButton-image"]')
  expect(img.attributes('alt')).toBe(`${sampleInput.label} icon`)
  expect(img.attributes('src')).toMatch(/images\/socialContactButtons\/unit\.png$/)
  w.unmount()
})

/**
 * SocialContactSingleButton
 * Custom Vite base (no trailing slash) should still produce a single slash before images/.
 */
test('Test that SocialContactSingleButton prefixes icon path when BASE_URL is a path without trailing slash', () => {
  vi.stubEnv('BASE_URL', '/app')
  const w = mount(SocialContactSingleButton, {
    props: { dataInput: sampleInput },
    global: { mocks: { $t: (k: string) => k } }
  })

  const img = w.get('[data-test-locator="socialContactSingleButton-image"]')
  expect(img.attributes('src')).toBe('/app/images/socialContactButtons/unit.png')
  w.unmount()
  vi.unstubAllEnvs()
})
