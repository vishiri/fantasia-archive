/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaLocaleTranslationsInputSummaryField from '../FaLocaleTranslationsInputSummaryField.vue'
import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'

const localeRows: I_faLocaleTranslationsInputLocaleRow[] = [
  {
    code: 'en-US',
    displayName: 'English'
  }
]

const faLocaleTranslationsInputMenuPanelStub = defineComponent({
  name: 'FaLocaleTranslationsInputMenuPanel',
  props: {
    testLocator: {
      type: String,
      required: true
    }
  },
  template: '<div class="fa-locale-translations-input-menu-panel-stub" :data-test-locator="testLocator + \'-menuPanelStub\'" />'
})

const qMenuStub = defineComponent({
  name: 'QMenu',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  template: '<div v-if="modelValue" class="q-menu-stub" v-bind="$attrs"><slot /></div>'
})

const qBtnStub = defineComponent({
  inheritAttrs: true,
  emits: ['click'],
  template: '<button type="button" class="q-btn-stub" v-bind="$attrs" @click="$emit(\'click\', $event)" />'
})

const qInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['click'],
  template: `
    <div class="q-input-stub" v-bind="$attrs" @click="$emit('click', $event)">
      <slot name="append" />
      <slot name="after" />
    </div>
  `
})

test('Test that FaLocaleTranslationsInputSummaryField renders readonly field and translate button', () => {
  const wrapper = mount(FaLocaleTranslationsInputSummaryField, {
    props: {
      autogrow: false,
      color: 'primary-bright',
      dark: true,
      dense: true,
      error: false,
      fallbackWarningTooltip: 'Fallback used',
      hideBottomSpace: true,
      isMenuPresentationLocked: false,
      isMultilineInput: false,
      localeRows,
      lockedMenuContentStyle: undefined,
      menuOffset: [0, 4],
      menuTarget: undefined,
      onTranslationsMenuBeforeShow: () => {},
      onTranslationsMenuHide: () => {},
      onTranslationsMenuShow: () => {},
      openTranslationsMenu: () => {},
      readLocaleValue: () => 'Character',
      resolvedLanguageCode: 'en-US',
      resolvedTextareaRows: 1,
      resolvedValue: 'Character',
      setPreferredLanguageInputRef: () => {},
      showFallbackWarning: false,
      testLocator: 'faLocaleTranslationsInput-summaryField',
      translateButtonTooltip: 'Edit translations',
      translationsMenuOpen: false,
      updateLocaleValue: () => {}
    },
    global: {
      stubs: {
        FaLocaleTranslationsInputMenuPanel: faLocaleTranslationsInputMenuPanelStub,
        FaMultilineTooltipBody: true,
        QBtn: qBtnStub,
        QInput: qInputStub,
        QMenu: qMenuStub,
        QTooltip: true
      }
    }
  })

  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField-translationsButton"]').exists()).toBe(true)
})
