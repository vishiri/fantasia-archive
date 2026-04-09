import { expect, test } from 'vitest'

import {
  FOUNDATION_TYPOGRAPHY_HEADINGS,
  FOUNDATION_TYPOGRAPHY_HELPERS,
  FOUNDATION_TYPOGRAPHY_WEIGHTS
} from '../foundationTypographySamples'

test('foundation typography headings cover Quasar scale entries', () => {
  expect(FOUNDATION_TYPOGRAPHY_HEADINGS.length).toBe(12)
  expect(FOUNDATION_TYPOGRAPHY_HEADINGS[0]?.className).toBe('text-h1')
  expect(FOUNDATION_TYPOGRAPHY_HEADINGS[11]?.className).toBe('text-overline')
})

test('foundation typography weights list six Quasar helpers', () => {
  expect(FOUNDATION_TYPOGRAPHY_WEIGHTS.length).toBe(6)
  expect(FOUNDATION_TYPOGRAPHY_WEIGHTS.map((r) => r.className)).toContain('text-weight-medium')
})

test('foundation typography helpers include alignment and transform classes', () => {
  expect(FOUNDATION_TYPOGRAPHY_HELPERS.length).toBe(11)
  const classes = FOUNDATION_TYPOGRAPHY_HELPERS.map((h) => h.className)
  expect(classes).toContain('text-justify')
  expect(classes).toContain('text-capitalize')
})
