import { afterEach, expect, test } from 'vitest'

import { faRecentProjectPathKey } from '../faRecentProjectPathKey'

const origPlatform = process.platform

afterEach(() => {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: origPlatform
  })
})

/**
 * faRecentProjectPathKey
 * Windows dedupes with case folding and slash normalization.
 */
test('Test that path key lowercases and collapses slashes on win32', () => {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: 'win32'
  })
  expect(faRecentProjectPathKey('D:\\\\Alpha\\\\B.faproject')).toBe('d:/alpha/b.faproject')
})

/**
 * faRecentProjectPathKey
 * POSIX keeps case and normalizes slashes.
 */
test('Test that path key preserves case on non-win32', () => {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: 'linux'
  })
  expect(faRecentProjectPathKey('/home/User/proj.FAPROJECT')).toBe('/home/User/proj.FAPROJECT')
})

test('Test that missing process platform is treated as non-windows', () => {
  const d = Object.getOwnPropertyDescriptor(process, 'platform')
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: undefined
  })
  expect(faRecentProjectPathKey('D:\\Mix.FAPROJECT')).toBe('D:/Mix.FAPROJECT')
  if (d !== undefined) {
    Object.defineProperty(process, 'platform', d)
  }
})
