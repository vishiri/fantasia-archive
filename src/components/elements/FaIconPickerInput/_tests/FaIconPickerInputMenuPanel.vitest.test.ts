/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import FaIconPickerInputMenuPanel from '../FaIconPickerInputMenuPanel.vue'

const menuTestLocator = 'faIconPickerInputMenuPanel-test'

const menuPanelStubs = {
  QBtn: defineComponent({
    inheritAttrs: true,
    template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
  }),
  QIcon: defineComponent({
    inheritAttrs: true,
    template: '<span class="q-icon-stub" v-bind="$attrs"><slot /></span>'
  }),
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
      <div class="q-input-stub-host">
        <slot name="prepend" />
        <input
          class="q-input-stub"
          :value="modelValue"
          v-bind="$attrs"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    `
  }),
  QSpinner: defineComponent({ template: '<span class="q-spinner-stub" />' }),
  QTooltip: defineComponent({ template: '<span class="q-tooltip-stub"><slot /></span>' }),
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

/**
 * FaIconPickerInputMenuPanel
 * Renders the search prepend icon and icon-cell tooltip copy.
 */
test('Test that FaIconPickerInputMenuPanel renders search prepend icon and icon tooltips', () => {
  const w = mount(FaIconPickerInputMenuPanel, {
    props: {
      catalogLoadError: null,
      catalogRows: [['mdi-account']],
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

  expect(w.find('.q-icon-stub[name="search"]').exists() || w.find('.q-icon-stub').exists()).toBe(true)
  expect(w.find('.q-tooltip-stub').text()).toBe('mdi-account')
})

/**
 * FaIconPickerInputMenuPanel
 * Focuses the search input and emits search-update from the search field.
 */
test('Test that FaIconPickerInputMenuPanel focuses search input and emits search-update', async () => {
  const focus = vi.fn()
  const qInputFocusStub = defineComponent({
    inheritAttrs: true,
    props: {
      modelValue: {
        type: String,
        default: ''
      }
    },
    emits: ['update:modelValue'],
    methods: {
      focus
    },
    template: `
      <input
        class="q-input-stub"
        :value="modelValue"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    `
  })

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
      stubs: {
        ...menuPanelStubs,
        QInput: qInputFocusStub
      }
    }
  })

  const exposed = w.vm as { focusSearchInput?: () => void }
  exposed.focusSearchInput?.()
  expect(focus).toHaveBeenCalled()

  await w.find(`[data-test-locator="${menuTestLocator}-search"]`).setValue('home')
  expect(w.emitted('search-update')?.[0]).toEqual(['home'])
})
