import ElectronStore from 'electron-store'
import {
  normalizePersistedRectForStorage,
  persistedFloatingWindowFramesAreEquivalent
} from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry_manager'

import { buildCleanFaAppNoteboardRoot } from './functions/faAppNoteboardStoreCleanup'
import { createFaAppNoteboardStoreApi } from './functions/faAppNoteboardStoreApi'
import { createLazySingleton } from './functions/lazySingleton'
import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from './appNoteboard_managerDefaults'

const faAppNoteboardStoreApi = createFaAppNoteboardStoreApi({
  ElectronStore,
  buildCleanFaAppNoteboardRoot,
  createLazySingleton,
  defaults: FA_APP_NOTEBOARD_STORE_DEFAULTS,
  normalizePersistedRectForStorage,
  persistedFloatingWindowFramesAreEquivalent,
  storeName: 'faAppNoteboard'
})

export const cleanupFaAppNoteboard = faAppNoteboardStoreApi.cleanup

export const getFaAppNoteboard = faAppNoteboardStoreApi.get
