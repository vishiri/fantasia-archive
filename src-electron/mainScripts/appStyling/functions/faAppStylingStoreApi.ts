import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faAppStylingStoreApiDeps } from 'app/types/I_faElectronMainStoreApiDeps'
import type { I_faElectronStoreHandle } from 'app/types/I_faElectronStoreHandle'

export function createFaAppStylingStoreApi (deps: I_faAppStylingStoreApiDeps): {
  cleanup: (store: I_faElectronStoreHandle<I_faAppStylingRoot>) => void
  get: () => I_faElectronStoreHandle<I_faAppStylingRoot>
} {
  const cleanup = (store: I_faElectronStoreHandle<I_faAppStylingRoot>): void => {
    const raw = (store.store ?? {}) as Partial<I_faAppStylingRoot> & Record<string, unknown>
    const {
      next,
      shouldRewrite
    } = deps.buildCleanFaAppStylingRoot(
      raw,
      deps.normalizePersistedRectForStorage,
      deps.persistedFloatingWindowFramesAreEquivalent
    )
    if (shouldRewrite) {
      store.store = next
    }
  }

  const get = deps.createLazySingleton((): I_faElectronStoreHandle<I_faAppStylingRoot> => {
    const store = new deps.ElectronStore({
      defaults: { ...deps.defaults },
      name: deps.storeName
    })
    cleanup(store)
    return store
  })

  return {
    cleanup,
    get
  }
}
