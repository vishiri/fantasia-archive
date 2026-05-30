import { expect, test } from 'vitest'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

import { formatFaActiveProjectNotifyLabel } from '../functions/faProjectSessionNotifyLabel'

/**
 * formatFaActiveProjectNotifyLabel
 */
test('Test that formatFaActiveProjectNotifyLabel returns empty string for null snap', () => {
  expect(formatFaActiveProjectNotifyLabel(null)).toBe('')
})

/**
 * formatFaActiveProjectNotifyLabel
 */
test('Test that formatFaActiveProjectNotifyLabel prefers trimmed display name', () => {
  const snap: I_faActiveProject = {
    filePath: 'C:\\x\\ignored.faproject',
    id: '1',
    name: '  Realm  '
  }
  expect(formatFaActiveProjectNotifyLabel(snap)).toBe('Realm')
})

/**
 * formatFaActiveProjectNotifyLabel
 */
test('Test that formatFaActiveProjectNotifyLabel falls back to path leaf without extension', () => {
  const snap: I_faActiveProject = {
    filePath: 'D:/dl/My Save.FAPROJECT',
    id: '1',
    name: '   '
  }
  expect(formatFaActiveProjectNotifyLabel(snap)).toBe('My Save')
})

/**
 * formatFaActiveProjectNotifyLabel
 */
test('Test that formatFaActiveProjectNotifyLabel returns empty when path trims to nothing', () => {
  const snap: I_faActiveProject = {
    filePath: '   ',
    id: '1',
    name: '   '
  }
  expect(formatFaActiveProjectNotifyLabel(snap)).toBe('')
})

/**
 * formatFaActiveProjectNotifyLabel
 */
test('Test that formatFaActiveProjectNotifyLabel uses whole path when there is no folder separator', () => {
  const snap: I_faActiveProject = {
    filePath: 'bare.faproject',
    id: '1',
    name: ''
  }
  expect(formatFaActiveProjectNotifyLabel(snap)).toBe('bare')
})
