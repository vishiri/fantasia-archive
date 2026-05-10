import { expect, test } from 'vitest'

import { FA_PROJECT_NAME_MAX_LEN } from '../faProjectConstants'
import { parseFaRecentProjectListStored } from '../faRecentProjectListStoredSchema'

test('Test that parse returns empty array for malformed blob', () => {
  expect(parseFaRecentProjectListStored(null)).toEqual([])
  expect(parseFaRecentProjectListStored({ extra: 1 })).toEqual([])
})

test('Test that parse strips unknown keys and defaults missing recentProjects', () => {
  const out = parseFaRecentProjectListStored({
    extra: 'drop',
    recentProjects: [{
      filePath: 'D:\\a.faproject',
      name: 'A'
    }]
  })
  expect(out).toEqual([{
    filePath: 'D:\\a.faproject',
    name: 'A'
  }])
  expect(parseFaRecentProjectListStored({})).toEqual([])
})

test('Test that parse rejects too-long display names', () => {
  const longName = 'x'.repeat(FA_PROJECT_NAME_MAX_LEN + 1)
  const out = parseFaRecentProjectListStored({
    recentProjects: [{
      filePath: 'D:\\a.faproject',
      name: longName
    }]
  })
  expect(out).toEqual([])
})
