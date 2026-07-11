import { expect, test, vi } from 'vitest'

import {
  getProjectDocumentControlBarKeybindsSnapshot,
  notifyCreateForProjectDocumentControlBar
} from '../projectDocumentControlBarManagerDepsWiring'

/**
 * notifyCreateForProjectDocumentControlBar
 * Delegates positive and negative toasts through Quasar Notify.
 */
test('Test that notifyCreateForProjectDocumentControlBar calls Quasar Notify.create', async () => {
  const { Notify } = await import('quasar')
  const createSpy = vi.spyOn(Notify, 'create').mockImplementation(() => undefined as never)
  notifyCreateForProjectDocumentControlBar({
    message: 'Saved',
    type: 'positive'
  })
  expect(createSpy).toHaveBeenCalledWith({
    message: 'Saved',
    type: 'positive'
  })
  createSpy.mockRestore()
})

/**
 * getProjectDocumentControlBarKeybindsSnapshot
 * Reads the live keybind snapshot from Pinia.
 */
test('Test that getProjectDocumentControlBarKeybindsSnapshot returns store snapshot', async () => {
  const { createPinia, setActivePinia } = await import('pinia')
  const { S_FaKeybinds } = await import('app/src/stores/S_FaKeybinds')
  setActivePinia(createPinia())
  expect(getProjectDocumentControlBarKeybindsSnapshot()).toEqual(S_FaKeybinds().snapshot)
})
