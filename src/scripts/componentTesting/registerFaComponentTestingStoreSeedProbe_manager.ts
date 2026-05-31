import { getActivePinia } from 'pinia'

import { createRegisterFaComponentTestingStoreSeedProbe } from './functions/createRegisterFaComponentTestingStoreSeedProbe'
import { patchFaComponentTestingStores } from './faComponentTestingStoreSeedPatchWiring'

const registerFaComponentTestingStoreSeedProbeApi = createRegisterFaComponentTestingStoreSeedProbe({
  getActivePinia,
  patchStores: patchFaComponentTestingStores,
  setStoreSeedPatch: (patch) => {
    window.__faComponentTestingPatchStores = patch
  }
})

export const registerFaComponentTestingStoreSeedProbe =
  registerFaComponentTestingStoreSeedProbeApi.registerFaComponentTestingStoreSeedProbe
