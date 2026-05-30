import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsStoreApiDeps } from 'app/types/I_faElectronMainStoreApiDeps'
import type { I_faElectronStoreHandle } from 'app/types/I_faElectronStoreHandle'

/**
 * Removes unexpected top-level keys and normalizes 'overrides' to only known command ids.
 */
export function createFaKeybindsStoreApi (deps: I_faKeybindsStoreApiDeps): {
  cleanup: (store: I_faElectronStoreHandle<I_faKeybindsRoot>) => void
  get: () => I_faElectronStoreHandle<I_faKeybindsRoot>
} {
  const cleanup = (store: I_faElectronStoreHandle<I_faKeybindsRoot>): void => {
    const raw = (store.store ?? {}) as Partial<I_faKeybindsRoot> & Record<string, unknown>
    const {
      next,
      shouldRewrite
    } = deps.buildCleanFaKeybindsRoot(raw, deps.commandIds, deps.isFaKeybindCommandId)
    if (shouldRewrite) {
      store.store = next
    }
  }

  const get = deps.createLazySingleton((): I_faElectronStoreHandle<I_faKeybindsRoot> => {
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
