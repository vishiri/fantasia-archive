import { expect, test } from 'vitest'

import {
  FA_RECENT_PROJECTS_MAX,
  faRecentProjectListStructuralNormalize,
  faRecentProjectPathLooksValidStructural
} from '../faRecentProjectListStructural'

test('Test that structural path helper rejects empty and relative paths', () => {
  expect(faRecentProjectPathLooksValidStructural('')).toBe(false)
  expect(faRecentProjectPathLooksValidStructural('relative.faproject')).toBe(false)
  expect(faRecentProjectPathLooksValidStructural('/abs/ok.faproject')).toBe(true)
  expect(faRecentProjectPathLooksValidStructural('//unc/share/x.faproject')).toBe(true)
  expect(faRecentProjectPathLooksValidStructural('/abs/not.txt')).toBe(false)
})

/**
 * faRecentProjectListStructuralNormalize
 * Newest row wins when paths dedupe.
 */
test('Test that normalize keeps first occurrence per path key only', () => {
  const rows = faRecentProjectListStructuralNormalize([
    {
      filePath: 'D:\\a.faproject',
      name: 'Second'
    },
    {
      filePath: 'D:\\a.faproject',
      name: 'First'
    }
  ])
  expect(rows).toEqual([{
    filePath: 'D:\\a.faproject',
    name: 'Second'
  }])
})

test('Test that normalize drops invalid rows and caps length', () => {
  const many = Array.from({ length: 15 }, (_, i) => ({
    filePath: `D:\\p${i}.faproject`,
    name: `N${i}`
  }))
  const out = faRecentProjectListStructuralNormalize([
    {
      filePath: '',
      name: 'x'
    },
    {
      filePath: 'relative.faproject',
      name: 'r'
    },
    ...many
  ])
  expect(out.length).toBe(FA_RECENT_PROJECTS_MAX)
  expect(out[0]?.name).toBe('N0')
})

test('Test that normalize trims fields', () => {
  const out = faRecentProjectListStructuralNormalize([
    {
      filePath: '  D:\\z.faproject  ',
      name: '  Z  '
    }
  ])
  expect(out).toEqual([{
    filePath: 'D:\\z.faproject',
    name: 'Z'
  }])
})
