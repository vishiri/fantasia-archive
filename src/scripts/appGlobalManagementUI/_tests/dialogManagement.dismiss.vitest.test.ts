/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

import { createDialogManagementDismiss } from '../functions/createDialogManagementDismiss'

const componentStore = {
  componentDialogOpenCount: 0,
  dialogToOpen: 'AppSettings' as const
}

const markdownStore = {
  documentToOpen: 'advancedSearchGuide' as const,
  markdownDialogOpenCount: 0
}

const dispatchWindowKeyEventMock = vi.fn()

beforeEach(() => {
  componentStore.componentDialogOpenCount = 0
  componentStore.dialogToOpen = 'AppSettings'
  markdownStore.markdownDialogOpenCount = 0
  markdownStore.documentToOpen = 'advancedSearchGuide'
  dispatchWindowKeyEventMock.mockReset()
})

function createApi () {
  return createDialogManagementDismiss({
    dispatchWindowKeyEvent: dispatchWindowKeyEventMock,
    getDialogComponentStore: () => componentStore,
    getDialogMarkdownStore: () => markdownStore
  })
}

/**
 * dispatchFaQuasarEscapeDismiss
 * Fires keydown then keyup so Quasar escape-key can dismiss.
 */
test('Test that dispatchFaQuasarEscapeDismiss fires keydown then keyup', () => {
  const { dispatchFaQuasarEscapeDismiss } = createApi()
  dispatchFaQuasarEscapeDismiss()
  expect(dispatchWindowKeyEventMock.mock.calls).toEqual([['keydown'], ['keyup']])
})

/**
 * isFaComponentDialogOpen
 * True only when count is positive and dialogToOpen matches.
 */
test('Test that isFaComponentDialogOpen requires count and matching dialogToOpen', () => {
  const { isFaComponentDialogOpen } = createApi()
  expect(isFaComponentDialogOpen('AppSettings')).toBe(false)
  componentStore.componentDialogOpenCount = 1
  expect(isFaComponentDialogOpen('AppSettings')).toBe(true)
  expect(isFaComponentDialogOpen('KeybindSettings')).toBe(false)
})

/**
 * isFaMarkdownDocumentOpen
 * True only when count is positive and documentToOpen matches.
 */
test('Test that isFaMarkdownDocumentOpen requires count and matching documentToOpen', () => {
  const { isFaMarkdownDocumentOpen } = createApi()
  expect(isFaMarkdownDocumentOpen('advancedSearchGuide')).toBe(false)
  markdownStore.markdownDialogOpenCount = 1
  expect(isFaMarkdownDocumentOpen('advancedSearchGuide')).toBe(true)
  expect(isFaMarkdownDocumentOpen('changeLog')).toBe(false)
})

/**
 * tryDismissFaComponentDialogIfOpen
 * Returns false and does not dispatch when the dialog is closed.
 */
test('Test that tryDismissFaComponentDialogIfOpen no-ops when closed', () => {
  const { tryDismissFaComponentDialogIfOpen } = createApi()
  expect(tryDismissFaComponentDialogIfOpen('AppSettings')).toBe(false)
  expect(dispatchWindowKeyEventMock).not.toHaveBeenCalled()
})

/**
 * tryDismissFaComponentDialogIfOpen
 * Returns true and dispatches Escape when that component dialog is open.
 */
test('Test that tryDismissFaComponentDialogIfOpen dispatches Escape when open', () => {
  componentStore.componentDialogOpenCount = 1
  const { tryDismissFaComponentDialogIfOpen } = createApi()
  expect(tryDismissFaComponentDialogIfOpen('AppSettings')).toBe(true)
  expect(dispatchWindowKeyEventMock.mock.calls).toEqual([['keydown'], ['keyup']])
})

/**
 * tryDismissFaMarkdownDocumentIfOpen
 * Returns false and does not dispatch when the markdown document is closed.
 */
test('Test that tryDismissFaMarkdownDocumentIfOpen no-ops when closed', () => {
  const { tryDismissFaMarkdownDocumentIfOpen } = createApi()
  expect(tryDismissFaMarkdownDocumentIfOpen('advancedSearchGuide')).toBe(false)
  expect(dispatchWindowKeyEventMock).not.toHaveBeenCalled()
})

/**
 * tryDismissFaMarkdownDocumentIfOpen
 * Returns true and dispatches Escape when that markdown document is open.
 */
test('Test that tryDismissFaMarkdownDocumentIfOpen dispatches Escape when open', () => {
  markdownStore.markdownDialogOpenCount = 1
  const { tryDismissFaMarkdownDocumentIfOpen } = createApi()
  expect(tryDismissFaMarkdownDocumentIfOpen('advancedSearchGuide')).toBe(true)
  expect(dispatchWindowKeyEventMock.mock.calls).toEqual([['keydown'], ['keyup']])
})
