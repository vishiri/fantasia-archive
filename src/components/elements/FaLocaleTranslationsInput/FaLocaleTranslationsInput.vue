<template>
  <div class="faLocaleTranslationsInput__root">
    <q-input
      v-bind="$attrs"
      :model-value="resolvedValue"
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
      :type="isMultilineInput ? 'textarea' : 'text'"
      @click="openTranslationsMenu"
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
          :aria-label="$t('faLocaleTranslationsInput.translateButtonTooltip')"
          :data-test-locator="`${props.testLocator}-translationsButton`"
          :data-test-tooltip-text="$t('faLocaleTranslationsInput.translateButtonTooltip')"
          @click.stop="openTranslationsMenu"
        >
          <q-tooltip>
            {{ $t('faLocaleTranslationsInput.translateButtonTooltip') }}
          </q-tooltip>
        </q-btn>
      </template>
      <template #after>
        <q-icon
          v-if="showFallbackWarning"
          class="faLocaleTranslationsInput__fallbackWarning"
          color="warning"
          :data-test-fallback-language-code="resolvedLanguageCode ?? undefined"
          :data-test-locator="`${props.testLocator}-fallbackWarning`"
          :data-test-tooltip-text="fallbackWarningTooltip"
          name="mdi-alert"
          size="20px"
          @click.stop
        >
          <q-tooltip>
            {{ fallbackWarningTooltip }}
          </q-tooltip>
        </q-icon>
      </template>
    </q-input>
    <q-menu
      v-model="translationsMenuOpen"
      anchor="bottom left"
      class="faLocaleTranslationsInput__menu"
      :class="{
        'faLocaleTranslationsInput__menu--locked': isMenuPresentationLocked
      }"
      :content-style="lockedMenuContentStyle"
      dark
      :data-test-locator="`${props.testLocator}-translationsMenu`"
      :offset="menuOffset"
      no-parent-event
      no-refocus
      self="top left"
      square
      :style="lockedMenuContentStyle"
      :target="menuTarget"
      @before-show="onTranslationsMenuBeforeShow"
      @hide="onTranslationsMenuHide"
      @show="onTranslationsMenuShow"
    >
      <FaLocaleTranslationsInputMenuPanel
        :autogrow="props.autogrow"
        :is-multiline-input="isMultilineInput"
        :locale-rows="localeRows"
        :max-length="props.maxLength"
        :read-locale-value="readLocaleValue"
        :rows="resolvedTextareaRows"
        :set-preferred-language-input-ref="setPreferredLanguageInputRef"
        :test-locator="props.testLocator"
        :update-locale-value="updateLocaleValue"
      />
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRef, type ComponentPublicInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import type { QBtn, QInput } from 'quasar'

import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import { faUserSettingsLanguageCodeToNamesKey } from 'app/types/faUserSettingsLanguageRegistry'
import {
  FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS,
  type T_faLocaleTranslationsInputMode
} from 'app/types/I_faLocaleTranslationsInput'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import FaLocaleTranslationsInputMenuPanel from './FaLocaleTranslationsInputMenuPanel.vue'
import { useFaLocaleTranslationsInput } from './scripts/faLocaleTranslationsInput_manager'

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
    modelValue: I_faLocaleStringTranslations
    rows?: number
    testLocator: string
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
    rows: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: I_faLocaleStringTranslations]
}>()

const { t } = useI18n()

const translationsButtonRef = ref<QBtn | null>(null)
const preferredLanguageInputRef = ref<QInput | null>(null)

const modelValueRef = toRef(props, 'modelValue')
const currentLanguageCodeRef = toRef(props, 'currentLanguageCode')
const inputModeRef = toRef(props, 'inputMode')
const maxLengthRef = toRef(props, 'maxLength')

function emitModelValue (value: I_faLocaleStringTranslations): void {
  emit('update:modelValue', value)
}

function readTriggerElement (): HTMLElement | null {
  const buttonComponent = translationsButtonRef.value
  if (buttonComponent === null) {
    return null
  }
  const buttonElement = buttonComponent.$el
  if (buttonElement instanceof HTMLElement) {
    return buttonElement
  }
  return null
}

function readPreferredLanguageInputFocus (): (() => void) | null {
  if (typeof preferredLanguageInputRef.value?.focus === 'function') {
    return () => {
      preferredLanguageInputRef.value?.focus()
    }
  }
  return null
}

const {
  isMenuPresentationLocked,
  isMultilineInput,
  localeRows,
  lockedMenuContentStyle,
  menuOffset,
  menuTarget,
  onTranslationsMenuBeforeShow,
  onTranslationsMenuHide,
  onTranslationsMenuShow,
  openTranslationsMenu,
  readLocaleValue,
  resolvedLanguageCode,
  resolvedValue,
  showFallbackWarning,
  syncMenuAnchorTarget,
  translationsMenuOpen,
  updateLocaleValue
} = useFaLocaleTranslationsInput({
  currentLanguageCode: currentLanguageCodeRef,
  emitModelValue,
  inputMode: inputModeRef,
  maxLength: maxLengthRef,
  modelValue: modelValueRef,
  readPreferredLanguageInputFocus,
  readTriggerElement,
  requestAnimationFrame: (callback) => window.requestAnimationFrame(callback)
})

const resolvedTextareaRows = computed(() => {
  return props.rows ?? FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS
})

const fallbackWarningTooltip = computed(() => {
  const fallbackLanguageCode = resolvedLanguageCode.value
  if (fallbackLanguageCode === null) {
    return ''
  }
  const fallbackLanguageName =
    FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[faUserSettingsLanguageCodeToNamesKey(fallbackLanguageCode)]
  return t('faLocaleTranslationsInput.fallbackWarningTooltip', {
    fallbackLanguageName
  })
})

function setPreferredLanguageInputRef (
  component: Element | ComponentPublicInstance | null
): void {
  preferredLanguageInputRef.value = component as QInput | null
}

onMounted(() => {
  void nextTick(() => {
    syncMenuAnchorTarget()
  })
})

defineExpose({
  openTranslationsMenu
})
</script>

<style lang="scss" src="./styles/FaLocaleTranslationsInput.menu.unscoped.scss"></style>

<style lang="scss" scoped>
@use './styles/variables' as *;

.faLocaleTranslationsInput__root {
  display: block;
  width: 100%;
}

.faLocaleTranslationsInput__field {
  width: 100%;
}

.faLocaleTranslationsInput__field--openTranslations {
  cursor: pointer;

  :deep(.q-field__control),
  :deep(.q-field__native),
  :deep(input),
  :deep(textarea) {
    cursor: pointer;
  }
}

.faLocaleTranslationsInput__fallbackWarning {
  flex: 0 0 auto;
  margin-left: $faLocaleTranslationsInput-fallbackWarning-marginLeft;
}
</style>
