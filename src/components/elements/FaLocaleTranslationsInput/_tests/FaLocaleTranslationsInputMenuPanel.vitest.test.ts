/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import FaLocaleTranslationsInputMenuPanel from '../FaLocaleTranslationsInputMenuPanel.vue'
import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'

const localeRows: I_faLocaleTranslationsInputLocaleRow[] = [
  {
    code: 'en-US',
    displayName: 'English'
  }
]

const qInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  template: `
    <div class="q-input-stub" v-bind="$attrs">
      <slot name="prepend" />
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <slot name="append" />
    </div>
  `
})

test('Test that FaLocaleTranslationsInputMenuPanel renders locale translation rows', () => {
  const wrapper = mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: false,
      isMultilineInput: false,
      localeRows,
      readLocaleValue: () => 'Character',
      rows: 1,
      setPreferredLanguageInputRef: () => {},
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue: () => {}
    },
    global: {
      stubs: {
        QInput: qInputStub
      }
    }
  })

  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-translationsInput-en-US"]').exists()).toBe(true)
})

/**
 * FaLocaleTranslationsInputMenuPanel
 * Renders pinned-aside tooltip copy when a tooltip is provided.
 */
test('Test that FaLocaleTranslationsInputMenuPanel renders pinned-aside tooltip text', () => {
  const wrapper = mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: false,
      isMultilineInput: false,
      localeRows,
      pinnedAsideLabel: 'Template title',
      pinnedAsideTestLocator: 'faLocaleTranslationsInput-menuPanel-pinnedAside',
      pinnedAsideTooltip: 'Canonical template title reference',
      pinnedAsideValue: 'Character',
      readLocaleValue: () => 'Character',
      rows: 1,
      setPreferredLanguageInputRef: () => {},
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue: () => {}
    },
    global: {
      stubs: {
        QIcon: defineComponent({ template: '<span class="q-icon-stub"><slot /></span>' }),
        QInput: qInputStub,
        QTooltip: defineComponent({ template: '<span class="q-tooltip-stub"><slot /></span>' })
      }
    }
  })

  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-pinnedAside"]').exists()).toBe(true)
  expect(wrapper.find('.q-tooltip-stub').text()).toBe('Canonical template title reference')
})

/**
 * FaLocaleTranslationsInputMenuPanel
 * Emits singular-locale updates in singular-plural mode.
 */
test('Test that FaLocaleTranslationsInputMenuPanel emits singular locale updates in singular-plural mode', async () => {
  const updateSingularLocaleValue = vi.fn()
  const wrapper = mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: false,
      isMultilineInput: false,
      isSingularPluralMode: true,
      localeRows,
      pluralColumnLabel: 'Plural',
      readLocaleValue: () => 'Character',
      readPluralLocaleValue: () => 'Characters',
      readSingularLocaleValue: () => 'Character',
      rows: 1,
      setPreferredLanguageInputRef: () => {},
      singularColumnLabel: 'Singular',
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue: () => {},
      updatePluralLocaleValue: () => {},
      updateSingularLocaleValue
    },
    global: {
      stubs: {
        QInput: qInputStub
      }
    }
  })

  const singularInput = wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-translationsSingularInput-en-US"] input')
  await singularInput.setValue('Hero')

  expect(updateSingularLocaleValue).toHaveBeenCalledWith('en-US', 'Hero')
})

/**
 * FaLocaleTranslationsInputMenuPanel
 * Emits locale updates in single-form mode.
 */
test('Test that FaLocaleTranslationsInputMenuPanel emits locale updates in single-form mode', async () => {
  const updateLocaleValue = vi.fn()
  const wrapper = mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: false,
      isMultilineInput: false,
      localeRows,
      readLocaleValue: () => 'Character',
      rows: 1,
      setPreferredLanguageInputRef: () => {},
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue
    },
    global: {
      stubs: {
        QInput: qInputStub
      }
    }
  })

  const localeInput = wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-translationsInput-en-US"] input')
  await localeInput.setValue('Hero')

  expect(updateLocaleValue).toHaveBeenCalledWith('en-US', 'Hero')
})

/**
 * FaLocaleTranslationsInputMenuPanel
 * Emits plural locale updates in singular-plural mode.
 */
test('Test that FaLocaleTranslationsInputMenuPanel emits plural locale updates in singular-plural mode', async () => {
  const updatePluralLocaleValue = vi.fn()
  const wrapper = mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: false,
      isMultilineInput: false,
      isSingularPluralMode: true,
      localeRows,
      pluralColumnLabel: 'Plural',
      readLocaleValue: () => 'Character',
      readPluralLocaleValue: () => 'Characters',
      readSingularLocaleValue: () => 'Character',
      rows: 1,
      setPreferredLanguageInputRef: () => {},
      singularColumnLabel: 'Singular',
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue: () => {},
      updatePluralLocaleValue,
      updateSingularLocaleValue: () => {}
    },
    global: {
      stubs: {
        QInput: qInputStub
      }
    }
  })

  const pluralInput = wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-translationsPluralInput-en-US"] input')
  await pluralInput.setValue('Creatures')

  expect(updatePluralLocaleValue).toHaveBeenCalledWith('en-US', 'Creatures')
})

/**
 * FaLocaleTranslationsInputMenuPanel
 * Renders pinned-aside singular-plural header spacer and input without tooltip icon.
 */
test('Test that FaLocaleTranslationsInputMenuPanel renders pinned aside singular-plural layout without tooltip', () => {
  const wrapper = mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: false,
      isMultilineInput: false,
      isSingularPluralMode: true,
      localeRows,
      pinnedAsideLabel: 'Template title',
      pinnedAsideTestLocator: 'faLocaleTranslationsInput-menuPanel-pinnedAside',
      pinnedAsideValue: 'Character',
      pluralColumnLabel: 'Plural',
      readLocaleValue: () => 'Character',
      readPluralLocaleValue: () => 'Characters',
      readSingularLocaleValue: () => 'Character',
      rows: 1,
      setPreferredLanguageInputRef: () => {},
      singularColumnLabel: 'Singular',
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue: () => {},
      updatePluralLocaleValue: () => {},
      updateSingularLocaleValue: () => {}
    },
    global: {
      stubs: {
        QIcon: defineComponent({ template: '<span class="q-icon-stub"><slot /></span>' }),
        QInput: qInputStub
      }
    }
  })

  expect(wrapper.find('.faLocaleTranslationsInput__pinnedAsideHeaderSpacer').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-pinnedAside-input"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-pinnedAside-tooltipIcon"]').exists()).toBe(false)
})

/**
 * FaLocaleTranslationsInputMenuPanel
 * Wires preferred-language ref callback only on the first locale row.
 */
test('Test that FaLocaleTranslationsInputMenuPanel sets preferred language ref on first row only', () => {
  const setPreferredLanguageInputRef = vi.fn()
  const multiLocaleRows: I_faLocaleTranslationsInputLocaleRow[] = [
    {
      code: 'en-US',
      displayName: 'English'
    },
    {
      code: 'de',
      displayName: 'German'
    }
  ]

  mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: true,
      isMultilineInput: true,
      localeRows: multiLocaleRows,
      maxLength: 120,
      readLocaleValue: (code) => (code === 'en-US' ? 'Character' : 'Charakter'),
      rows: 3,
      setPreferredLanguageInputRef,
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue: () => {}
    },
    global: {
      stubs: {
        QInput: qInputStub
      }
    }
  })

  expect(setPreferredLanguageInputRef).toHaveBeenCalledTimes(1)
})
