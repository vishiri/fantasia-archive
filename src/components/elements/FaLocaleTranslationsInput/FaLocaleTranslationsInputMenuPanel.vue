<template>
  <div class="faLocaleTranslationsInput__menuBody">
    <div class="faLocaleTranslationsInput__scroll hasScrollbar">
      <div class="faLocaleTranslationsInput__rows">
        <div
          v-for="(localeRow, localeRowIndex) in props.localeRows"
          :key="localeRow.code"
          class="faLocaleTranslationsInput__row"
          :data-test-locale-code="localeRow.code"
          :data-test-locator="`${props.testLocator}-translationsRow`"
        >
          <q-input
            :ref="localeRowIndex === 0 ? props.setPreferredLanguageInputRef : undefined"
            :autogrow="props.isMultilineInput && props.autogrow"
            class="faLocaleTranslationsInput__menuInput"
            color="primary-bright"
            dark
            dense
            filled
            hide-bottom-space
            :label="localeRow.displayName"
            :maxlength="props.maxLength"
            outlined
            :rows="props.isMultilineInput ? props.rows : undefined"
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
import type { ComponentPublicInstance } from 'vue'

import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

defineOptions({
  name: 'FaLocaleTranslationsInputMenuPanel'
})

const props = defineProps<{
  autogrow: boolean
  isMultilineInput: boolean
  localeRows: I_faLocaleTranslationsInputLocaleRow[]
  maxLength?: number
  readLocaleValue: (languageCode: T_faUserSettingsLanguageCode) => string
  rows: number
  setPreferredLanguageInputRef: (
    component: Element | ComponentPublicInstance | null
  ) => void
  testLocator: string
  updateLocaleValue: (
    languageCode: T_faUserSettingsLanguageCode,
    value: string | number | null
  ) => void
}>()
</script>
