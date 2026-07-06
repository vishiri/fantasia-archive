import { expect, test } from 'vitest'

import {
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveShowDocumentControlBarStrip,
  resolveShowDocumentTabs
} from '../projectDocumentControlBarVisibility'

test('Test that resolveShowDocumentTabs returns true when opened tabs exist', () => {
  expect(resolveShowDocumentTabs(2)).toBe(true)
  expect(resolveShowDocumentTabs(0)).toBe(false)
})

test('Test that resolveShowDocumentControlBarStrip shows the strip when the setting is off', () => {
  expect(resolveShowDocumentControlBarStrip({
    disableDocumentControlBar: false
  })).toBe(true)
})

test('Test that resolveShowDocumentControlBarStrip hides the strip when the setting is on', () => {
  expect(resolveShowDocumentControlBarStrip({
    disableDocumentControlBar: true
  })).toBe(false)
})

test('Test that resolveActiveDocumentTabName returns undefined when no active document is selected', () => {
  expect(resolveActiveDocumentTabName({
    activeDocumentId: null,
    openedTabs: [{ documentId: 'doc-a' }]
  })).toBeUndefined()
})

test('Test that resolveActiveDocumentTabName returns undefined when the active tab is missing', () => {
  expect(resolveActiveDocumentTabName({
    activeDocumentId: 'doc-missing',
    openedTabs: [{ documentId: 'doc-a' }]
  })).toBeUndefined()
})

test('Test that resolveDocumentTabLabelFromOpenedTab prefers a trimmed draft label', () => {
  expect(resolveDocumentTabLabelFromOpenedTab({
    displayNameDraft: ' Draft ',
    tabLabel: 'Character'
  })).toBe('Draft')
})

test('Test that resolveDocumentTabLabelFromOpenedTab falls back to tab label when draft is blank', () => {
  expect(resolveDocumentTabLabelFromOpenedTab({
    displayNameDraft: '   ',
    tabLabel: 'Character'
  })).toBe('Character')
})
