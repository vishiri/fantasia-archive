import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppNoteboardStoreApiDeps } from 'app/types/I_faElectronMainStoreApiDeps'
import type { I_faElectronStoreHandle } from 'app/types/I_faElectronStoreHandle'

export function createFaAppNoteboardStoreApi (deps: I_faAppNoteboardStoreApiDeps): {
  cleanup: (store: I_faElectronStoreHandle<I_faAppNoteboardRoot>) => void
  get: () => I_faElectronStoreHandle<I_faAppNoteboardRoot>
} {
  const cleanup = (store: I_faElectronStoreHandle<I_faAppNoteboardRoot>): void => {
    const raw = (store.store ?? {}) as Partial<I_faAppNoteboardRoot> & Record<string, unknown>
    const {
      next,
      shouldRewrite
    } = deps.buildCleanFaAppNoteboardRoot(
      raw,
      deps.normalizePersistedRectForStorage,
      deps.persistedFloatingWindowFramesAreEquivalent
    )
    if (shouldRewrite) {
      store.store = next
    }
  }

  const get = deps.createLazySingleton((): I_faElectronStoreHandle<I_faAppNoteboardRoot> => {
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
