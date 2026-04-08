import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type * as S_DialogStores from '../S_Dialog'

const { uuidMock } = vi.hoisted(() => {
  return {
    uuidMock: vi.fn(() => 'uuid-1')
  }
})

vi.mock('uuid', () => {
  return {
    v4: uuidMock
  }
})

let S_DialogMarkdown: ReturnType<typeof S_DialogStores.S_DialogMarkdown>
let S_DialogComponent: ReturnType<typeof S_DialogStores.S_DialogComponent>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  const stores = await import('../S_Dialog')
  S_DialogMarkdown = stores.S_DialogMarkdown()
  S_DialogComponent = stores.S_DialogComponent()
  S_DialogMarkdown.documentToOpen = 'license'
  S_DialogMarkdown.dialogUUID = ''
  S_DialogComponent.dialogToOpen = 'AboutFantasiaArchive'
  S_DialogComponent.dialogUUID = ''
  uuidMock.mockReset()
  uuidMock.mockReturnValue('uuid-1')
})

/**
 * S_DialogMarkdown
 * Test markdown dialog defaults and UUID generation.
 */
test('Test that S_DialogMarkdown has defaults and updates UUID', () => {
  expect(S_DialogMarkdown.documentToOpen).toBe('license')
  expect(S_DialogMarkdown.dialogUUID).toBe('')
  S_DialogMarkdown.generateDialogUUID()
  expect(S_DialogMarkdown.dialogUUID).toBe('uuid-1')
})

/**
 * S_DialogComponent
 * Test component dialog defaults and UUID generation.
 */
test('Test that S_DialogComponent has defaults and updates UUID', () => {
  expect(S_DialogComponent.dialogToOpen).toBe('AboutFantasiaArchive')
  expect(S_DialogComponent.dialogUUID).toBe('')
  S_DialogComponent.generateDialogUUID()
  expect(S_DialogComponent.dialogUUID).toBe('uuid-1')
})

/**
 * S_DialogMarkdown
 * Store fields accept new document keys like production open flows.
 */
test('Test that S_DialogMarkdown documentToOpen accepts a new document key', () => {
  S_DialogMarkdown.documentToOpen = 'changeLog'
  expect(S_DialogMarkdown.documentToOpen).toBe('changeLog')
})

/**
 * S_DialogComponent
 * Store fields accept new dialog keys like production open flows.
 */
test('Test that S_DialogComponent dialogToOpen accepts a new dialog key', () => {
  S_DialogComponent.dialogToOpen = 'ProgramSettings'
  expect(S_DialogComponent.dialogToOpen).toBe('ProgramSettings')
})

/**
 * S_DialogMarkdown
 * Repeated UUID generation overwrites dialogUUID with the latest v4 value.
 */
test('Test that S_DialogMarkdown generateDialogUUID overwrites dialogUUID on each call', () => {
  uuidMock.mockReturnValueOnce('uuid-first').mockReturnValueOnce('uuid-second')
  S_DialogMarkdown.generateDialogUUID()
  expect(S_DialogMarkdown.dialogUUID).toBe('uuid-first')
  S_DialogMarkdown.generateDialogUUID()
  expect(S_DialogMarkdown.dialogUUID).toBe('uuid-second')
})
