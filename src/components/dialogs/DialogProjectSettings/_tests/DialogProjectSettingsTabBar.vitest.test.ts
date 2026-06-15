/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import {
  FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB,
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
} from '../scripts/functions/dialogProjectSettingsDialogInput'
import DialogProjectSettingsTabBar from '../DialogProjectSettingsTabBar.vue'

const qTabsStub = defineComponent({
  name: 'QTabs',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  template: '<div class="q-tabs-stub"><slot /></div>'
})

/**
 * DialogProjectSettingsTabBar
 * Renders the General settings tab and forwards tab selection updates.
 */
test('Test that DialogProjectSettingsTabBar renders the general settings tab', async () => {
  const w = mount(DialogProjectSettingsTabBar, {
    props: {
      documentTemplatesTabHasError: false,
      generalTabHasError: false,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
      worldsTabHasError: false
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QSeparator: { template: '<hr />' },
        QTab: defineComponent({
          inheritAttrs: true,
          template: '<div v-bind="$attrs" />'
        }),
        QTabs: qTabsStub
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-tab-generalSettings"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-tab-worldsSettings"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-tab-documentTemplatesSettings"]').exists()).toBe(true)

  const tabs = w.findComponent(qTabsStub)
  await tabs.vm.$emit('update:modelValue', FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)

  expect(w.emitted('update:selectedCategoryTab')?.[0]).toEqual([FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB])

  await tabs.vm.$emit('update:modelValue', FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB)

  expect(w.emitted('update:selectedCategoryTab')?.[1]).toEqual([FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB])

  await tabs.vm.$emit('update:modelValue', FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB)

  expect(w.emitted('update:selectedCategoryTab')?.[2]).toEqual([FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB])
})

/**
 * DialogProjectSettingsTabBar
 * Marks the General settings tab when the project name is invalid.
 */
test('Test that DialogProjectSettingsTabBar marks the general settings tab on project name errors', () => {
  const w = mount(DialogProjectSettingsTabBar, {
    props: {
      documentTemplatesTabHasError: false,
      generalTabHasError: true,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
      worldsTabHasError: false
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QSeparator: { template: '<hr />' },
        QTab: defineComponent({
          inheritAttrs: true,
          template: '<div v-bind="$attrs" />'
        }),
        QTabs: qTabsStub
      }
    }
  })

  const generalTab = w.find('[data-test-locator="dialogProjectSettings-tab-generalSettings"]')
  expect(generalTab.attributes('data-test-validation-error')).toBe('true')
  expect(generalTab.classes()).toContain('dialogProjectSettings__tab--error')
})
