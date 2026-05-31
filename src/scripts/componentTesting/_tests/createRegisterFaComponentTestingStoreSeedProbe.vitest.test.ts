import { createPinia } from 'pinia'
import { expect, test, vi } from 'vitest'

import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'

import { createRegisterFaComponentTestingStoreSeedProbe } from '../functions/createRegisterFaComponentTestingStoreSeedProbe'

/**
 * createRegisterFaComponentTestingStoreSeedProbe
 * Skips patching when Pinia is not active yet.
 */
test('Test that createRegisterFaComponentTestingStoreSeedProbe no-ops without active Pinia', () => {
  const patchStores = vi.fn()
  const setStoreSeedPatch = vi.fn()
  const api = createRegisterFaComponentTestingStoreSeedProbe({
    getActivePinia: () => undefined,
    patchStores,
    setStoreSeedPatch
  })

  api.registerFaComponentTestingStoreSeedProbe()

  const patch = setStoreSeedPatch.mock.calls[0][0] as (seed: I_faComponentTestingStoreSeed) => void
  patch({
    activeProject: {
      filePath: 'C:\\fixture.faproject',
      id: 'fixture-id',
      name: 'Fixture'
    }
  })

  expect(patchStores).not.toHaveBeenCalled()
})

/**
 * createRegisterFaComponentTestingStoreSeedProbe
 * Forwards seeds to the store patch helper when Pinia is available.
 */
test('Test that createRegisterFaComponentTestingStoreSeedProbe patches stores through Pinia', () => {
  const pinia = createPinia()
  const patchStores = vi.fn()
  const setStoreSeedPatch = vi.fn()
  const api = createRegisterFaComponentTestingStoreSeedProbe({
    getActivePinia: () => pinia,
    patchStores,
    setStoreSeedPatch
  })

  api.registerFaComponentTestingStoreSeedProbe()

  const seed: I_faComponentTestingStoreSeed = {
    hideTooltipsProject: true
  }
  const patch = setStoreSeedPatch.mock.calls[0][0] as (payload: I_faComponentTestingStoreSeed) => void
  patch(seed)

  expect(patchStores).toHaveBeenCalledWith(pinia, seed)
})
