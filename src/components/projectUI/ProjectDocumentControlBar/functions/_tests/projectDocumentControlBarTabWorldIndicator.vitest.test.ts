import { expect, test } from 'vitest'

import {
  resolveProjectDocumentControlBarShowWorldTabIndicators,
  resolveProjectDocumentControlBarTabWorldColor,
  resolveProjectDocumentControlBarTabWorldIndicatorColor
} from '../projectDocumentControlBarTabWorldIndicator'

test('Test that resolveProjectDocumentControlBarShowWorldTabIndicators is false for one world', () => {
  expect(resolveProjectDocumentControlBarShowWorldTabIndicators(1)).toBe(false)
})

test('Test that resolveProjectDocumentControlBarShowWorldTabIndicators is true for multiple worlds', () => {
  expect(resolveProjectDocumentControlBarShowWorldTabIndicators(2)).toBe(true)
})

test('Test that resolveProjectDocumentControlBarTabWorldColor resolves world color by id', () => {
  const color = resolveProjectDocumentControlBarTabWorldColor(
    [{
      color: '#00ff66',
      id: 'world-1'
    }],
    'world-1'
  )
  expect(color).toBe('#00ff66')
})

test('Test that resolveProjectDocumentControlBarTabWorldIndicatorColor hides for single-world projects', () => {
  const color = resolveProjectDocumentControlBarTabWorldIndicatorColor({
    projectWorldCount: 1,
    tab: { worldId: 'world-1' },
    worlds: [{
      color: '#00ff66',
      id: 'world-1'
    }]
  })
  expect(color).toBeNull()
})

test('Test that resolveProjectDocumentControlBarTabWorldIndicatorColor resolves color for multi-world projects', () => {
  const color = resolveProjectDocumentControlBarTabWorldIndicatorColor({
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
 * resolveProjectDocumentControlBarTabWorldColor
 * Returns null for missing, blank, or unknown world ids and empty colors.
 */
test('Test that resolveProjectDocumentControlBarTabWorldColor returns null for invalid world ids', () => {
  const worlds = [{
    color: '#00ff66',
    id: 'world-1'
  }]

  expect(resolveProjectDocumentControlBarTabWorldColor(worlds, null)).toBeNull()
  expect(resolveProjectDocumentControlBarTabWorldColor(worlds, undefined)).toBeNull()
  expect(resolveProjectDocumentControlBarTabWorldColor(worlds, '')).toBeNull()
  expect(resolveProjectDocumentControlBarTabWorldColor(worlds, 'missing-world')).toBeNull()
})

test('Test that resolveProjectDocumentControlBarTabWorldColor returns null for blank world colors', () => {
  const color = resolveProjectDocumentControlBarTabWorldColor(
    [{
      color: '   ',
      id: 'world-1'
    }],
    'world-1'
  )
  expect(color).toBeNull()
})

test('Test that resolveProjectDocumentControlBarTabWorldColor trims world colors', () => {
  const color = resolveProjectDocumentControlBarTabWorldColor(
    [{
      color: '  #00ff66  ',
      id: 'world-1'
    }],
    'world-1'
  )
  expect(color).toBe('#00ff66')
})
