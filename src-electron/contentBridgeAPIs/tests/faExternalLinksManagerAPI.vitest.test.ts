import { test, expect } from 'vitest'
import { faExternalLinksManagerAPI } from '../faExternalLinksManagerAPI'

/**
 * checkIfExternal
 * Test for external link with "htts" input
 */
test('Test for external link with "http" input', () => {
  const testInput = 'http://www.google.com'
  expect(faExternalLinksManagerAPI.checkIfExternal(testInput)).toBe(true)
})

/**
 * checkIfExternal
 * Test for external link with "https" input
 */
test('Test for external link with "https" input', () => {
  const testInput = 'https://www.google.com'
  expect(faExternalLinksManagerAPI.checkIfExternal(testInput)).toBe(true)
})

/**
 * checkIfExternal
 * Test for internal link with "localhost" input
 */
test('Test for internal link with "localhost" input', () => {
  const testInput = 'http://localhost:3000'
  expect(faExternalLinksManagerAPI.checkIfExternal(testInput)).toBe(false)
})

/**
 * openExternal
 * We cannot test this function as it requires Electron to be running.
 */
test.skip('Test if opening external links works')
