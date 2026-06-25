<template>
  <q-input
    v-bind="$attrs"
    :model-value="props.resolvedValue"
    class="faLocaleTranslationsInput__field faLocaleTranslationsInput__field--openTranslations"
    :color="props.color"
    :dark="props.dark"
    :dense="props.dense"
    :data-test-locator="props.testLocator"
    filled
    :error="props.error"
    :error-message="props.errorMessage"
    :hide-bottom-space="props.hideBottomSpace"
    outlined
    readonly
    :type="props.isMultilineInput ? 'textarea' : 'text'"
    @click="props.openTranslationsMenu"
  >
    <template #append>
      <q-btn
        ref="translationsButtonRef"
        color="primary-bright"
        dense
        flat
        icon="mdi-translate"
        round
        size="sm"
        :aria-label="props.translateButtonTooltip"
        :data-test-locator="`${props.testLocator}-translationsButton`"
        :data-test-tooltip-text="props.translateButtonTooltip"
        @click.stop="props.openTranslationsMenu"
      >
        <q-tooltip>
          {{ props.translateButtonTooltip }}
        </q-tooltip>
      </q-btn>
    </template>
    <template #after>
      <q-icon
        v-if="props.showFallbackWarning"
        class="faLocaleTranslationsInput__fallbackWarning"
        color="warning"
        :data-test-fallback-language-code="props.resolvedLanguageCode ?? undefined"
        :data-test-locator="`${props.testLocator}-fallbackWarning`"
        :data-test-tooltip-text="props.fallbackWarningTooltip"
        name="mdi-alert"
        size="20px"
        @click.stop
      >
        <q-tooltip content-class="dialogProjectSettings__fieldHelpTooltip">
          <FaMultilineTooltipBody :text="props.fallbackWarningTooltip" />
        </q-tooltip>
      </q-icon>
    </template>
  </q-input>
  <q-menu
    v-model="translationsMenuOpenModel"
    anchor="bottom left"
    class="faLocaleTranslationsInput__menu"
    :class="{
      'faLocaleTranslationsInput__menu--locked': props.isMenuPresentationLocked,
      'faLocaleTranslationsInput__menu--singularPlural': props.isSingularPluralMode
    }"
    :content-style="props.lockedMenuContentStyle"
    dark
    :data-test-locator="`${props.testLocator}-translationsMenu`"
    :offset="props.menuOffset"
    no-parent-event
    no-refocus
    self="top left"
    square
    :style="props.lockedMenuContentStyle"
    :target="props.menuTarget"
    @before-show="props.onTranslationsMenuBeforeShow"
    @hide="props.onTranslationsMenuHide"
    @show="props.onTranslationsMenuShow"
  >
    <FaLocaleTranslationsInputMenuPanel
      :autogrow="props.autogrow"
      :is-multiline-input="props.isMultilineInput"
      :is-singular-plural-mode="props.isSingularPluralMode"
      :locale-rows="props.localeRows"
      :max-length="props.maxLength"
      :pinned-aside-label="props.menuPinnedAsideLabel"
      :pinned-aside-test-locator="props.menuPinnedAsideTestLocator"
      :pinned-aside-tooltip="props.menuPinnedAsideTooltip"
      :pinned-aside-value="props.menuPinnedAsideValue"
      :plural-column-label="props.pluralColumnLabel"
      :read-locale-value="props.readLocaleValue"
      :read-plural-locale-value="props.readPluralLocaleValue"
      :read-singular-locale-value="props.readSingularLocaleValue"
      :rows="props.resolvedTextareaRows"
      :set-preferred-language-input-ref="props.setPreferredLanguageInputRef"
      :singular-column-label="props.singularColumnLabel"
      :test-locator="props.testLocator"
      :update-locale-value="props.updateLocaleValue"
      :update-plural-locale-value="props.updatePluralLocaleValue"
      :update-singular-locale-value="props.updateSingularLocaleValue"
    />
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { QBtn } from 'quasar'

import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import FaLocaleTranslationsInputMenuPanel from './FaLocaleTranslationsInputMenuPanel.vue'
import FaMultilineTooltipBody from 'app/src/components/elements/FaMultilineTooltipBody/FaMultilineTooltipBody.vue'
import { resolveFaLocaleTranslationsSummaryButtonElement } from './scripts/functions/resolveFaLocaleTranslationsSummaryButtonElement'

defineOptions({
  name: 'FaLocaleTranslationsInputSummaryField',
  inheritAttrs: false
})

const props = defineProps<{
  autogrow: boolean
  color: string
  dark: boolean
  dense: boolean
  error: boolean
  errorMessage?: string
  fallbackWarningTooltip: string
  hideBottomSpace: boolean
  isMenuPresentationLocked: boolean
  isMultilineInput: boolean
  isSingularPluralMode?: boolean
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  lockedMenuContentStyle: Record<string, string> | undefined
  maxLength?: number
  menuOffset: [number, number]
  menuPinnedAsideLabel?: string
  menuPinnedAsideTestLocator?: string
  menuPinnedAsideTooltip?: string
  menuPinnedAsideValue?: string
  menuTarget: HTMLElement | undefined
  onTranslationsMenuBeforeShow: () => void
  onTranslationsMenuHide: () => void
  onTranslationsMenuShow: () => void
  openTranslationsMenu: () => void
  pluralColumnLabel?: string
  readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  readPluralLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  readSingularLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  resolvedLanguageCode: T_faUserSettingsLanguageCode | null
  resolvedTextareaRows: number
  resolvedValue: string
  setPreferredLanguageInputRef: (
    component: import('vue').ComponentPublicInstance | Element | null
  ) => void
  showFallbackWarning: boolean
  singularColumnLabel?: string
  testLocator: string
  translateButtonTooltip: string
  translationsMenuOpen: boolean
  updateLocaleValue: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
  updatePluralLocaleValue?: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
  updateSingularLocaleValue?: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
}>()

const emit = defineEmits<{
  'update:translationsMenuOpen': [open: boolean]
}>()

const translationsButtonRef = ref<QBtn | null>(null)

const translationsMenuOpenModel = computed({
  get: () => props.translationsMenuOpen,
  set: (open: boolean) => {
    emit('update:translationsMenuOpen', open)
  }
})

defineExpose({
  readTranslationsButtonElement: (): HTMLElement | null => {
    return resolveFaLocaleTranslationsSummaryButtonElement(translationsButtonRef.value)
  }
})
</script>

<style lang="scss" scoped src="./styles/FaLocaleTranslationsInput.scoped.scss"></style>
