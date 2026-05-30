import ElectronStore from 'electron-store'
import { FA_KEYBIND_COMMAND_IDS } from 'app/types/I_faKeybindsDomain'

import { createIsFaKeybindCommandId } from './functions/faKeybindCommandIdGuard'
import { buildCleanFaKeybindsRoot } from './functions/faKeybindsStoreCleanup'
import { createFaKeybindsStoreApi } from './functions/faKeybindsStoreApi'
import { createLazySingleton } from './functions/lazySingleton'
import { FA_KEYBINDS_STORE_DEFAULTS } from './keybinds_managerDefaults'

const isFaKeybindCommandId = createIsFaKeybindCommandId(FA_KEYBIND_COMMAND_IDS)

const faKeybindsStoreApi = createFaKeybindsStoreApi({
  ElectronStore,
  buildCleanFaKeybindsRoot,
  commandIds: FA_KEYBIND_COMMAND_IDS,
  createLazySingleton,
  defaults: FA_KEYBINDS_STORE_DEFAULTS,
  isFaKeybindCommandId,
  storeName: 'faKeybinds'
})

export const cleanupFaKeybinds = faKeybindsStoreApi.cleanup

export const getFaKeybinds = faKeybindsStoreApi.get
