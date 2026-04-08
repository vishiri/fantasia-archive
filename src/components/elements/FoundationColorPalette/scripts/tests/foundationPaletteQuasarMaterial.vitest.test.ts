import { expect, test } from 'vitest'

import {
  buildQuasarMaterialClassStems,
  buildQuasarMaterialGroups
} from '../foundationPaletteQuasarMaterial'

test('buildQuasarMaterialClassStems returns 19 roots times 15 shades', () => {
  const stems = buildQuasarMaterialClassStems()
  expect(stems).toHaveLength(19 * 15)
  expect(stems[0]).toBe('red')
  expect(stems[1]).toBe('red-1')
  expect(stems).toContain('deep-purple')
  expect(stems).toContain('blue-grey-14')
})

test('buildQuasarMaterialGroups partitions stems into one group per root', () => {
  const groups = buildQuasarMaterialGroups()
  expect(groups).toHaveLength(19)
  expect(groups[0]?.root).toBe('red')
  expect(groups[0]?.stems).toHaveLength(15)
  expect(groups[18]?.root).toBe('blue-grey')
  expect(groups[18]?.stems[14]).toBe('blue-grey-14')
})
