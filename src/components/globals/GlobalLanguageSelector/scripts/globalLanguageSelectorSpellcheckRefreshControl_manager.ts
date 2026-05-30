import {
  nextTick,
  onBeforeUnmount,
  ref,
  watch
} from 'vue'

import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createGlobalLanguageSelectorSpellcheckRefreshControl } from './functions/createGlobalLanguageSelectorSpellcheckRefreshControl'

const globalLanguageSelectorSpellcheckRefreshControlApi = createGlobalLanguageSelectorSpellcheckRefreshControl({
  nextTick,
  onBeforeUnmount,
  ref,
  runFaActionAwait,
  watch
})

export const useGlobalLanguageSelectorSpellcheckRefreshControl =
  globalLanguageSelectorSpellcheckRefreshControlApi.useGlobalLanguageSelectorSpellcheckRefreshControl
