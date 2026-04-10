import { test, expect, vi } from 'vitest'

import { FA_EXTERNAL_LINKS_IPC } from 'app/src-electron/electron-ipc-bridge'

import { faExternalLinksManagerAPI } from '../faExternalLinksManagerAPI'

const { invokeMock } = vi.hoisted(() => {
  return {
    invokeMock: vi.fn(() => Promise.resolve())
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      invoke: invokeMock
    }
  }
})

/**
 * checkIfExternal
 * URL normalization treats uppercase HTTP like lowercase http.
 */
test('Test that uppercase HTTP scheme is treated as external', () => {
  expect(faExternalLinksManagerAPI.checkIfExternal('HTTP://example.com/')).toBe(true)
})

/**
 * checkIfExternal
 * Test for external link with http input
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
 * IPv4 loopback is blocked the same way in preload as in main.
 */
test('Test for internal link with http 127.0.0.1 input', () => {
  expect(faExternalLinksManagerAPI.checkIfExternal('http://127.0.0.1:8080/')).toBe(false)
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
 * Delegates to ipcRenderer.invoke with external-links channel.
 */
test('Test if opening external links invokes main IPC', async () => {
  const testInput = 'https://www.google.com'
  faExternalLinksManagerAPI.openExternal(testInput)

  expect(invokeMock).toHaveBeenCalledWith(
    FA_EXTERNAL_LINKS_IPC.openExternalAsync,
    testInput
  )
})

/**
 * openExternal
 * Swallows invoke rejection so the renderer never sees an unhandled rejection.
 */
test('Test that openExternal ignores invoke rejection', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  faExternalLinksManagerAPI.openExternal('https://www.example.com/')
  await Promise.resolve()
  await Promise.resolve()
  expect(invokeMock).toHaveBeenCalled()
})
