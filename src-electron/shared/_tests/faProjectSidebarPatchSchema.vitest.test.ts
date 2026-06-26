import { expect, test } from 'vitest'

import { parseFaProjectSidebarPatch } from '../faProjectSidebarPatchSchema'

test('parseFaProjectSidebarPatch accepts widthPx at minimum', () => {
  expect(parseFaProjectSidebarPatch({ widthPx: 375 })).toEqual({
    widthPx: 375
  })
})

test('parseFaProjectSidebarPatch rejects width below minimum', () => {
  expect(() => parseFaProjectSidebarPatch({ widthPx: 374 })).toThrow()
})

test('parseFaProjectSidebarPatch rejects non-object payloads', () => {
  expect(() => parseFaProjectSidebarPatch(null)).toThrow(TypeError)
})
