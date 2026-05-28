/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsLeftColumn from '../DialogProjectSettingsLeftColumn.vue'

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
 * DialogProjectSettingsLeftColumn
 * Renders the General settings tab and forwards tab selection updates.
 */
test('Test that DialogProjectSettingsLeftColumn renders the general settings tab', async () => {
  const w = mount(DialogProjectSettingsLeftColumn, {
    props: {
      selectedCategoryTab: 'generalSettings'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QTab: defineComponent({
          inheritAttrs: true,
          template: '<div v-bind="$attrs" />'
        }),
        QTabs: qTabsStub
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-tab-generalSettings"]').exists()).toBe(true)

  const tabs = w.findComponent(qTabsStub)
  await tabs.vm.$emit('update:modelValue', 'generalSettings')

  expect(w.emitted('update:selectedCategoryTab')?.[0]).toEqual(['generalSettings'])
})
