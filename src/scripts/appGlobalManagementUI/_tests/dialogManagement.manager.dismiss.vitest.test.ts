/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const {
  markdownStoreMock,
  componentStoreMock
} = vi.hoisted(() => {
  const markdownStore = {
    documentToOpen: 'advancedSearchGuide' as const,
    markdownDialogOpenCount: 0
  }
  const componentStore = {
    componentDialogOpenCount: 0,
    dialogToOpen: 'AppSettings' as const
  }

  return {
    markdownStoreMock: markdownStore,
    componentStoreMock: componentStore
  }
})

vi.mock('app/src/stores/S_Dialog', () => {
  return {
    S_DialogMarkdown: () => markdownStoreMock,
    S_DialogComponent: () => componentStoreMock
  }
})

import {
  dispatchFaQuasarEscapeDismiss,
  isFaComponentDialogOpen,
  isFaMarkdownDocumentOpen,
  tryDismissFaComponentDialogIfOpen,
  tryDismissFaMarkdownDocumentIfOpen
} from '../dialogManagement_manager'

beforeEach(() => {
  componentStoreMock.componentDialogOpenCount = 0
  componentStoreMock.dialogToOpen = 'AppSettings'
  markdownStoreMock.markdownDialogOpenCount = 0
  markdownStoreMock.documentToOpen = 'advancedSearchGuide'
})

/**
 * Manager dismiss wiring
 * Covers dialogManagement_manager dismiss exports end to end.
 */
test('Test that manager dismiss exports read stores and dispatch Escape when open', () => {
  expect(isFaComponentDialogOpen('AppSettings')).toBe(false)
  expect(isFaMarkdownDocumentOpen('advancedSearchGuide')).toBe(false)
  expect(tryDismissFaComponentDialogIfOpen('AppSettings')).toBe(false)
  expect(tryDismissFaMarkdownDocumentIfOpen('advancedSearchGuide')).toBe(false)

  const listener = vi.fn()
  window.addEventListener('keydown', listener)
  window.addEventListener('keyup', listener)

  dispatchFaQuasarEscapeDismiss()
  expect(listener).toHaveBeenCalledTimes(2)

  componentStoreMock.componentDialogOpenCount = 1
  expect(isFaComponentDialogOpen('AppSettings')).toBe(true)
  expect(tryDismissFaComponentDialogIfOpen('AppSettings')).toBe(true)

  markdownStoreMock.markdownDialogOpenCount = 1
  expect(isFaMarkdownDocumentOpen('advancedSearchGuide')).toBe(true)
  expect(tryDismissFaMarkdownDocumentIfOpen('advancedSearchGuide')).toBe(true)

  window.removeEventListener('keydown', listener)
  window.removeEventListener('keyup', listener)
})
