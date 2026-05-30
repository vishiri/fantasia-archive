import type { T_injectedResultFromThrowable } from 'app/types/I_injectedNeverthrow'

export function createResolveFaActionManagerStore<TStore> (deps: {
  fromThrowable: T_injectedResultFromThrowable
  getFaActionManagerStore: () => TStore
}): {
    resolveFaActionManagerStore: () => TStore | null
  } {
  const resolveFaActionManagerStore = (): TStore | null => {
    return deps.fromThrowable(
      deps.getFaActionManagerStore,
      (): null => null
    )().unwrapOr(null)
  }

  return {
    resolveFaActionManagerStore
  }
}
