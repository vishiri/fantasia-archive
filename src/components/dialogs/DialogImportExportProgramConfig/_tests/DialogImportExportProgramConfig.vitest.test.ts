import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProgramConfigPrepareResult } from 'app/types/I_faProgramConfigDomain'

import * as dialogStores from 'app/src/stores/S_Dialog'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import DialogImportExportProgramConfig from '../DialogImportExportProgramConfig.vue'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

const importExportQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      default: false,
      type: Boolean
    }
  },
  emits: ['update:modelValue'],
  template: `
    <div class="import-export-qdialog-stub" v-bind="$attrs">
      <div v-if="modelValue" class="import-export-qdialog-inner">
        <slot />
      </div>
    </div>
  `
})

const importExportDialogGlobal = {
  mocks: { $t: (key: string) => key },
  stubs: {
    QBtn: { template: '<button type="button" v-bind="$attrs"><slot /></button>' },
    QCard: { template: '<div><slot /></div>' },
    QCardActions: { template: '<div><slot /></div>' },
    QCardSection: { template: '<div><slot /></div>' },
    QCheckbox: { template: '<div class="q-checkbox-stub" />' },
    QDialog: importExportQDialogStub,
    QSeparator: { template: '<div class="q-separator-stub" role="separator" />' }
  }
} as const

beforeEach(() => {
  vi.restoreAllMocks()
})

/**
 * DialogImportExportProgramConfig
 * directInput should open the dialog shell for ImportExportProgramConfig.
 */
test('Test that DialogImportExportProgramConfig opens from directInput on mount', async () => {
  const w = mount(DialogImportExportProgramConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportProgramConfig' }
  })

  await flushPromises()

  expect(w.find('.import-export-qdialog-inner').exists()).toBe(true)
  expect(w.text()).toContain('dialogs.importExportProgramConfig.title')
  w.unmount()
})

/**
 * DialogImportExportProgramConfig
 * directInput watch should open when the prop is set after mount.
 */
test('Test that DialogImportExportProgramConfig opens when directInput becomes ImportExportProgramConfig', async () => {
  const w = mount(DialogImportExportProgramConfig, {
    global: importExportDialogGlobal,
    props: {}
  })

  await flushPromises()
  expect(w.find('.import-export-qdialog-inner').exists()).toBe(false)

  await w.setProps({ directInput: 'ImportExportProgramConfig' })
  await flushPromises()

  expect(w.find('.import-export-qdialog-inner').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogImportExportProgramConfig
 * S_DialogComponent UUID watch should open when dialogToOpen matches.
 */
test('Test that DialogImportExportProgramConfig opens from S_DialogComponent UUID watch', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_DialogComponent()

  const w = mount(DialogImportExportProgramConfig, {
    global: {
      ...importExportDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  store.dialogToOpen = 'ImportExportProgramConfig'
  store.generateDialogUUID()
  await flushPromises()

  expect(w.find('.import-export-qdialog-inner').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogImportExportProgramConfig
 * Export checklist view should appear after choosing export from the root actions.
 */
test('Test that DialogImportExportProgramConfig switches to the export checklist view', async () => {
  const w = mount(DialogImportExportProgramConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportProgramConfig' }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogImportExportProgramConfig-button-export"]').trigger('click')
  await flushPromises()

  expect(w.text()).toContain('dialogs.importExportProgramConfig.exportHint')
  expect(w.find('[data-test-locator="dialogImportExportProgramConfig-check-export-settings"]').exists()).toBe(true)

  w.unmount()
})

/**
 * DialogImportExportProgramConfig
 * Successful prepareImport should advance to the import selection checklist.
 */
test('Test that DialogImportExportProgramConfig shows import selection after prepareImport returns ready', async () => {
  const prepareImport = vi.fn(async (): Promise<I_faProgramConfigPrepareResult> => {
    return {
      outcome: 'ready',
      parts: {
        keybinds: 'ok',
        programSettings: 'ok',
        programStyling: 'ok'
      },
      sessionId: 'unit-import-session'
    }
  })
  window.faContentBridgeAPIs.faProgramConfig = {
    ...window.faContentBridgeAPIs.faProgramConfig,
    prepareImport
  }

  const w = mount(DialogImportExportProgramConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportProgramConfig' }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogImportExportProgramConfig-button-import"]').trigger('click')
  await flushPromises()

  expect(prepareImport).toHaveBeenCalledTimes(1)
  expect(w.text()).toContain('dialogs.importExportProgramConfig.importSelectHint')
  expect(w.find('[data-test-locator="dialogImportExportProgramConfig-check-import-settings"]').exists()).toBe(true)

  w.unmount()
})

/**
 * DialogImportExportProgramConfig
 * resolveDialogComponentStore should swallow S_DialogComponent failures after the stack guard captured a store.
 */
test('Test that DialogImportExportProgramConfig tolerates S_DialogComponent throwing from the resolve helper', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_DialogComponent()
  const orig = dialogStores.S_DialogComponent
  let calls = 0
  vi.spyOn(dialogStores, 'S_DialogComponent').mockImplementation(() => {
    calls += 1
    if (calls === 1) {
      return orig()
    }
    throw new Error('component dialog store unavailable')
  })

  const w = mount(DialogImportExportProgramConfig, {
    global: {
      ...importExportDialogGlobal,
      plugins: [pinia]
    },
    props: {}
  })

  await flushPromises()
  store.dialogToOpen = 'ImportExportProgramConfig'
  store.generateDialogUUID()
  await flushPromises()
  w.unmount()
})
