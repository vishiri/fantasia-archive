/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

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
      } else {
        this.$emit('hide')
      }
    }
  },
  template: `
    <div v-if="modelValue" class="q-menu-stub" v-bind="$attrs">
      <slot />
      <button
        class="q-menu-stub-close"
        type="button"
        @click="$emit('update:modelValue', false)"
      />
    </div>
  `
})

const qTooltipStub = defineComponent({
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

const qBtnStub = defineComponent({
  name: 'QBtn',
  inheritAttrs: true,
  emits: ['click'],
  template: `
    <button type="button" class="q-btn-stub" v-bind="$attrs" @click="$emit('click', $event)">
      <slot />
    </button>
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
    <div class="q-input-stub" v-bind="$attrs" @click="$emit('click', $event)">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
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
        QTooltip: qTooltipStub
      }
    }
  })

  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField-translationsButton"]').exists()).toBe(true)
})

test('Test that FaLocaleTranslationsInputSummaryField opens translations menu from field and button clicks', async () => {
  const openTranslationsMenu = vi.fn()
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
      openTranslationsMenu,
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
        QTooltip: qTooltipStub
      }
    }
  })

  await wrapper.find('.q-input-stub').trigger('click')
  await wrapper.find('.q-btn-stub').trigger('click')
  expect(openTranslationsMenu).toHaveBeenCalledTimes(2)
  wrapper.unmount()
})

test('Test that FaLocaleTranslationsInputSummaryField stops click propagation on fallback warning icon', async () => {
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
      showFallbackWarning: true,
      testLocator: 'faLocaleTranslationsInput-summaryField',
      translateButtonTooltip: 'Edit translations',
      translationsMenuOpen: false,
      updateLocaleValue: () => {}
    },
    global: {
      stubs: {
        FaLocaleTranslationsInputMenuPanel: faLocaleTranslationsInputMenuPanelStub,
        FaMultilineTooltipBody: { template: '<span><slot /></span>' },
        QBtn: qBtnStub,
        QIcon: {
          template: '<button data-test-locator="faLocaleTranslationsInput-summaryField-fallbackWarning" type="button" />'
        },
        QInput: qInputStub,
        QMenu: qMenuStub,
        QTooltip: qTooltipStub
      }
    }
  })

  await wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField-fallbackWarning"]').trigger('click')
  wrapper.unmount()
})

/**
 * FaLocaleTranslationsInputSummaryField
 * Renders translate-button tooltip copy from props.
 */
test('Test that FaLocaleTranslationsInputSummaryField renders translate button tooltip text', () => {
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
        QTooltip: qTooltipStub
      }
    }
  })

  expect(wrapper.find('.q-tooltip-stub').text()).toBe('Edit translations')
})

/**
 * FaLocaleTranslationsInputSummaryField
 * Emits menu-open updates when the translations menu closes.
 */
test('Test that FaLocaleTranslationsInputSummaryField emits translations menu open updates', async () => {
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
      translationsMenuOpen: true,
      updateLocaleValue: () => {}
    },
    global: {
      stubs: {
        FaLocaleTranslationsInputMenuPanel: faLocaleTranslationsInputMenuPanelStub,
        FaMultilineTooltipBody: true,
        QBtn: qBtnStub,
        QInput: qInputStub,
        QMenu: qMenuStub,
        QTooltip: qTooltipStub
      }
    }
  })

  await wrapper.find('.q-menu-stub-close').trigger('click')

  const emitted = wrapper.emitted('update:translationsMenuOpen')
  expect(emitted?.[0]!).toEqual([false])
})

/**
 * FaLocaleTranslationsInputSummaryField
 * Exposes the translate button element for menu anchoring.
 */
test('Test that FaLocaleTranslationsInputSummaryField exposes the translate button element', () => {
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
        QTooltip: qTooltipStub
      }
    }
  })

  const exposed = wrapper.vm as {
    readTranslationsButtonElement?: () => HTMLElement | null
  }
  const buttonElement = exposed.readTranslationsButtonElement?.()
  expect(buttonElement).toBeInstanceOf(HTMLElement)
  expect(buttonElement?.classList.contains('q-btn-stub')).toBe(true)
})

/**
 * FaLocaleTranslationsInputSummaryField
 * Returns null from readTranslationsButtonElement after the field is unmounted.
 */
test('Test that FaLocaleTranslationsInputSummaryField returns null after unmount', () => {
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
        QTooltip: qTooltipStub
      }
    }
  })

  const exposed = wrapper.vm as {
    readTranslationsButtonElement?: () => HTMLElement | null
  }
  const readTranslationsButtonElement = exposed.readTranslationsButtonElement
  wrapper.unmount()
  expect(readTranslationsButtonElement?.()).toBeNull()
})

/**
 * FaLocaleTranslationsInputSummaryField
 * Renders open translations menu with singular-plural and pinned-aside bindings.
 */
test('Test that FaLocaleTranslationsInputSummaryField renders open menu with singular-plural bindings', async () => {
  const updatePluralLocaleValue = vi.fn()

  const openMenuStub = defineComponent({
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
    mounted (): void {
      if (this.modelValue) {
        this.$emit('before-show')
        this.$emit('show')
      }
    },
    template: `
      <div v-if="modelValue" class="q-menu-stub" v-bind="$attrs">
        <slot />
        <button
          class="q-menu-stub-close"
          type="button"
          @click="$emit('update:modelValue', false); $emit('hide')"
        />
      </div>
    `
  })

  const wrapper = mount(FaLocaleTranslationsInputSummaryField, {
    props: {
      autogrow: true,
      color: 'primary-bright',
      dark: true,
      dense: true,
      error: true,
      errorMessage: 'Required translation',
      fallbackWarningTooltip: 'Fallback used',
      hideBottomSpace: true,
      isMenuPresentationLocked: true,
      isMultilineInput: true,
      isSingularPluralMode: true,
      localeRows,
      lockedMenuContentStyle: { width: '320px' },
      maxLength: 80,
      menuOffset: [0, 4],
      menuPinnedAsideLabel: 'Template title',
      menuPinnedAsideTestLocator: 'faLocaleTranslationsInput-summaryField-pinnedAside',
      menuPinnedAsideTooltip: 'Canonical title',
      menuPinnedAsideValue: 'Character',
      menuTarget: undefined,
      onTranslationsMenuBeforeShow: () => {},
      onTranslationsMenuHide: () => {},
      onTranslationsMenuShow: () => {},
      openTranslationsMenu: () => {},
      pluralColumnLabel: 'Plural',
      readLocaleValue: () => 'Character',
      readPluralLocaleValue: () => 'Characters',
      readSingularLocaleValue: () => 'Character',
      resolvedLanguageCode: 'en-US',
      resolvedTextareaRows: 2,
      resolvedValue: 'Character',
      setPreferredLanguageInputRef: () => {},
      showFallbackWarning: true,
      singularColumnLabel: 'Singular',
      testLocator: 'faLocaleTranslationsInput-summaryField',
      translateButtonTooltip: 'Edit translations',
      translationsMenuOpen: true,
      updateLocaleValue: () => {},
      updatePluralLocaleValue,
      updateSingularLocaleValue: () => {}
    },
    global: {
      stubs: {
        FaMultilineTooltipBody: { template: '<span><slot /></span>' },
        QBtn: qBtnStub,
        QIcon: {
          template: '<button data-test-locator="faLocaleTranslationsInput-summaryField-fallbackWarning" type="button" />'
        },
        QInput: qInputStub,
        QMenu: openMenuStub,
        QTooltip: qTooltipStub
      }
    }
  })

  expect(wrapper.find('.faLocaleTranslationsInput__menu--locked').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField-translationsSingularInput-en-US"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField-pinnedAside"]').exists()).toBe(true)

  const pluralInput = wrapper.find('[data-test-locator="faLocaleTranslationsInput-summaryField-translationsPluralInput-en-US"] input')
  await pluralInput.setValue('Creatures')
  expect(updatePluralLocaleValue).toHaveBeenCalledWith('en-US', 'Creatures')

  wrapper.unmount()
})
