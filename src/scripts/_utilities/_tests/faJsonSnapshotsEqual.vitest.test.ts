import { expect, test } from 'vitest'

import { areFaJsonSnapshotsEqual } from '../faJsonSnapshotsEqual'

/**
 * areFaJsonSnapshotsEqual
 * Matching plain objects compare equal.
 */
test('Test that areFaJsonSnapshotsEqual returns true for matching snapshots', () => {
  expect(areFaJsonSnapshotsEqual(
    {
      a: 1,
      b: 'x'
    },
    {
      a: 1,
      b: 'x'
    }
  )).toBe(true)
})

/**
 * areFaJsonSnapshotsEqual
 * Differing values compare unequal.
 */
test('Test that areFaJsonSnapshotsEqual returns false for differing snapshots', () => {
  expect(areFaJsonSnapshotsEqual(
    {
      a: 1
    },
    {
      a: 2
    }
  )).toBe(false)
})

/**
 * areFaJsonSnapshotsEqual
 * Nested arrays and objects compare by JSON shape.
 */
test('Test that areFaJsonSnapshotsEqual compares nested structures', () => {
  expect(areFaJsonSnapshotsEqual(
    [{
      id: '1',
      nested: {
        n: 2
      }
    }],
    [{
      id: '1',
      nested: {
        n: 2
      }
    }]
  )).toBe(true)
  expect(areFaJsonSnapshotsEqual(
    [{
      id: '1'
    }],
    [{
      id: '2'
    }]
  )).toBe(false)
})
