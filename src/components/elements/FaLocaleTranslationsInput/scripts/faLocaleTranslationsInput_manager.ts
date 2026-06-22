import { computed, nextTick, ref } from 'vue'

import {
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX,
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX,
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX,
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX
} from 'app/types/I_faLocaleTranslationsInput'

import { isFaLocaleStringTranslationUsingFallback } from 'app/src/scripts/localeTranslations/functions/isFaLocaleStringTranslationUsingFallback'
import {
  buildFaLocaleTranslationsMenuContentStyle,
  resolveFaLocaleTranslationsMenuPresentation
} from 'app/src/scripts/localeTranslations/functions/resolveFaLocaleTranslationsMenuPresentation'
import { resolveFaLocaleTranslationsMenuAnchorElement } from 'app/src/scripts/localeTranslations/functions/resolveFaLocaleTranslationsMenuAnchorElement'
import { scheduleFaLocaleTranslationsMenuInputFocus } from 'app/src/scripts/localeTranslations/functions/scheduleFaLocaleTranslationsMenuInputFocus'
import {
  resolveFaLocaleStringTranslation,
  resolveFaLocaleStringTranslationLanguageCode
} from 'app/src/scripts/localeTranslations/faLocaleStringTranslations_manager'

import { buildFaLocaleTranslationsInputLocaleRows } from './faLocaleTranslationsInputLocaleRowsWiring'
import { createUseFaLocaleTranslationsInput } from './faLocaleTranslationsInputComposableWiring'

export const useFaLocaleTranslationsInput = createUseFaLocaleTranslationsInput({
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX,
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX,
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX,
  FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX,
  buildFaLocaleTranslationsMenuContentStyle,
  buildLocaleRows: buildFaLocaleTranslationsInputLocaleRows,
  computed,
  isFaLocaleStringTranslationUsingFallback,
  nextTick,
  ref,
  resolveFaLocaleStringTranslation,
  resolveFaLocaleStringTranslationLanguageCode,
  resolveFaLocaleTranslationsMenuAnchorElement,
  resolveFaLocaleTranslationsMenuPresentation,
  scheduleFaLocaleTranslationsMenuInputFocus
})
