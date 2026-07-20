import { expect, test } from 'vitest'

import {
  resolveProjectAppControlBarShowWorldTabIndicators,
  resolveProjectAppControlBarTabWorldColor,
  resolveProjectAppControlBarTabWorldIndicatorColor
} from '../projectAppControlBarTabWorldIndicator'

test('Test that resolveProjectAppControlBarShowWorldTabIndicators is false for one world', () => {
  expect(resolveProjectAppControlBarShowWorldTabIndicators(1)).toBe(false)
})

test('Test that resolveProjectAppControlBarShowWorldTabIndicators is true for multiple worlds', () => {
  expect(resolveProjectAppControlBarShowWorldTabIndicators(2)).toBe(true)
})

test('Test that resolveProjectAppControlBarTabWorldColor resolves world color by id', () => {
  const color = resolveProjectAppControlBarTabWorldColor(
    [{
      color: '#00ff66',
      id: 'world-1'
    }],
    'world-1'
  )
  expect(color).toBe('#00ff66')
})

test('Test that resolveProjectAppControlBarTabWorldIndicatorColor hides for single-world projects', () => {
  const color = resolveProjectAppControlBarTabWorldIndicatorColor({
    projectWorldCount: 1,
    tab: { worldId: 'world-1' },
    worlds: [{
      color: '#00ff66',
      id: 'world-1'
    }]
  })
  expect(color).toBeNull()
})

test('Test that resolveProjectAppControlBarTabWorldIndicatorColor resolves color for multi-world projects', () => {
  const color = resolveProjectAppControlBarTabWorldIndicatorColor({
    projectWorldCount: 2,
    tab: { worldId: 'world-2' },
    worlds: [
      {
        color: '#00ff66',
        id: 'world-1'
      },
      {
        color: '#ff0066',
        id: 'world-2'
      }
    ]
  })
  expect(color).toBe('#ff0066')
})

/**
 * resolveProjectAppControlBarTabWorldColor
 * Returns null for missing, blank, or unknown world ids and empty colors.
 */
test('Test that resolveProjectAppControlBarTabWorldColor returns null for invalid world ids', () => {
  const worlds = [{
    color: '#00ff66',
    id: 'world-1'
  }]

  expect(resolveProjectAppControlBarTabWorldColor(worlds, null)).toBeNull()
  expect(resolveProjectAppControlBarTabWorldColor(worlds, undefined)).toBeNull()
  expect(resolveProjectAppControlBarTabWorldColor(worlds, '')).toBeNull()
  expect(resolveProjectAppControlBarTabWorldColor(worlds, 'missing-world')).toBeNull()
})

test('Test that resolveProjectAppControlBarTabWorldColor returns null for blank world colors', () => {
  const color = resolveProjectAppControlBarTabWorldColor(
    [{
      color: '   ',
      id: 'world-1'
    }],
    'world-1'
  )
  expect(color).toBeNull()
})

test('Test that resolveProjectAppControlBarTabWorldColor trims world colors', () => {
  const color = resolveProjectAppControlBarTabWorldColor(
    [{
      color: '  #00ff66  ',
      id: 'world-1'
    }],
    'world-1'
  )
  expect(color).toBe('#00ff66')
})
