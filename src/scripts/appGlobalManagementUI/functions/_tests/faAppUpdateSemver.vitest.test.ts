import { expect, test } from 'vitest'

import {
  isFaRemoteSemverNewer,
  parseFaSemverTriple,
  stripFaSemverVersion
} from '../faAppUpdateSemver'

/**
 * stripFaSemverVersion
 * Removes a leading v from GitHub-style tags.
 */
test('Test that stripFaSemverVersion removes a leading v prefix', () => {
  expect(stripFaSemverVersion('v2.5.0')).toBe('2.5.0')
  expect(stripFaSemverVersion('V1.0.0')).toBe('1.0.0')
  expect(stripFaSemverVersion('2.4.16')).toBe('2.4.16')
  expect(stripFaSemverVersion('   ')).toBe('')
  expect(stripFaSemverVersion('v  ')).toBe('')
})

/**
 * parseFaSemverTriple
 * Parses major.minor.patch triples.
 */
test('Test that parseFaSemverTriple reads major minor patch numbers', () => {
  expect(parseFaSemverTriple('2.5.0')).toEqual([2, 5, 0])
  expect(parseFaSemverTriple('1')).toEqual([1, 0, 0])
  expect(parseFaSemverTriple('2.8.1')).toEqual([2, 8, 1])
  expect(parseFaSemverTriple('2.6.11')).toEqual([2, 6, 11])
  expect(parseFaSemverTriple('1.2.3-beta+build')).toEqual([1, 2, 3])
  expect(parseFaSemverTriple('')).toBeNull()
  expect(parseFaSemverTriple('nope')).toBeNull()
})

/**
 * isFaRemoteSemverNewer
 * Compares stripped versions for a strictly newer remote.
 */
test('Test that isFaRemoteSemverNewer is true only when remote is greater', () => {
  expect(isFaRemoteSemverNewer('2.4.16', '2.5.0')).toBe(true)
  expect(isFaRemoteSemverNewer('2.5.0', '2.5.0')).toBe(false)
  expect(isFaRemoteSemverNewer('2.5.0', '2.4.16')).toBe(false)
  expect(isFaRemoteSemverNewer('2.6.11', '2.8.1')).toBe(true)
  expect(isFaRemoteSemverNewer('2.8.1', '2.6.11')).toBe(false)
  expect(isFaRemoteSemverNewer('1.0.0', '2.0.0')).toBe(true)
  expect(isFaRemoteSemverNewer('2.0.0', '2.1.0')).toBe(true)
  expect(isFaRemoteSemverNewer('2.1.0', '2.1.1')).toBe(true)
  expect(isFaRemoteSemverNewer('', '1.0.0')).toBe(false)
  expect(isFaRemoteSemverNewer('1.0.0', 'bad')).toBe(false)
})
