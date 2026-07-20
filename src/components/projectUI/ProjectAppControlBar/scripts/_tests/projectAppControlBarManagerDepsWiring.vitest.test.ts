import { expect, test, vi } from 'vitest'

import {
  getProjectAppControlBarKeybindsSnapshot,
  notifyCreateForProjectAppControlBar
} from '../projectAppControlBarManagerDepsWiring'

/**
 * notifyCreateForProjectAppControlBar
 * Delegates positive and negative toasts through Quasar Notify.
 */
test('Test that notifyCreateForProjectAppControlBar calls Quasar Notify.create', async () => {
  const { Notify } = await import('quasar')
  const createSpy = vi.spyOn(Notify, 'create').mockImplementation(() => undefined as never)
  notifyCreateForProjectAppControlBar({
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
 * getProjectAppControlBarKeybindsSnapshot
 * Reads the live keybind snapshot from Pinia.
 */
test('Test that getProjectAppControlBarKeybindsSnapshot returns store snapshot', async () => {
  const { createPinia, setActivePinia } = await import('pinia')
  const { S_FaKeybinds } = await import('app/src/stores/S_FaKeybinds')
  setActivePinia(createPinia())
  expect(getProjectAppControlBarKeybindsSnapshot()).toEqual(S_FaKeybinds().snapshot)
})
