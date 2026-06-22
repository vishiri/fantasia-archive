/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test } from 'vitest'

import FaLocaleTranslationsInput from '../FaLocaleTranslationsInput.vue'
import { resolveFaLocaleTranslationsMenuAnchorElement } from 'app/src/scripts/localeTranslations/functions/resolveFaLocaleTranslationsMenuAnchorElement'

const testLocator = 'faLocaleTranslationsInput-test'

const elementI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      faLocaleTranslationsInput: {
        fallbackWarningTooltip:
          "This field lacks current language's translation.\nFallback used: {fallbackLanguageName}",
        translateButtonTooltip: 'Edit translations'
      }
    }
  }
})

const qMenuStub = defineComponent({
  name: 'QMenu',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'before-show',
    'hide',
    'show',
    'update:modelValue'
  ],
  watch: {
    modelValue (value: boolean): void {
      if (value) {
        this.$emit('before-show')
        this.$emit('show')
      }
    }
  },
  template: '<div v-if="modelValue" class="q-menu-stub" v-bind="$attrs"><slot /></div>'
})

const qBtnStub = defineComponent({
  inheritAttrs: true,
  emits: ['click'],
  template: `
    <button
      type="button"
      class="q-btn-stub"
      v-bind="$attrs"
      @click="$emit('click', $event)"
    />
  `
})

const qInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: [
    'click',
    'update:modelValue'
  ],
  template: `
    <div
      class="q-input-stub"
      v-bind="$attrs"
      @click="$emit('click', $event)"
    >
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <slot name="append" />
      <slot name="after" />
    </div>
  `
})

const mountGlobal = {
  plugins: [elementI18n],
  stubs: {
    QBtn: qBtnStub,
    QIcon: defineComponent({
      inheritAttrs: true,
      emits: ['click'],
      template: '<span v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></span>'
    }),
    QInput: qInputStub,
    QMenu: qMenuStub,
    QTooltip: defineComponent({
      template: '<span><slot /></span>'
    })
  }
}

test('Test that FaLocaleTranslationsInput emits updated locale map when a menu input changes', async () => {
  const w = mount(FaLocaleTranslationsInput, {
    props: {
      currentLanguageCode: 'en-US',
      modelValue: { 'en-US': 'Character' },
      testLocator
    },
    global: mountGlobal
  })

  await w.find(`[data-test-locator="${testLocator}-translationsButton"]`).trigger('click')

  const enInput = w.find(`[data-test-locator="${testLocator}-translationsInput-en-US"] input`)
  await enInput.setValue('Hero')

  const emitted = w.emitted('update:modelValue')
  expect(emitted?.[0]?.[0]).toEqual({ 'en-US': 'Hero' })
})

test('Test that FaLocaleTranslationsInput removes empty locale keys', async () => {
  const w = mount(FaLocaleTranslationsInput, {
    props: {
      currentLanguageCode: 'en-US',
      modelValue: {
        'en-US': 'Character',
        de: 'Held'
      },
      testLocator
    },
    global: mountGlobal
  })

  await w.find(`[data-test-locator="${testLocator}-translationsButton"]`).trigger('click')

  const deInput = w.find(`[data-test-locator="${testLocator}-translationsInput-de"] input`)
  await deInput.setValue('')

  const emitted = w.emitted('update:modelValue')
  expect(emitted?.[0]?.[0]).toEqual({ 'en-US': 'Character' })
})

test('Test that FaLocaleTranslationsInput shows fallback warning when active locale is missing', () => {
  const w = mount(FaLocaleTranslationsInput, {
    props: {
      currentLanguageCode: 'de',
      modelValue: {
        'en-US': 'Races'
      },
      testLocator
    },
    global: mountGlobal
  })

  const warningIcon = w.find(`[data-test-locator="${testLocator}-fallbackWarning"]`)
  expect(warningIcon.exists()).toBe(true)
  expect(warningIcon.attributes('data-test-fallback-language-code')).toBe('en-US')
})

test('Test that FaLocaleTranslationsInput resolves display value for current language', () => {
  const w = mount(FaLocaleTranslationsInput, {
    props: {
      currentLanguageCode: 'de',
      modelValue: {
        de: 'Charakter',
        'en-US': 'Character'
      },
      testLocator
    },
    global: mountGlobal
  })

  const fieldInput = w.find(`[data-test-locator="${testLocator}"] input`)
  expect((fieldInput.element as HTMLInputElement).value).toBe('Charakter')
})

test('Test that FaLocaleTranslationsInput opens translations menu when readonly field is clicked', async () => {
  const w = mount(FaLocaleTranslationsInput, {
    props: {
      currentLanguageCode: 'en-US',
      modelValue: { 'en-US': 'Character' },
      testLocator
    },
    global: mountGlobal
  })

  await w.find(`[data-test-locator="${testLocator}"]`).trigger('click')
  expect(w.find(`[data-test-locator="${testLocator}-translationsMenu"]`).exists()).toBe(true)
})

test('Test that resolveFaLocaleTranslationsMenuAnchorElement prefers q-field host', () => {
  const field = document.createElement('div')
  field.className = 'q-field'
  const trigger = document.createElement('button')
  field.appendChild(trigger)
  document.body.appendChild(field)

  expect(resolveFaLocaleTranslationsMenuAnchorElement(trigger)).toBe(field)

  document.body.removeChild(field)
})

test('Test that resolveFaLocaleTranslationsMenuAnchorElement falls back to trigger element', () => {
  const trigger = document.createElement('button')
  expect(resolveFaLocaleTranslationsMenuAnchorElement(trigger)).toBe(trigger)
})
