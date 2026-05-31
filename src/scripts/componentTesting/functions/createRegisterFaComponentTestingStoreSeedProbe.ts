import type { Pinia } from 'app/types/I_vuePiniaInjected'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'

export function createRegisterFaComponentTestingStoreSeedProbe (deps: {
  getActivePinia: () => Pinia | undefined
  patchStores: (pinia: Pinia, seed: I_faComponentTestingStoreSeed) => void
  setStoreSeedPatch: (patch: (seed: I_faComponentTestingStoreSeed) => void) => void
}): {
    registerFaComponentTestingStoreSeedProbe: () => void
  } {
  const registerFaComponentTestingStoreSeedProbe = (): void => {
    deps.setStoreSeedPatch((seed) => {
      const pinia = deps.getActivePinia()
      if (pinia === undefined) {
        return
      }
      deps.patchStores(pinia, seed)
    })
  }

  return {
    registerFaComponentTestingStoreSeedProbe
  }
}
