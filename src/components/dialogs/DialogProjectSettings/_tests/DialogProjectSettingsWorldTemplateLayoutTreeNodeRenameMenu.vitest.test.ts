/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

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
