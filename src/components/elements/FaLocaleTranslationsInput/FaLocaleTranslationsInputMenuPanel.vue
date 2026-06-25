<template>
  <div
    class="faLocaleTranslationsInput__menuBody"
    :class="{
      'faLocaleTranslationsInput__menuBody--pinnedAside': hasPinnedAside,
      'faLocaleTranslationsInput__menuBody--singularPlural': props.isSingularPluralMode
    }"
  >
    <div
      v-if="hasPinnedAside"
      class="faLocaleTranslationsInput__pinnedAside"
      :class="{
        'faLocaleTranslationsInput__pinnedAside--singularPlural': props.isSingularPluralMode
      }"
      :data-test-locator="props.pinnedAsideTestLocator"
    >
      <div
        v-if="props.isSingularPluralMode"
        aria-hidden="true"
        class="faLocaleTranslationsInput__pinnedAsideHeaderSpacer faLocaleTranslationsInput__columnHeaders row no-wrap"
      >
        <span class="faLocaleTranslationsInput__formHeader col">{{ props.singularColumnLabel }}</span>
        <span class="faLocaleTranslationsInput__formHeader col">{{ props.pluralColumnLabel }}</span>
      </div>
      <q-input
        class="faLocaleTranslationsInput__pinnedAsideInput"
        color="primary-bright"
        dark
        dense
        filled
        hide-bottom-space
        :label="props.pinnedAsideLabel"
        outlined
        readonly
        stack-label
        :data-test-locator="`${props.pinnedAsideTestLocator}-input`"
        :model-value="props.pinnedAsideValue"
      >
        <template
          v-if="props.pinnedAsideTooltip !== undefined && props.pinnedAsideTooltip.length > 0"
          #append
        >
          <q-icon
            color="primary-bright"
            :data-test-locator="`${props.pinnedAsideTestLocator}-tooltipIcon`"
            :data-test-tooltip-text="props.pinnedAsideTooltip"
            name="mdi-help-circle-outline"
            size="18px"
          >
            <q-tooltip>
              {{ props.pinnedAsideTooltip }}
            </q-tooltip>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div
      v-if="props.isSingularPluralMode"
      class="faLocaleTranslationsInput__singularPluralPanel"
    >
      <div class="faLocaleTranslationsInput__columnHeaders row no-wrap">
        <span
          class="faLocaleTranslationsInput__formHeader col"
          :data-test-locator="`${props.testLocator}-singularColumnHeader`"
        >
          {{ props.singularColumnLabel }}
        </span>
        <span
          class="faLocaleTranslationsInput__formHeader col"
          :data-test-locator="`${props.testLocator}-pluralColumnHeader`"
        >
          {{ props.pluralColumnLabel }}
        </span>
      </div>
      <div class="faLocaleTranslationsInput__scroll faLocaleTranslationsInput__scroll--singularPluralRows hasScrollbar">
        <div class="faLocaleTranslationsInput__rows">
          <div
            v-for="(localeRow, localeRowIndex) in props.localeRows"
            :key="localeRow.code"
            class="faLocaleTranslationsInput__row faLocaleTranslationsInput__row--singularPlural"
            :data-test-locale-code="localeRow.code"
            :data-test-locator="`${props.testLocator}-translationsRow`"
          >
            <q-input
              v-bind="{ ...qInputSizeAttrs, ...localeRowInputRefBinding(localeRowIndex) }"
              :autogrow="props.isMultilineInput && props.autogrow"
              class="faLocaleTranslationsInput__menuInput col"
              color="primary-bright"
              dark
              dense
              filled
              hide-bottom-space
              :label="localeRow.displayName"
              outlined
              stack-label
              :data-test-locale-code="localeRow.code"
              :data-test-locale-label="localeRow.displayName"
              :data-test-locator="`${props.testLocator}-translationsSingularInput-${localeRow.code}`"
              :model-value="props.readSingularLocaleValue!(localeRow.code)"
              :type="props.isMultilineInput ? 'textarea' : 'text'"
              @update:model-value="(value) => props.updateSingularLocaleValue!(localeRow.code, value)"
            />
            <q-input
              v-bind="qInputSizeAttrs"
              :autogrow="props.isMultilineInput && props.autogrow"
              class="faLocaleTranslationsInput__menuInput col"
              color="primary-bright"
              dark
              dense
              filled
              hide-bottom-space
              :label="localeRow.displayName"
              outlined
              stack-label
              :data-test-locale-code="localeRow.code"
              :data-test-locale-label="localeRow.displayName"
              :data-test-locator="`${props.testLocator}-translationsPluralInput-${localeRow.code}`"
              :model-value="props.readPluralLocaleValue!(localeRow.code)"
              :type="props.isMultilineInput ? 'textarea' : 'text'"
              @update:model-value="(value) => props.updatePluralLocaleValue!(localeRow.code, value)"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="faLocaleTranslationsInput__scroll hasScrollbar"
    >
      <div class="faLocaleTranslationsInput__rows">
        <div
          v-for="(localeRow, localeRowIndex) in props.localeRows"
          :key="localeRow.code"
          class="faLocaleTranslationsInput__row"
          :data-test-locale-code="localeRow.code"
          :data-test-locator="`${props.testLocator}-translationsRow`"
        >
          <q-input
            v-bind="{ ...qInputSizeAttrs, ...localeRowInputRefBinding(localeRowIndex) }"
            :autogrow="props.isMultilineInput && props.autogrow"
            class="faLocaleTranslationsInput__menuInput"
            color="primary-bright"
            dark
            dense
            filled
            hide-bottom-space
            :label="localeRow.displayName"
            outlined
            stack-label
            :data-test-locale-code="localeRow.code"
            :data-test-locale-label="localeRow.displayName"
            :data-test-locator="`${props.testLocator}-translationsInput-${localeRow.code}`"
            :model-value="props.readLocaleValue(localeRow.code)"
            :type="props.isMultilineInput ? 'textarea' : 'text'"
            @update:model-value="(value) => props.updateLocaleValue(localeRow.code, value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type ComponentPublicInstance } from 'vue'

import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

defineOptions({
  name: 'FaLocaleTranslationsInputMenuPanel'
})

const props = defineProps<{
  autogrow: boolean
  isMultilineInput: boolean
  isSingularPluralMode?: boolean | undefined
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  maxLength?: number | undefined
  pinnedAsideLabel?: string | undefined
  pinnedAsideTestLocator?: string | undefined
  pinnedAsideTooltip?: string | undefined
  pinnedAsideValue?: string | undefined
  pluralColumnLabel?: string | undefined
  readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  readPluralLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  readSingularLocaleValue?: (languageCode: T_faUserSettingsLanguageCode) => string
  rows: number
  setPreferredLanguageInputRef: (
    component: Element | ComponentPublicInstance | null
  ) => void
  singularColumnLabel?: string | undefined
  testLocator: string
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

const hasPinnedAside = computed(() => {
  return props.pinnedAsideLabel !== undefined && props.pinnedAsideValue !== undefined
})

const qInputSizeAttrs = computed(() => {
  const attrs: { maxlength?: number; rows?: number } = {}

  if (props.maxLength !== undefined) {
    attrs.maxlength = props.maxLength
  }

  if (props.isMultilineInput) {
    attrs.rows = props.rows
  }

  return attrs
})

function localeRowInputRefBinding (localeRowIndex: number): {
  ref?: (component: Element | ComponentPublicInstance | null) => void
} {
  if (localeRowIndex !== 0) {
    return {}
  }

  return {
    ref: props.setPreferredLanguageInputRef
  }
}
</script>
