import { afterEach, expect, test, vi } from 'vitest'

import { isFaMainWindowNavigationAllowed } from '../faMainWindowNavigationAllowlist'

afterEach(() => {
  vi.unstubAllEnvs()
})

/**
 * isFaMainWindowNavigationAllowed
 * Malformed URL strings are rejected.
 */
test('Test that isFaMainWindowNavigationAllowed rejects malformed URLs', () => {
  expect(isFaMainWindowNavigationAllowed('not a url')).toBe(false)
})

/**
 * isFaMainWindowNavigationAllowed
 * Invalid APP_URL env rejects dev http navigation.
 */
test('Test that isFaMainWindowNavigationAllowed rejects dev http when APP_URL is invalid', () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('APP_URL', ':::')

  expect(isFaMainWindowNavigationAllowed('http://localhost:9000/')).toBe(false)
})

/**
 * isFaMainWindowNavigationAllowed
 * Allows packaged app protocol navigation.
 */
test('Test that isFaMainWindowNavigationAllowed allows app protocol URLs', () => {
  expect(isFaMainWindowNavigationAllowed('app://./index.html')).toBe(true)
})

/**
 * isFaMainWindowNavigationAllowed
 * Allows https navigation.
 */
test('Test that isFaMainWindowNavigationAllowed allows https URLs', () => {
  expect(isFaMainWindowNavigationAllowed('https://example.com/page')).toBe(true)
})

/**
 * isFaMainWindowNavigationAllowed
 * Blocks file and arbitrary http when not dev APP_URL.
 */
test('Test that isFaMainWindowNavigationAllowed blocks file and untrusted http', () => {
  expect(isFaMainWindowNavigationAllowed('file:///etc/passwd')).toBe(false)
  expect(isFaMainWindowNavigationAllowed('http://evil.example/')).toBe(false)
})

/**
 * isFaMainWindowNavigationAllowed
 * In dev, allows navigation to APP_URL origin only.
 */
test('Test that isFaMainWindowNavigationAllowed allows dev APP_URL origin', () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('APP_URL', 'http://localhost:9000/')

  expect(isFaMainWindowNavigationAllowed('http://localhost:9000/#/welcome')).toBe(true)
  expect(isFaMainWindowNavigationAllowed('http://localhost:9001/')).toBe(false)
})
