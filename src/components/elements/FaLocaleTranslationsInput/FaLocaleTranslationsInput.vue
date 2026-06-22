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
  defineProps<{
    autogrow?: boolean
    color?: string
    currentLanguageCode: T_faUserSettingsLanguageCode
    dark?: boolean
    dense?: boolean
    error?: boolean
    errorMessage?: string
    hideBottomSpace?: boolean
    inputMode?: T_faLocaleTranslationsInputMode
    maxLength?: number
    menuPinnedAsideLabel?: string
    menuPinnedAsideTestLocator?: string
    menuPinnedAsideTooltip?: string
    menuPinnedAsideValue?: string
    modelValue: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
    presentation?: T_faLocaleTranslationsInputPresentation
    rows?: number
    testLocator: string
    translationForms?: T_faLocaleTranslationsInputTranslationForms
  }>(),
  {
    autogrow: false,
    color: 'primary-bright',
    dark: true,
    dense: true,
    error: false,
    errorMessage: undefined,
    hideBottomSpace: true,
    inputMode: 'singleLine',
    maxLength: undefined,
    menuPinnedAsideLabel: undefined,
    menuPinnedAsideTestLocator: undefined,
    menuPinnedAsideTooltip: undefined,
    menuPinnedAsideValue: undefined,
    presentation: 'field',
    rows: undefined,
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
