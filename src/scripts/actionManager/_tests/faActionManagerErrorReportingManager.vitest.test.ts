import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { notifyCreateMock } = vi.hoisted(() => ({
  notifyCreateMock: vi.fn()
}))

vi.mock('quasar', () => ({
  Notify: { create: notifyCreateMock }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (key: string) => key } }
}))

import type { I_faActionQueueEntry } from 'app/types/I_faActionManagerDomain'
import * as storeBridgeModule from '../faActionManagerStoreBridge_manager'
import { reportFaActionFailure } from '../faActionManagerErrorReporting_manager'

function buildEntry (): I_faActionQueueEntry {
  return {
    enqueuedAt: Date.now(),
    id: 'closeApp',
    kind: 'sync',
    payload: undefined,
    uid: 'uid-error-reporting-manager'
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  notifyCreateMock.mockReset()
})

/**
 * faActionManagerErrorReporting_manager
 * resolveFaActionManagerStore wrapper delegates to the store bridge.
 */
test('Test that reportFaActionFailure resolves the store through the manager bridge', () => {
  const resolveSpy = vi.spyOn(storeBridgeModule, 'resolveFaActionManagerStore')
  reportFaActionFailure(buildEntry(), new Error('manager bridge'))
  expect(resolveSpy).toHaveBeenCalled()
  resolveSpy.mockRestore()
})

/**
 * faActionManagerErrorReporting_manager
 * resolveFaActionManagerStore wrapper still runs when Pinia is inactive.
 */
test('Test that reportFaActionFailure calls the bridge when no store is active', () => {
  const resolveSpy = vi
    .spyOn(storeBridgeModule, 'resolveFaActionManagerStore')
    .mockReturnValue(null)
  reportFaActionFailure(buildEntry(), new Error('no store'))
  expect(resolveSpy).toHaveBeenCalled()
  resolveSpy.mockRestore()
})

/**
 * reportFaActionFailure
 * Emits the unified failure toast through Notify.create at call time.
 */
test('Test that reportFaActionFailure calls Notify.create for the failure toast', () => {
  reportFaActionFailure(buildEntry(), new Error('resume load failed'))
  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      caption: 'resume load failed',
      type: 'negative'
    })
  )
})
