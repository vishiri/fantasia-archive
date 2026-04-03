import { expect, test, vi } from 'vitest'

const {
  generateDialogUUIDMarkdownMock,
  generateDialogUUIDComponentMock,
  markdownStoreMock,
  componentStoreMock
} = vi.hoisted(() => {
  const markdownStore = {
    documentToOpen: 'license',
    generateDialogUUID: vi.fn()
  }
  const componentStore = {
    dialogToOpen: 'AboutFantasiaArchive',
    generateDialogUUID: vi.fn()
  }

  return {
    generateDialogUUIDMarkdownMock: markdownStore.generateDialogUUID,
    generateDialogUUIDComponentMock: componentStore.generateDialogUUID,
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

import { openDialogComponent, openDialogMarkdownDocument } from '../openDialogMarkdownDocument'

/**
 * openDialogMarkdownDocument
 * Test that markdown dialog target and UUID trigger are set.
 */
test('Test that openDialogMarkdownDocument updates markdown dialog store', () => {
  openDialogMarkdownDocument('changeLog')
  expect(markdownStoreMock.documentToOpen).toBe('changeLog')
  expect(generateDialogUUIDMarkdownMock).toHaveBeenCalledOnce()
})

/**
 * openDialogComponent
 * Test that component dialog target and UUID trigger are set.
 */
test('Test that openDialogComponent updates component dialog store', () => {
  openDialogComponent('AboutFantasiaArchive')
  expect(componentStoreMock.dialogToOpen).toBe('AboutFantasiaArchive')
  expect(generateDialogUUIDComponentMock).toHaveBeenCalledOnce()
})
