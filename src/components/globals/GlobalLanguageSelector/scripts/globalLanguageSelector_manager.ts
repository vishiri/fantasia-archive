import { computed, ref, watch } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import { resolveVitePublicAssetPath } from 'app/src/scripts/appInternals/appInternals_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createGlobalLanguageSelector } from './functions/createGlobalLanguageSelector'
import { createGlobalLanguageSelectorSpellcheckRefresh } from './functions/createGlobalLanguageSelectorSpellcheckRefresh'
import { resolveGlobalLanguageSelectorAppliedPair } from './functions/globalLanguageSelectorLanguageCodeWatchGate'
import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from './globalLanguageSelectorLocales_manager'

const useGlobalLanguageSelectorSpellcheckRefreshBinding = createGlobalLanguageSelectorSpellcheckRefresh({
  ref,
  runFaActionAwait
})

const globalLanguageSelectorApi = createGlobalLanguageSelector({
  GLOBAL_LANGUAGE_SELECTOR_LOCALES,
  computed,
  getFaUserSettingsStore: () => S_FaUserSettings(),
  i18n,
  ref,
  resolveGlobalLanguageSelectorAppliedPair,
  resolveVitePublicAssetPath,
  runFaActionAwait,
  useGlobalLanguageSelectorSpellcheckRefresh: useGlobalLanguageSelectorSpellcheckRefreshBinding,
  watch
})

export const useGlobalLanguageSelectorSpellcheckRefresh = useGlobalLanguageSelectorSpellcheckRefreshBinding

export const useGlobalLanguageSelector = globalLanguageSelectorApi.useGlobalLanguageSelector

export const GLOBAL_LANGUAGE_SELECTOR_INNER_SIZE_PX =
  globalLanguageSelectorApi.GLOBAL_LANGUAGE_SELECTOR_INNER_SIZE_PX
