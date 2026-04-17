/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

import DialogKeybindSettings from '../DialogKeybindSettings.vue'

const syntheticNonEditableRow: I_dialogKeybindSettingsRow = {
  commandId: 'toggleDeveloperTools',
  defaultLabel: 'stub-default-label',
  editable: false,
  nameLabel: 'stub-non-editable-name',
  rowKey: 'stub-non-editable-row',
  userChord: null,
  userShowsAddNewCombo: true
}

const syntheticEmptyChordRow: I_dialogKeybindSettingsRow = {
  commandId: 'openProgramSettings',
  defaultLabel: 'stub-default-2',
  editable: true,
  nameLabel: 'stub-empty-chord-label',
  rowKey: 'stub-empty-chord-row',
  userChord: null,
  userShowsAddNewCombo: false
}

const syntheticChordRow: I_dialogKeybindSettingsRow = {
  commandId: 'openProgramSettings',
  defaultLabel: 'stub-default-3',
  editable: true,
  nameLabel: 'stub-chord-row',
  rowKey: 'stub-chord-row',
  userChord: {
    code: 'KeyB',
    mods: ['alt']
  } as I_faChordSerialized,
  userShowsAddNewCombo: false
}

const QTableStub = defineComponent({
  name: 'QTable',
  inheritAttrs: true,
  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },
  setup () {
    return {
      syntheticChordRow,
      syntheticEmptyChordRow,
      syntheticNonEditableRow
    }
  },
  template: `
    <div data-test-locator="dialogKeybindSettings-qtable-stub">
      <slot name="top-right" />
      <template v-if="rows.length === 0">
        <slot name="no-data" />
      </template>
      <template v-else>
        <template v-for="(row, idx) in rows" :key="row.rowKey || String(idx)">
          <slot name="body" :row="row" />
        </template>
        <slot name="body" :row="syntheticNonEditableRow" />
        <slot name="body" :row="syntheticEmptyChordRow" />
        <slot name="body" :row="syntheticChordRow" />
      </template>
    </div>
  `
})

const QTrStub = defineComponent({
  name: 'QTr',
  inheritAttrs: true,
  template: '<div class="q-tr-stub"><slot /></div>'
})

const QTdStub = defineComponent({
  name: 'QTd',
  inheritAttrs: true,
  template: '<div class="q-td-stub"><slot /></div>'
})

const dialogKeybindSettingsQInputStub = defineComponent({
  name: 'QInput',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    onInput (event: Event): void {
      const target = event.target as HTMLInputElement
      this.$emit('update:modelValue', target.value)
    }
  },
  template: `
    <div class="dialogKeybindSettings-qinput-stub">
      <slot name="prepend" />
      <input
        v-bind="$attrs"
        :value="modelValue"
        @input="onInput"
      />
    </div>
  `
})

const dialogKeybindSettingsMountOptions = {
  global: {
    components: {
      QIcon: defineComponent({
        name: 'QIcon',
        props: {
          name: {
            type: String,
            default: ''
          }
        },
        template: '<i class="q-icon-search-stub">{{ name }}</i>'
      }),
      QInput: dialogKeybindSettingsQInputStub,
      QTd: QTdStub,
      QTable: QTableStub,
      QTr: QTrStub
    },
    config: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => {
          const lower = tag.toLowerCase()
          if (
            [
              'q-btn',
              'q-card',
              'q-card-actions',
              'q-card-section',
              'q-dialog',
              'q-icon',
              'q-input',
              'q-table',
              'q-td',
              'q-tr'
            ].includes(lower)
          ) {
            return false
          }

          return /^q-/i.test(tag)
        }
      }
    },
    mocks: { $t: (k: string) => k },
    stubs: {
      DialogKeybindSettingsCaptureDialog: defineComponent({
        name: 'DialogKeybindSettingsCaptureDialogStub',
        inheritAttrs: false,
        props: {
          modelValue: {
            type: Boolean,
            default: false
          }
        },
        emits: ['update:modelValue'],
        template: `
          <div data-test-locator="dialogKeybindSettings-capture-dialog-stub" v-if="modelValue">
            <button
              type="button"
              data-test-locator="dialogKeybindSettings-capture-close-stub"
              @click="$emit('update:modelValue', false)"
            >
              close-capture
            </button>
          </div>
        `
      }),
      QBtn: defineComponent({
        name: 'QBtn',
        inheritAttrs: true,
        template: '<button type="button" v-bind="$attrs"><slot /></button>'
      }),
      QCard: { template: '<div><slot /></div>' },
      QCardActions: { template: '<div><slot /></div>' },
      QCardSection: { template: '<div><slot /></div>' },
      QDialog: defineComponent({
        name: 'QDialog',
        inheritAttrs: false,
        props: {
          modelValue: {
            type: Boolean,
            default: false
          }
        },
        emits: ['update:modelValue', 'hide'],
        template: '<div class="q-dialog-stub" v-bind="$attrs"><slot /></div>'
      })
    }
  }
} as const

beforeEach(() => {
  vi.restoreAllMocks()
})

/**
 * DialogKeybindSettings
 * directInput should open the keybind dialog shell and surface i18n title key via mocked translator.
 */
test('Test that DialogKeybindSettings renders keybind dialog shell for KeybindSettings input', async () => {
  const w = mount(DialogKeybindSettings, {
    ...dialogKeybindSettingsMountOptions,
    props: { directInput: 'KeybindSettings' }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('KeybindSettings')
  expect(w.text()).toContain('dialogs.keybindSettings.title')
  w.unmount()
})

/**
 * DialogKeybindSettings
 * Table body should render default column, built-in label for non-editable rows, and capture sheet when a row opens capture.
 */
test('Test that DialogKeybindSettings table body covers default column, non-editable label, and capture dialog', async () => {
  const w = mount(DialogKeybindSettings, {
    ...dialogKeybindSettingsMountOptions,
    props: { directInput: 'KeybindSettings' }
  })

  await flushPromises()

  expect(w.text()).toContain('stub-non-editable-name')
  expect(w.text()).toContain('stub-default-label')
  expect(w.text()).toContain('dialogs.keybindSettings.builtInUneditable')

  const userButtons = w.findAll('[data-test-locator="dialogKeybindSettings-userKeybind-button"]')
  expect(userButtons.length).toBeGreaterThan(0)
  await userButtons[0].trigger('click')
  await flushPromises()

  expect(w.find('[data-test-locator="dialogKeybindSettings-capture-dialog-stub"]').exists()).toBe(true)
  expect(w.text()).toContain('stub-empty-chord-label')

  await w.get('[data-test-locator="dialogKeybindSettings-capture-close-stub"]').trigger('click')
  await flushPromises()

  expect(w.find('[data-test-locator="dialogKeybindSettings-capture-dialog-stub"]').exists()).toBe(false)

  w.unmount()
})

/**
 * DialogKeybindSettings
 * Save should call the keybind store update path when the save button is pressed.
 */
test('Test that DialogKeybindSettings save button triggers save wiring', async () => {
  const w = mount(DialogKeybindSettings, {
    ...dialogKeybindSettingsMountOptions,
    props: { directInput: 'KeybindSettings' }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogKeybindSettings-save"]').trigger('click')
  await flushPromises()

  w.unmount()
})

/**
 * DialogKeybindSettings
 * Root q-dialog should accept model updates and the table filter input should bind the filter ref.
 */
test('Test that DialogKeybindSettings forwards q-dialog v-model and filter input typing', async () => {
  const w = mount(DialogKeybindSettings, {
    ...dialogKeybindSettingsMountOptions,
    props: { directInput: 'KeybindSettings' }
  })

  await flushPromises()

  const dlg = w.findComponent({ name: 'QDialog' })
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()

  const filterInputs = w.findAll('input')
  expect(filterInputs.length).toBeGreaterThan(0)
  expect(w.get('.q-icon-search-stub').text()).toBe('search')
  await filterInputs[0].setValue('program')
  await flushPromises()

  w.unmount()
})

/**
 * DialogKeybindSettings
 * When the filter matches no action names, the table no-data slot shows ErrorCard copy from vue-i18n.
 */
test('Test that DialogKeybindSettings shows filter empty ErrorCard when filter matches no rows', async () => {
  const w = mount(DialogKeybindSettings, {
    ...dialogKeybindSettingsMountOptions,
    props: { directInput: 'KeybindSettings' }
  })

  await flushPromises()

  const filterInputs = w.findAll('input')
  await filterInputs[0].setValue('zzzz-no-matching-keybind-label-zzzz')
  await flushPromises()

  expect(w.find('[data-test-locator="dialogKeybindSettings-filterNoResults"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="errorCard"]').exists()).toBe(true)
  expect(w.text()).toContain('dialogs.keybindSettings.filterNoResultsTitle')

  w.unmount()
})
