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
    :style="props.lockedMenuContentStyle"
    :target="props.menuTarget"
    @before-show="props.onTranslationsMenuBeforeShow"
    @hide="props.onTranslationsMenuHide"
    @show="props.onTranslationsMenuShow"
  >
    <FaLocaleTranslationsInputMenuPanel
      v-bind="menuPanelChildBindings"
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
  errorMessage?: string | undefined
  fallbackWarningTooltip: string
  hideBottomSpace: boolean
  isMenuPresentationLocked: boolean
  isMultilineInput: boolean
  isSingularPluralMode?: boolean | undefined
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  lockedMenuContentStyle: Record<string, string> | undefined
  maxLength?: number | undefined
  menuOffset: [number, number]
  menuPinnedAsideLabel?: string | undefined
  menuPinnedAsideTestLocator?: string | undefined
  menuPinnedAsideTooltip?: string | undefined
  menuPinnedAsideValue?: string | undefined
  menuTarget: HTMLElement | undefined
  onTranslationsMenuBeforeShow: () => void
  onTranslationsMenuHide: () => void
  onTranslationsMenuShow: () => void
  openTranslationsMenu: () => void
  pluralColumnLabel?: string | undefined
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
  singularColumnLabel?: string | undefined
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

const menuPanelChildBindings = computed(() => {
  const bindings = {
    autogrow: props.autogrow,
    isMultilineInput: props.isMultilineInput,
    localeRows: props.localeRows,
    readLocaleValue: props.readLocaleValue,
    rows: props.resolvedTextareaRows,
    setPreferredLanguageInputRef: props.setPreferredLanguageInputRef,
    testLocator: props.testLocator,
    updateLocaleValue: props.updateLocaleValue,
    ...(props.isSingularPluralMode !== undefined ? { isSingularPluralMode: props.isSingularPluralMode } : {}),
    ...(props.maxLength !== undefined ? { maxLength: props.maxLength } : {}),
    ...(props.menuPinnedAsideLabel !== undefined ? { pinnedAsideLabel: props.menuPinnedAsideLabel } : {}),
    ...(props.menuPinnedAsideTestLocator !== undefined
      ? { pinnedAsideTestLocator: props.menuPinnedAsideTestLocator }
      : {}),
    ...(props.menuPinnedAsideTooltip !== undefined ? { pinnedAsideTooltip: props.menuPinnedAsideTooltip } : {}),
    ...(props.menuPinnedAsideValue !== undefined ? { pinnedAsideValue: props.menuPinnedAsideValue } : {}),
    ...(props.pluralColumnLabel !== undefined ? { pluralColumnLabel: props.pluralColumnLabel } : {}),
    ...(props.readPluralLocaleValue !== undefined ? { readPluralLocaleValue: props.readPluralLocaleValue } : {}),
    ...(props.readSingularLocaleValue !== undefined ? { readSingularLocaleValue: props.readSingularLocaleValue } : {}),
    ...(props.singularColumnLabel !== undefined ? { singularColumnLabel: props.singularColumnLabel } : {}),
    ...(props.updatePluralLocaleValue !== undefined ? { updatePluralLocaleValue: props.updatePluralLocaleValue } : {}),
    ...(props.updateSingularLocaleValue !== undefined
      ? { updateSingularLocaleValue: props.updateSingularLocaleValue }
      : {})
  }

  return bindings
})

defineExpose({
  readTranslationsButtonElement: (): HTMLElement | null => {
    return resolveFaLocaleTranslationsSummaryButtonElement(translationsButtonRef.value)
  }
})
</script>

<style lang="scss" scoped src="./styles/FaLocaleTranslationsInput.scoped.scss"></style>
