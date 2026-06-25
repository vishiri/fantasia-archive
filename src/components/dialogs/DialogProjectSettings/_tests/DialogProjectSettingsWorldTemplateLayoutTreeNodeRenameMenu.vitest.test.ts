/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu.vue'

const faLocaleTranslationsInputStub = defineComponent({
  name: 'FaLocaleTranslationsInput',
  props: {
    testLocator: {
      type: String,
      required: true
    }
  },
  template: '<div class="fa-locale-translations-input-stub" :data-test-locator="testLocator" />'
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

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu renders rename menu body', () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu, {
    props: {
      contextMenuTestLocator: 'treeNode-renameMenu',
      currentLanguageCode: 'en-US',
      errorMessage: undefined,
      hasError: false,
      inputTestLocator: 'treeNode-renameInput',
      maxLength: 120,
      menuOffset: [0, 4],
      menuPinnedAsideLabel: undefined,
      menuPinnedAsideTestLocator: undefined,
      menuPinnedAsideTooltip: undefined,
      menuPinnedAsideValue: undefined,
      menuTarget: null,
      onBeforeShow: () => {},
      onClose: () => {},
      onHide: () => {},
      onShow: () => {},
      onTranslationsDraftUpdate: () => {},
      renameMenuOpen: true,
      translationForms: 'single',
      translationsDraft: { 'en-US': 'Character' }
    },
    global: {
      stubs: {
        FaLocaleTranslationsInput: faLocaleTranslationsInputStub,
        QMenu: qMenuStub
      }
    }
  })

  expect(wrapper.find('[data-test-locator="treeNode-renameMenu"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="treeNode-renameInput"]').exists()).toBe(true)
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu focuses input on show and closes on escape', async () => {
  const onClose = vi.fn()
  const onShow = vi.fn()
  const focusPreferredLanguageInput = vi.fn()

  const focusableFaLocaleStub = defineComponent({
    name: 'FaLocaleTranslationsInput',
    props: {
      testLocator: {
        type: String,
        required: true
      }
    },
    setup (_props, { expose }) {
      expose({ focusPreferredLanguageInput })
      return { focusPreferredLanguageInput }
    },
    template: '<div class="fa-locale-translations-input-stub" :data-test-locator="testLocator" />'
  })

  const escMenuStub = defineComponent({
    name: 'QMenu',
    props: {
      modelValue: {
        type: Boolean,
        default: false
      }
    },
    emits: ['before-show', 'hide', 'show', 'update:modelValue'],
    mounted (): void {
      if (this.modelValue) {
        this.$emit('show')
      }
    },
    template: `
      <div
        v-if="modelValue"
        class="q-menu-stub"
        v-bind="$attrs"
        @keydown.esc.stop="$emit('update:modelValue', false)"
      >
        <slot />
      </div>
    `
  })

  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu, {
    props: {
      contextMenuTestLocator: 'treeNode-renameMenu',
      currentLanguageCode: 'en-US',
      errorMessage: undefined,
      hasError: false,
      inputTestLocator: 'treeNode-renameInput',
      maxLength: 120,
      menuOffset: [0, 4],
      menuPinnedAsideLabel: undefined,
      menuPinnedAsideTestLocator: undefined,
      menuPinnedAsideTooltip: undefined,
      menuPinnedAsideValue: undefined,
      menuTarget: null,
      onBeforeShow: () => {},
      onClose,
      onHide: () => {},
      onShow,
      onTranslationsDraftUpdate: () => {},
      renameMenuOpen: true,
      translationForms: 'single',
      translationsDraft: { 'en-US': 'Character' }
    },
    global: {
      stubs: {
        FaLocaleTranslationsInput: focusableFaLocaleStub,
        QMenu: escMenuStub
      }
    }
  })

  await flushPromises()
  expect(onShow).toHaveBeenCalled()
  expect(focusPreferredLanguageInput).toHaveBeenCalled()

  await wrapper
    .find('.dialogProjectSettingsWorldTemplateLayoutTreeNode__renameMenuBody')
    .trigger('keydown', { key: 'Escape' })
  expect(onClose).toHaveBeenCalled()
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu
 * Binds menu offset and content style on the rename menu shell.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu binds menu offset and style', () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu, {
    props: {
      contextMenuTestLocator: 'treeNode-renameMenu',
      currentLanguageCode: 'en-US',
      errorMessage: undefined,
      hasError: false,
      inputTestLocator: 'treeNode-renameInput',
      maxLength: 120,
      menuOffset: [12, 8],
      menuPinnedAsideLabel: undefined,
      menuPinnedAsideTestLocator: undefined,
      menuPinnedAsideTooltip: undefined,
      menuPinnedAsideValue: undefined,
      menuStyle: { minWidth: '240px' },
      menuTarget: null,
      onBeforeShow: () => {},
      onClose: () => {},
      onHide: () => {},
      onShow: () => {},
      onTranslationsDraftUpdate: () => {},
      renameMenuOpen: true,
      translationForms: 'single',
      translationsDraft: { 'en-US': 'Character' }
    },
    global: {
      stubs: {
        FaLocaleTranslationsInput: faLocaleTranslationsInputStub,
        QMenu: qMenuStub
      }
    }
  })

  const menu = wrapper.find('.q-menu-stub')
  expect(menu.attributes('data-test-locator')).toBe('treeNode-renameMenu')
  expect(wrapper.find('.dialogProjectSettingsWorldTemplateLayoutTreeNode__renameMenuBody').attributes('style')).toContain('min-width: 240px')
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu
 * Syncs translations draft through FaLocaleTranslationsInput v-model.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu syncs translations draft', async () => {
  const onTranslationsDraftUpdate = vi.fn()
  const translationsDraft = { 'en-US': 'Character' }

  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu, {
    props: {
      contextMenuTestLocator: 'treeNode-renameMenu',
      currentLanguageCode: 'en-US',
      errorMessage: undefined,
      hasError: false,
      inputTestLocator: 'treeNode-renameInput',
      maxLength: 120,
      menuOffset: [0, 4],
      menuPinnedAsideLabel: undefined,
      menuPinnedAsideTestLocator: undefined,
      menuPinnedAsideTooltip: undefined,
      menuPinnedAsideValue: undefined,
      menuTarget: null,
      onBeforeShow: () => {},
      onClose: () => {},
      onHide: () => {},
      onShow: () => {},
      onTranslationsDraftUpdate,
      renameMenuOpen: true,
      translationForms: 'single',
      translationsDraft
    },
    global: {
      stubs: {
        FaLocaleTranslationsInput: defineComponent({
          props: {
            modelValue: {
              type: Object,
              required: true
            }
          },
          emits: ['update:modelValue'],
          template: '<button type="button" data-test-locator="emit-draft" @click="$emit(\'update:modelValue\', { \'en-US\': \'Updated\' })" />'
        }),
        QMenu: qMenuStub
      }
    }
  })

  await wrapper.find('[data-test-locator="emit-draft"]').trigger('click')
  expect(onTranslationsDraftUpdate).toHaveBeenCalledWith({ 'en-US': 'Updated' })
})

/**
 * DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu
 * Syncs rename menu open state through q-menu v-model.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu syncs rename menu open state', async () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu, {
    props: {
      contextMenuTestLocator: 'treeNode-renameMenu',
      currentLanguageCode: 'en-US',
      errorMessage: undefined,
      hasError: false,
      inputTestLocator: 'treeNode-renameInput',
      maxLength: 120,
      menuOffset: [0, 4],
      menuPinnedAsideLabel: undefined,
      menuPinnedAsideTestLocator: undefined,
      menuPinnedAsideTooltip: undefined,
      menuPinnedAsideValue: undefined,
      menuTarget: null,
      onBeforeShow: () => {},
      onClose: () => {},
      onHide: () => {},
      onShow: () => {},
      onTranslationsDraftUpdate: () => {},
      renameMenuOpen: true,
      translationForms: 'single',
      translationsDraft: { 'en-US': 'Character' }
    },
    global: {
      stubs: {
        FaLocaleTranslationsInput: faLocaleTranslationsInputStub,
        QMenu: defineComponent({
          name: 'QMenu',
          props: {
            modelValue: {
              type: Boolean,
              default: false
            }
          },
          emits: ['update:modelValue'],
          template: `
            <div v-if="modelValue" class="q-menu-stub">
              <button type="button" data-test-locator="close-menu" @click="$emit('update:modelValue', false)" />
            </div>
          `
        })
      }
    }
  })

  await wrapper.find('[data-test-locator="close-menu"]').trigger('click')
  expect(wrapper.emitted('update:renameMenuOpen')?.at(-1)).toEqual([false])
})
