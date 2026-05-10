import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faAppConfigPrepareResult } from 'app/types/I_faAppConfigDomain'

import * as dialogStores from 'app/src/stores/S_Dialog'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import DialogImportExportAppConfig from '../DialogImportExportAppConfig.vue'

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
 * DialogImportExportAppConfig
 * directInput should open the dialog shell for ImportExportAppConfig.
 */
test('Test that DialogImportExportAppConfig opens from directInput on mount', async () => {
  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportAppConfig' }
  })

  await flushPromises()

  expect(w.find('.import-export-qdialog-inner').exists()).toBe(true)
  expect(w.text()).toContain('dialogs.importExportAppConfig.title')
  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * directInput watch should open when the prop is set after mount.
 */
test('Test that DialogImportExportAppConfig opens when directInput becomes ImportExportAppConfig', async () => {
  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: {}
  })

  await flushPromises()
  expect(w.find('.import-export-qdialog-inner').exists()).toBe(false)

  await w.setProps({ directInput: 'ImportExportAppConfig' })
  await flushPromises()

  expect(w.find('.import-export-qdialog-inner').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * S_DialogComponent UUID watch should open when dialogToOpen matches.
 */
test('Test that DialogImportExportAppConfig opens from S_DialogComponent UUID watch', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_DialogComponent()

  const w = mount(DialogImportExportAppConfig, {
    global: {
      ...importExportDialogGlobal,
      plugins: [pinia]
    }
  })

  await flushPromises()

  store.dialogToOpen = 'ImportExportAppConfig'
  store.generateDialogUUID()
  await flushPromises()

  expect(w.find('.import-export-qdialog-inner').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * Export checklist view should appear after choosing export from the root actions.
 */
test('Test that DialogImportExportAppConfig switches to the export checklist view', async () => {
  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportAppConfig' }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogImportExportAppConfig-button-export"]').trigger('click')
  await flushPromises()

  expect(w.text()).toContain('dialogs.importExportAppConfig.exportHint')
  expect(w.find('[data-test-locator="dialogImportExportAppConfig-check-export-settings"]').exists()).toBe(true)

  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * Successful prepareImport should advance to the import selection checklist.
 */
test('Test that DialogImportExportAppConfig shows import selection after prepareImport returns ready', async () => {
  const prepareImport = vi.fn(async (): Promise<I_faAppConfigPrepareResult> => {
    return {
      outcome: 'ready',
      parts: {
        keybinds: 'ok',
        appNoteboard: 'ok',
        appSettings: 'ok',
        appStyling: 'ok'
      },
      sessionId: 'unit-import-session'
    }
  })
  window.faContentBridgeAPIs.faAppConfig = {
    ...window.faContentBridgeAPIs.faAppConfig,
    prepareImport
  }

  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportAppConfig' }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogImportExportAppConfig-button-import"]').trigger('click')
  await flushPromises()

  expect(prepareImport).toHaveBeenCalledTimes(1)
  expect(w.text()).toContain('dialogs.importExportAppConfig.importSelectHint')
  expect(w.find('[data-test-locator="dialogImportExportAppConfig-check-import-settings"]').exists()).toBe(true)

  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * resolveDialogComponentStore should swallow S_DialogComponent failures after the stack guard captured a store.
 */
test('Test that DialogImportExportAppConfig tolerates S_DialogComponent throwing from the resolve helper', async () => {
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

  const w = mount(DialogImportExportAppConfig, {
    global: {
      ...importExportDialogGlobal,
      plugins: [pinia]
    },
    props: {}
  })

  await flushPromises()
  store.dialogToOpen = 'ImportExportAppConfig'
  store.generateDialogUUID()
  await flushPromises()
  w.unmount()
})
