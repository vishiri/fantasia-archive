import { computed, nextTick, onMounted, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { createFaLocaleTranslationsInputPresentationWiring } from './faLocaleTranslationsInputPresentationWiring'
import { useFaLocaleTranslationsInput } from './faLocaleTranslationsInput_manager'
import { useFaLocaleTranslationsInputSingularPlural } from './faLocaleTranslationsInputSingularPlural_manager'
import { createUseFaLocaleTranslationsInputRoot } from './faLocaleTranslationsInputRootUseWiring'
import {
  createFaLocaleTranslationsInputFallbackWarningTooltip,
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
  createFaLocaleTranslationsInputViewWiring
} from './faLocaleTranslationsInputViewWiring'

export const useFaLocaleTranslationsInputRoot = createUseFaLocaleTranslationsInputRoot({
  computed,
  createFaLocaleTranslationsInputFallbackWarningTooltip,
  createFaLocaleTranslationsInputPresentationWiring,
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
  createFaLocaleTranslationsInputViewWiring,
  nextTick,
  onMounted,
  ref,
  toRef,
  useFaLocaleTranslationsInput,
  useFaLocaleTranslationsInputSingularPlural,
  useI18n
})
