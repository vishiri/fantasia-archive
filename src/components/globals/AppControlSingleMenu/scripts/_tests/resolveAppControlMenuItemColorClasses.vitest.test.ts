import { expect, test } from 'vitest'

import { resolveAppControlMenuItemColorClasses } from '../functions/resolveAppControlMenuItemColorClasses'

test('Test that resolveAppControlMenuItemColorClasses returns muted modifier for grey', () => {
  expect(resolveAppControlMenuItemColorClasses('grey')).toEqual([
    'appControlSingleMenu__item--muted'
  ])
})

test('Test that resolveAppControlMenuItemColorClasses maps brand special colors to text-* utilities', () => {
  expect(resolveAppControlMenuItemColorClasses('secondary')).toEqual(['text-secondary'])
})

test('Test that resolveAppControlMenuItemColorClasses returns empty array when specialColor is unset', () => {
  expect(resolveAppControlMenuItemColorClasses(undefined)).toEqual([])
})
