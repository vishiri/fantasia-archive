import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'

import DialogAppSettingsLeftColumn from '../DialogAppSettingsLeftColumn.vue'

const minimalTree: T_appSettingsRenderTree = {
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
            control: 'toggle',
            value: false
          }
        }
      }
    }
  }
}

const twoCategoryTree: T_appSettingsRenderTree = {
  ...minimalTree,
  otherCategory: {
    subCategories: {},
    title: 'Other'
  }
}

/**
 * DialogAppSettingsLeftColumn
 * Mounts with a minimal render tree and exposes the first category tab locator.
 */
test('Test that DialogAppSettingsLeftColumn renders a tab for each top category', () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: false,
      appSettingsTree: minimalTree,
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

  expect(w.find('[data-test-locator="dialogAppSettings-tab-demoCategory"]').exists()).toBe(true)
  w.unmount()
})

/**
 * Active category tab must not use fa-text-muted so Quasar active-color (text-primary-bright) wins over !important muted.
 */
test('Test that only non-selected category tabs get fa-text-muted', () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: false,
      appSettingsTree: twoCategoryTree,
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

  const active = w.find('[data-test-locator="dialogAppSettings-tab-demoCategory"]')
  const inactive = w.find('[data-test-locator="dialogAppSettings-tab-otherCategory"]')
  expect(active.classes()).not.toContain('fa-text-muted')
  expect(inactive.classes()).toContain('fa-text-muted')
  w.unmount()
})

/**
 * DialogAppSettingsLeftColumn
 * Forwards search query updates from the input stand-in.
 */
test('Test that DialogAppSettingsLeftColumn emits search query updates', async () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: false,
      appSettingsTree: minimalTree,
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

/**
 * DialogAppSettingsLeftColumn
 * Null or undefined QInput model updates clear the search query.
 */
test('Test that DialogAppSettingsLeftColumn emits null when search input clears to null', async () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: true,
      appSettingsTree: minimalTree,
      searchSettingsQuery: 'abc',
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QInput: {
          props: ['modelValue'],
          template: `
            <div>
              <button type="button" class="q-input-clear-null" @click="$emit('update:modelValue', null)" />
              <button type="button" class="q-input-clear-undefined" @click="$emit('update:modelValue', undefined)" />
            </div>
          `
        },
        QTab: {
          inheritAttrs: true,
          template: '<div v-bind="$attrs"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.get('.q-input-clear-null').trigger('click')
  expect(w.emitted('update:searchSettingsQuery')?.[0]).toEqual([null])

  await w.get('.q-input-clear-undefined').trigger('click')
  expect(w.emitted('update:searchSettingsQuery')?.[1]).toEqual([null])
  w.unmount()
})

/**
 * Non-empty search query shows the flat secondary clear control; click emits null query.
 */
test('Test that DialogAppSettingsLeftColumn clears search via flat clear button', async () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: true,
      appSettingsTree: minimalTree,
      searchSettingsQuery: 'hio',
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QBtn: {
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>'
        },
        QInput: {
          props: ['modelValue'],
          template: '<div class="q-input-stub"><slot name="prepend" /><slot name="append" /></div>'
        },
        QTab: {
          inheritAttrs: true,
          template: '<div v-bind="$attrs"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' }
      }
    }
  })

  const clearBtn = w.get('[data-test-locator="dialogAppSettings-settingsSearchClear"]')
  await clearBtn.trigger('click')
  expect(w.emitted('update:searchSettingsQuery')?.[0]).toEqual([null])
  w.unmount()
})

/**
 * Empty search query hides the clear control.
 */
test('Test that DialogAppSettingsLeftColumn hides clear button when search query is empty', () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: false,
      appSettingsTree: minimalTree,
      searchSettingsQuery: '',
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QBtn: {
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs"><slot /></button>'
        },
        QInput: {
          template: '<div class="q-input-stub"><slot name="prepend" /><slot name="append" /></div>'
        },
        QTab: {
          inheritAttrs: true,
          template: '<div v-bind="$attrs"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(w.find('[data-test-locator="dialogAppSettings-settingsSearchClear"]').exists()).toBe(false)
  w.unmount()
})

/**
 * Active search fades left tabs (nonInteractive) and disables each q-tab so cursor/clicks stay blocked.
 */
test('Test that DialogAppSettingsLeftColumn marks tabs nonInteractive and disabled while search is active', () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: true,
      appSettingsTree: minimalTree,
      searchSettingsQuery: 'fe',
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QIcon: { template: '<i />' },
        QInput: { template: '<div />' },
        QTab: {
          inheritAttrs: true,
          props: ['disable'],
          template: '<div v-bind="$attrs" :data-disable="disable"><slot /></div>'
        },
        QTabs: {
          inheritAttrs: true,
          template: '<div class="q-tabs-stub" v-bind="$attrs"><slot /></div>'
        }
      }
    }
  })

  expect(w.find('.dialogAppSettings__tabs--nonInteractive').exists()).toBe(true)
  expect(
    w.find('[data-test-locator="dialogAppSettings-tab-demoCategory"]').attributes('data-disable')
  ).toBe('true')
  w.unmount()
})

/**
 * Tab selection updates must be ignored while search is active.
 */
test('Test that DialogAppSettingsLeftColumn ignores category tab updates while search is active', async () => {
  const w = mount(DialogAppSettingsLeftColumn, {
    props: {
      hasActiveSearchQuery: true,
      appSettingsTree: twoCategoryTree,
      searchSettingsQuery: 'fe',
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
        QTabs: {
          inheritAttrs: true,
          emits: ['update:modelValue'],
          template: '<div class="q-tabs-stub" v-bind="$attrs" @click="$emit(\'update:modelValue\', \'otherCategory\')"><slot /></div>'
        }
      }
    }
  })

  await w.get('.q-tabs-stub').trigger('click')
  expect(w.emitted('update:selectedCategoryTab')).toBeUndefined()
  w.unmount()
})
