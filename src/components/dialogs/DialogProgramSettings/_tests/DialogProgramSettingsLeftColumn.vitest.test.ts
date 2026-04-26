import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'

import DialogProgramSettingsLeftColumn from '../DialogProgramSettingsLeftColumn.vue'

const minimalTree: T_programSettingsRenderTree = {
  demoCategory: {
    title: 'Demo',
    subCategories: {
      demoSub: {
        title: 'Sub',
        settingsList: {
          demoSetting: {
            description: 'd',
            tags: '',
            title: 'Setting',
            value: false
          }
        }
      }
    }
  }
}

const twoCategoryTree: T_programSettingsRenderTree = {
  ...minimalTree,
  otherCategory: {
    subCategories: {},
    title: 'Other'
  }
}

/**
 * DialogProgramSettingsLeftColumn
 * Mounts with a minimal render tree and exposes the first category tab locator.
 */
test('Test that DialogProgramSettingsLeftColumn renders a tab for each top category', () => {
  const w = mount(DialogProgramSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: false,
      programSettingsTree: minimalTree,
      searchSettingsQuery: '',
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QInput: {
          props: ['modelValue'],
          template: '<input class="q-input-mock" :value="modelValue" @input="onInput" />',
          methods: {
            onInput (event: Event) {
              const t = event.target
              this.$emit('update:modelValue', t instanceof HTMLInputElement ? t.value : '')
            }
          }
        },
        QTab: {
          inheritAttrs: true,
          template: '<div v-bind="$attrs"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProgramSettings-tab-demoCategory"]').exists()).toBe(true)
  w.unmount()
})

/**
 * Active category tab must not use fa-text-muted so Quasar active-color (text-primary-bright) wins over !important muted.
 */
test('Test that only non-selected category tabs get fa-text-muted', () => {
  const w = mount(DialogProgramSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: false,
      programSettingsTree: twoCategoryTree,
      searchSettingsQuery: '',
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QInput: { template: '<div />' },
        QTab: {
          inheritAttrs: true,
          template: '<div v-bind="$attrs"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' }
      }
    }
  })

  const active = w.find('[data-test-locator="dialogProgramSettings-tab-demoCategory"]')
  const inactive = w.find('[data-test-locator="dialogProgramSettings-tab-otherCategory"]')
  expect(active.classes()).not.toContain('fa-text-muted')
  expect(inactive.classes()).toContain('fa-text-muted')
  w.unmount()
})

/**
 * DialogProgramSettingsLeftColumn
 * Forwards search query updates from the input stand-in.
 */
test('Test that DialogProgramSettingsLeftColumn emits search query updates', async () => {
  const w = mount(DialogProgramSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: false,
      programSettingsTree: minimalTree,
      searchSettingsQuery: '',
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QInput: {
          props: ['modelValue'],
          template: '<input class="q-input-mock" :value="modelValue" @input="onInput" />',
          methods: {
            onInput (event: Event) {
              const t = event.target
              this.$emit('update:modelValue', t instanceof HTMLInputElement ? t.value : '')
            }
          }
        },
        QTab: {
          inheritAttrs: true,
          template: '<div v-bind="$attrs"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.get('.q-input-mock').setValue('abc')
  expect(w.emitted('update:searchSettingsQuery')?.[0]).toEqual(['abc'])
  w.unmount()
})
