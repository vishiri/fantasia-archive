import { expect, test } from 'vitest'

import { faActiveProjectFilePathsMatch } from 'app/src/scripts/projectManagement/faActiveProjectFilePathsMatch'

/**
 * faActiveProjectFilePathsMatch
 * Exact paths match.
 */
test('Test that faActiveProjectFilePathsMatch returns true for identical paths', () => {
  expect(faActiveProjectFilePathsMatch(
    'C:\\proj\\a.faproject',
    'C:\\proj\\a.faproject'
  )).toBe(true)
})

/**
 * faActiveProjectFilePathsMatch
 * Windows drive letter casing is ignored.
 */
test('Test that faActiveProjectFilePathsMatch returns true for case-insensitive paths', () => {
  expect(faActiveProjectFilePathsMatch(
    'C:\\proj\\a.faproject',
    'c:\\proj\\A.faproject'
  )).toBe(true)
})

/**
 * faActiveProjectFilePathsMatch
 * Different files do not match.
 */
test('Test that faActiveProjectFilePathsMatch returns false for different paths', () => {
  expect(faActiveProjectFilePathsMatch(
    'C:\\proj\\a.faproject',
    'C:\\proj\\b.faproject'
  )).toBe(false)
})

/**
 * faActiveProjectFilePathsMatch
 * Empty candidate paths never match.
 */
test('Test that faActiveProjectFilePathsMatch returns false when candidate path is empty', () => {
  expect(faActiveProjectFilePathsMatch(
    'C:\\proj\\a.faproject',
    ''
  )).toBe(false)
})
