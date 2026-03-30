import { test, expect, vi } from 'vitest'
import { faExternalLinksManagerAPI } from '../faExternalLinksManagerAPI'

const { openExternalMock } = vi.hoisted(() => {
  return {
    openExternalMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    shell: {
      openExternal: openExternalMock
    }
  }
})

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
 * Test if opening external links calls electron shell API.
 */
test('Test if opening external links works', () => {
  const testInput = 'https://www.google.com'
  faExternalLinksManagerAPI.openExternal(testInput)
  expect(openExternalMock).toHaveBeenCalledWith(testInput)
})
