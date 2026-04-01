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
 * checkIfExternal
 * https://localhost is treated as internal (localhost substring excluded).
 */
test('Test for internal link with https localhost URL', () => {
  expect(faExternalLinksManagerAPI.checkIfExternal('https://localhost/path')).toBe(false)
})

/**
 * checkIfExternal
 * Loopback IP is treated as external (only localhost substring is excluded).
 */
test('Test for external link with http 127.0.0.1 input', () => {
  expect(faExternalLinksManagerAPI.checkIfExternal('http://127.0.0.1:8080/')).toBe(true)
})

/**
 * checkIfExternal
 * Relative path has no http scheme — not external.
 */
test('Test that relative path is not treated as external', () => {
  expect(faExternalLinksManagerAPI.checkIfExternal('/docs/page')).toBe(false)
})

/**
 * checkIfExternal
 * file URL is not treated as external by current rules.
 */
test('Test that file URL is not treated as external', () => {
  expect(faExternalLinksManagerAPI.checkIfExternal('file:///C:/app/index.html')).toBe(false)
})

/**
 * checkIfExternal
 * Empty string is not external.
 */
test('Test that empty string is not treated as external', () => {
  expect(faExternalLinksManagerAPI.checkIfExternal('')).toBe(false)
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
