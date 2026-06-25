<template>
  <div
    class="faLocaleTranslationsInput__root"
    :class="{
      'faLocaleTranslationsInput__root--menuPanel': isMenuPanelPresentation,
      'faLocaleTranslationsInput__root--singularPlural': isSingularPluralForms
    }"
  >
    <div
      v-if="isMenuPanelPresentation && props.error && props.errorMessage !== undefined && props.errorMessage.length > 0"
      class="faLocaleTranslationsInput__menuPanelError text-negative text-caption q-mb-sm"
      :data-test-locator="`${props.testLocator}-menuPanelError`"
    >
      {{ props.errorMessage }}
    </div>
    <FaLocaleTranslationsInputMenuPanel
      v-if="isMenuPanelPresentation"
      v-bind="menuPanelBindings"
    />
    <FaLocaleTranslationsInputSummaryField
      v-else
      ref="summaryFieldRef"
      v-bind="summaryFieldBindings"
      v-model:translations-menu-open="translationsMenuOpen"
    />
  </div>
</template>

<script setup lang="ts">
import {
  type T_faLocaleTranslationsInputMode,
  type T_faLocaleTranslationsInputPresentation,
  type T_faLocaleTranslationsInputTranslationForms
} from 'app/types/I_faLocaleTranslationsInput'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import FaLocaleTranslationsInputMenuPanel from './FaLocaleTranslationsInputMenuPanel.vue'
import FaLocaleTranslationsInputSummaryField from './FaLocaleTranslationsInputSummaryField.vue'
import { useFaLocaleTranslationsInputRoot } from './scripts/faLocaleTranslationsInputRoot_manager'

defineOptions({
  name: 'FaLocaleTranslationsInput',
  inheritAttrs: false
})

const props = withDefaults(
  /* eslint-disable vue/require-default-prop -- exactOptionalPropertyTypes: omit undefined from withDefaults */
  defineProps<{
    autogrow?: boolean | undefined
    color?: string | undefined
    currentLanguageCode: T_faUserSettingsLanguageCode
    dark?: boolean | undefined
    dense?: boolean | undefined
    error?: boolean | undefined
    errorMessage?: string | undefined
    hideBottomSpace?: boolean | undefined
    inputMode?: T_faLocaleTranslationsInputMode | undefined
    maxLength?: number | undefined
    menuPinnedAsideLabel?: string | undefined
    menuPinnedAsideTestLocator?: string | undefined
    menuPinnedAsideTooltip?: string | undefined
    menuPinnedAsideValue?: string | undefined
    modelValue: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
    presentation?: T_faLocaleTranslationsInputPresentation | undefined
    rows?: number | undefined
    testLocator: string
    translationForms?: T_faLocaleTranslationsInputTranslationForms | undefined
  }>(),
  {
    autogrow: false,
    color: 'primary-bright',
    dark: true,
    dense: true,
    error: false,
    hideBottomSpace: true,
    inputMode: 'singleLine',
    presentation: 'field',
    translationForms: 'single'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations]
}>()

const {
  focusPreferredLanguageInput,
  isMenuPanelPresentation,
  isSingularPluralForms,
  menuPanelBindings,
  openTranslationsMenu,
  summaryFieldBindings,
  translationsMenuOpen
} = useFaLocaleTranslationsInputRoot(props, emit)

defineExpose({
  focusPreferredLanguageInput,
  openTranslationsMenu
})
</script>

<style lang="scss" src="./styles/FaLocaleTranslationsInput.menu.unscoped.scss"></style>

<style lang="scss" scoped src="./styles/FaLocaleTranslationsInput.scoped.scss"></style>
