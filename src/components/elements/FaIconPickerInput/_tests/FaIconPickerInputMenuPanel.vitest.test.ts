/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaIconPickerInputMenuPanel from '../FaIconPickerInputMenuPanel.vue'

const menuTestLocator = 'faIconPickerInputMenuPanel-test'

const menuPanelStubs = {
  QBtn: defineComponent({
    inheritAttrs: true,
    template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')" />'
  }),
  QIcon: defineComponent({ template: '<span class="q-icon-stub" />' }),
  QInnerLoading: defineComponent({ template: '<div class="q-inner-loading-stub"><slot /></div>' }),
  QInput: defineComponent({
    inheritAttrs: true,
    props: {
      modelValue: {
        type: String,
        default: ''
      }
    },
    emits: ['update:modelValue'],
    template: `
      <input
        class="q-input-stub"
        :value="modelValue"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    `
  }),
  QSpinner: defineComponent({ template: '<span class="q-spinner-stub" />' }),
  QTooltip: defineComponent({ template: '<span><slot /></span>' }),
  QVirtualScroll: defineComponent({
    props: {
      items: {
        type: Array,
        default: () => []
      }
    },
    template: `
      <div class="q-virtual-scroll-stub">
        <slot
          :index="0"
          :item="items[0]"
        />
      </div>
    `
  })
}

/**
 * FaIconPickerInputMenuPanel
 * Renders search input and virtual-scroll icon grid when catalog rows exist.
 */
test('Test that FaIconPickerInputMenuPanel renders catalog rows', () => {
  const w = mount(FaIconPickerInputMenuPanel, {
    props: {
      catalogLoadError: null,
      catalogRows: [['mdi-account', 'mdi-home']],
      hasCatalogRows: true,
      isCatalogLoading: false,
      menuTestLocator,
      modelValue: 'mdi-account',
      searchQuery: ''
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: menuPanelStubs
    }
  })

  expect(w.find(`[data-test-locator="${menuTestLocator}"]`).exists()).toBe(true)
  expect(w.find(`[data-test-locator="${menuTestLocator}-search"]`).exists()).toBe(true)
  expect(w.find(`[data-test-locator="${menuTestLocator}-virtualScroll"]`).exists()).toBe(true)
  expect(w.find(`[data-test-locator="${menuTestLocator}-iconCell"]`).exists()).toBe(true)
})

/**
 * FaIconPickerInputMenuPanel
 * Emits icon-select when an icon cell is clicked.
 */
test('Test that FaIconPickerInputMenuPanel emits icon-select on cell click', async () => {
  const w = mount(FaIconPickerInputMenuPanel, {
    props: {
      catalogLoadError: null,
      catalogRows: [['mdi-account']],
      hasCatalogRows: true,
      isCatalogLoading: false,
      menuTestLocator,
      modelValue: '',
      searchQuery: ''
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: menuPanelStubs
    }
  })

  await w.find('[data-test-icon-name="mdi-account"]').trigger('click')
  expect(w.emitted('icon-select')?.[0]).toEqual(['mdi-account'])
})

/**
 * FaIconPickerInputMenuPanel
 * Shows empty-results message when catalog has no rows.
 */
test('Test that FaIconPickerInputMenuPanel shows empty results message', () => {
  const w = mount(FaIconPickerInputMenuPanel, {
    props: {
      catalogLoadError: null,
      catalogRows: [],
      hasCatalogRows: false,
      isCatalogLoading: false,
      menuTestLocator,
      modelValue: '',
      searchQuery: 'zzz'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: menuPanelStubs
    }
  })

  expect(w.find(`[data-test-locator="${menuTestLocator}-empty"]`).exists()).toBe(true)
  expect(w.text()).toContain('faIconPickerInput.emptyResultsMessage')
})
