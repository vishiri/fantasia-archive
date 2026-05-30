import ElectronStore from 'electron-store'
import {
  normalizePersistedRectForStorage,
  persistedFloatingWindowFramesAreEquivalent
} from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry_manager'

import { buildCleanFaAppStylingRoot } from './functions/faAppStylingStoreCleanup'
import { createFaAppStylingStoreApi } from './functions/faAppStylingStoreApi'
import { createLazySingleton } from './functions/lazySingleton'
import { FA_APP_STYLING_STORE_DEFAULTS } from './appStyling_managerDefaults'

const faAppStylingStoreApi = createFaAppStylingStoreApi({
  ElectronStore,
  buildCleanFaAppStylingRoot,
  createLazySingleton,
  defaults: FA_APP_STYLING_STORE_DEFAULTS,
  normalizePersistedRectForStorage,
  persistedFloatingWindowFramesAreEquivalent,
  storeName: 'faAppStyling'
})

export const cleanupFaAppStyling = faAppStylingStoreApi.cleanup

export const getFaAppStyling = faAppStylingStoreApi.get
