import ElectronStore from 'electron-store'

import { buildSanitizedFaUserSettings } from './functions/faUserSettingsStoreCleanup'
import { createFaUserSettingsStoreApi } from './functions/faUserSettingsStoreApi'
import { createLazySingleton } from 'app/src-electron/shared/createLazySingleton'
import { migrateLegacyFaUserSettingsKeys } from 'app/src-electron/shared/faUserSettingsLegacyKeyMigrate'
import { FA_USER_SETTINGS_DEFAULTS } from './faUserSettingsDefaults'

const faUserSettingsStoreApi = createFaUserSettingsStoreApi({
  ElectronStore,
  buildSanitizedFaUserSettings,
  createLazySingleton,
  defaults: FA_USER_SETTINGS_DEFAULTS,
  migrateLegacyFaUserSettingsKeys,
  storeName: 'faUserSettings'
})

export const cleanupFaUserSettings = faUserSettingsStoreApi.cleanup

export const getFaUserSettings = faUserSettingsStoreApi.get
