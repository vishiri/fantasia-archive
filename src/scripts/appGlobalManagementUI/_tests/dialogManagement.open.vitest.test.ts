import { expect, test, vi } from 'vitest'

const {
  generateDialogUUIDMarkdownMock,
  generateDialogUUIDComponentMock,
  markdownVisibleMock,
  markdownStoreMock,
  componentStoreMock
} = vi.hoisted(() => {
  const markdownStore = {
    documentToOpen: 'license',
    generateDialogUUID: vi.fn(),
    markdownDialogOpenCount: 0,
    onMarkdownDialogBecameVisible: vi.fn()
  }
  const componentStore = {
    componentDialogOpenCount: 0,
    dialogToOpen: 'AboutFantasiaArchive',
    generateDialogUUID: vi.fn()
  }

  return {
    generateDialogUUIDComponentMock: componentStore.generateDialogUUID,
    generateDialogUUIDMarkdownMock: markdownStore.generateDialogUUID,
    markdownStoreMock: markdownStore,
    componentStoreMock: componentStore,
    markdownVisibleMock: markdownStore.onMarkdownDialogBecameVisible
  }
})

vi.mock('app/src/stores/S_Dialog', () => {
  return {
    S_DialogMarkdown: () => markdownStoreMock,
    S_DialogComponent: () => componentStoreMock
  }
})

import { openDialogComponent, openDialogMarkdownDocument } from '../dialogManagement'

/**
 * openDialogMarkdownDocument
 * Test that markdown dialog target and UUID trigger are set.
 */
test('Test that openDialogMarkdownDocument updates markdown dialog store', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 0
  openDialogMarkdownDocument('changeLog')
  expect(markdownStoreMock.documentToOpen).toBe('changeLog')
  expect(generateDialogUUIDMarkdownMock).toHaveBeenCalledOnce()
  expect(markdownVisibleMock).toHaveBeenCalledOnce()
})

/**
 * openDialogComponent
 * Test that component dialog target and UUID trigger are set.
 */
test('Test that openDialogComponent updates component dialog store', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 0
  openDialogComponent('AboutFantasiaArchive')
  expect(componentStoreMock.dialogToOpen).toBe('AboutFantasiaArchive')
  expect(generateDialogUUIDComponentMock).toHaveBeenCalledOnce()
})

test('Test that openDialogComponent accepts ProgramSettings dialog name', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 0
  openDialogComponent('ProgramSettings')
  expect(componentStoreMock.dialogToOpen).toBe('ProgramSettings')
  expect(generateDialogUUIDComponentMock).toHaveBeenCalled()
})

test('Test that openDialogComponent accepts NewProjectSettings dialog name', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 0
  openDialogComponent('NewProjectSettings')
  expect(componentStoreMock.dialogToOpen).toBe('NewProjectSettings')
  expect(generateDialogUUIDComponentMock).toHaveBeenCalled()
})

test('Test that openDialogComponent accepts KeybindSettings dialog name', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 0
  openDialogComponent('KeybindSettings')
  expect(componentStoreMock.dialogToOpen).toBe('KeybindSettings')
  expect(generateDialogUUIDComponentMock).toHaveBeenCalled()
})

/**
 * openDialogMarkdownDocument
 * Each open refreshes the document key and triggers a new UUID cycle.
 */
test('Test that openDialogMarkdownDocument calls generateDialogUUID on each open', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 0
  generateDialogUUIDMarkdownMock.mockClear()
  markdownVisibleMock.mockClear()
  openDialogMarkdownDocument('changeLog')
  openDialogMarkdownDocument('license')
  expect(generateDialogUUIDMarkdownMock).toHaveBeenCalledTimes(2)
  expect(markdownStoreMock.documentToOpen).toBe('license')
})

/**
 * openDialogComponent
 * Each open refreshes the dialog key and triggers a new UUID cycle.
 */
test('Test that openDialogComponent calls generateDialogUUID on each open', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 0
  generateDialogUUIDComponentMock.mockClear()
  openDialogComponent('ProgramSettings')
  openDialogComponent('AboutFantasiaArchive')
  expect(generateDialogUUIDComponentMock).toHaveBeenCalledTimes(2)
  expect(componentStoreMock.dialogToOpen).toBe('AboutFantasiaArchive')
})

/**
 * openDialogMarkdownDocument
 * Blocks when a component dialog stack guard reports an open surface.
 */
test('Test that openDialogMarkdownDocument no-ops when a component dialog is open', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 1
  generateDialogUUIDMarkdownMock.mockClear()
  markdownVisibleMock.mockClear()
  openDialogMarkdownDocument('changeLog')
  expect(generateDialogUUIDMarkdownMock).not.toHaveBeenCalled()
  expect(markdownVisibleMock).not.toHaveBeenCalled()
})

/**
 * openDialogComponent
 * Blocks when a markdown dialog stack guard reports an open surface.
 */
test('Test that openDialogComponent no-ops when markdown dialog is open', () => {
  markdownStoreMock.markdownDialogOpenCount = 1
  componentStoreMock.componentDialogOpenCount = 0
  generateDialogUUIDComponentMock.mockClear()
  openDialogComponent('ProgramSettings')
  expect(generateDialogUUIDComponentMock).not.toHaveBeenCalled()
})

/**
 * openDialogComponent
 * Blocks when another component dialog is already open.
 */
test('Test that openDialogComponent no-ops when component dialog count is already positive', () => {
  markdownStoreMock.markdownDialogOpenCount = 0
  componentStoreMock.componentDialogOpenCount = 1
  generateDialogUUIDComponentMock.mockClear()
  openDialogComponent('AboutFantasiaArchive')
  expect(generateDialogUUIDComponentMock).not.toHaveBeenCalled()
})

/**
 * openDialogMarkdownDocument
 * When markdown is already open, skip the visible bump but still refresh document + UUID.
 */
test('Test that openDialogMarkdownDocument skips onMarkdownDialogBecameVisible when count is already positive', () => {
  markdownStoreMock.markdownDialogOpenCount = 1
  componentStoreMock.componentDialogOpenCount = 0
  markdownVisibleMock.mockClear()
  generateDialogUUIDMarkdownMock.mockClear()
  openDialogMarkdownDocument('changeLog')
  expect(markdownVisibleMock).not.toHaveBeenCalled()
  expect(generateDialogUUIDMarkdownMock).toHaveBeenCalledOnce()
  expect(markdownStoreMock.documentToOpen).toBe('changeLog')
})
