import { Result } from 'neverthrow'

import { S_FaActionManager } from 'app/src/stores/S_FaActionManager'

import { createResolveFaActionManagerStore } from './functions/createResolveFaActionManagerStore'

const resolveFaActionManagerStoreApi = createResolveFaActionManagerStore({
  fromThrowable: Result.fromThrowable,
  getFaActionManagerStore: () => S_FaActionManager()
})

export const resolveFaActionManagerStore =
  resolveFaActionManagerStoreApi.resolveFaActionManagerStore
