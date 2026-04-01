import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

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

let S_DialogMarkdown: Awaited<typeof import('../S_Dialog')>['S_DialogMarkdown']
let S_DialogComponent: Awaited<typeof import('../S_Dialog')>['S_DialogComponent']

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  const stores = await import('../S_Dialog')
  S_DialogMarkdown = stores.S_DialogMarkdown
  S_DialogComponent = stores.S_DialogComponent
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
