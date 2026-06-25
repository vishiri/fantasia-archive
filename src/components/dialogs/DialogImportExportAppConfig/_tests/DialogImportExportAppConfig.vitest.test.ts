/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faAppConfigPrepareResult } from 'app/types/I_faAppConfigDomain'

import * as dialogStores from 'app/src/stores/S_Dialog'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

const { runFaActionAwaitMock, runFaActionMock } = vi.hoisted(() => ({
  runFaActionAwaitMock: vi.fn(async (): Promise<boolean> => true),
  runFaActionMock: vi.fn(async (): Promise<void> => {})
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaAction: runFaActionMock,
  runFaActionAwait: runFaActionAwaitMock
}))

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

import DialogImportExportAppConfig from '../DialogImportExportAppConfig.vue'

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

const importExportQCheckboxStub = defineComponent({
  name: 'QCheckbox',
  inheritAttrs: true,
  props: {
    modelValue: {
      default: false,
      type: Boolean
    }
  },
  emits: ['update:modelValue'],
  template:
    '<button type="button" class="q-checkbox-stub" v-bind="$attrs" @click="$emit(\'update:modelValue\', !modelValue)" />'
})

const importExportQStepperStub = defineComponent({
  name: 'QStepper',
  inheritAttrs: true,
  props: {
    modelValue: {
      default: 'root',
      type: String
    }
  },
  emits: ['update:modelValue'],
  template: `
    <div class="import-export-qstepper-stub">
      <button
        type="button"
        class="import-export-qstepper-emit-import"
        @click="$emit('update:modelValue', 'import')"
      />
      <slot />
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
    QCheckbox: importExportQCheckboxStub,
    QDialog: importExportQDialogStub,
    QItem: { template: '<div class="q-item-stub"><slot /></div>' },
    QItemLabel: { template: '<div class="q-item-label-stub"><slot /></div>' },
    QItemSection: { template: '<div class="q-item-section-stub"><slot /></div>' },
    QList: { template: '<div class="q-list-stub"><slot /></div>' },
    QSeparator: { template: '<div class="q-separator-stub" role="separator" />' },
    QStep: { template: '<div class="q-step-stub"><slot /></div>' },
    QStepper: importExportQStepperStub
  }
} as const

beforeEach(() => {
  runFaActionMock.mockReset()
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
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
  const prevAppConfig = window.faContentBridgeAPIs.faAppConfig
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
  window.faContentBridgeAPIs.faAppConfig = prevAppConfig
})

/**
 * DialogImportExportAppConfig
 * Toggling export checklist checkboxes exercises v-model bindings on the export step.
 */
test('Test that DialogImportExportAppConfig export step checkboxes emit model updates', async () => {
  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportAppConfig' }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogImportExportAppConfig-button-export"]').trigger('click')
  await flushPromises()

  const locators = [
    'dialogImportExportAppConfig-check-export-settings',
    'dialogImportExportAppConfig-check-export-keybinds',
    'dialogImportExportAppConfig-check-export-styling',
    'dialogImportExportAppConfig-check-export-noteboard'
  ] as const

  for (const loc of locators) {
    const cells = w.findAll(`[data-test-locator="${loc}"]`)
    expect(cells[0]!?.exists()).toBe(true)
    await cells[0]!.trigger('click')
    await flushPromises()
    expect(cells[1]!?.exists()).toBe(true)
    await cells[1]!.trigger('click')
    await flushPromises()
  }

  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * Successful export to file should notify, invoke close, and clear the dialog shell.
 */
test('Test that DialogImportExportAppConfig create export success closes the dialog', async () => {
  runFaActionAwaitMock.mockResolvedValueOnce(true)

  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportAppConfig' }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogImportExportAppConfig-button-export"]').trigger('click')
  await flushPromises()

  await w.get('[data-test-locator="dialogImportExportAppConfig-button-createExport"]').trigger('click')
  await flushPromises()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('exportAppConfigPackage', expect.objectContaining({
    includeKeybinds: expect.any(Boolean),
    includeAppNoteboard: expect.any(Boolean),
    includeAppSettings: expect.any(Boolean),
    includeAppStyling: expect.any(Boolean)
  }))
  expect(w.find('.import-export-qdialog-inner').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * Successful import apply should notify and close the dialog when the apply action succeeds.
 */
test('Test that DialogImportExportAppConfig import selected success closes the dialog', async () => {
  const prepareImport = vi.fn(async (): Promise<I_faAppConfigPrepareResult> => {
    return {
      outcome: 'ready',
      parts: {
        keybinds: 'ok',
        appNoteboard: 'ok',
        appSettings: 'ok',
        appStyling: 'ok'
      },
      sessionId: 'unit-import-session-apply'
    }
  })
  const prevAppConfig = window.faContentBridgeAPIs.faAppConfig
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

  const importLocators = [
    'dialogImportExportAppConfig-check-import-settings',
    'dialogImportExportAppConfig-check-import-keybinds',
    'dialogImportExportAppConfig-check-import-styling',
    'dialogImportExportAppConfig-check-import-noteboard'
  ] as const

  for (const loc of importLocators) {
    const cells = w.findAll(`[data-test-locator="${loc}"]`)
    expect(cells[0]!?.exists()).toBe(true)
    await cells[0]!.trigger('click')
    await flushPromises()
    expect(cells[1]!?.exists()).toBe(true)
    await cells[1]!.trigger('click')
    await flushPromises()
  }

  await w.get('[data-test-locator="dialogImportExportAppConfig-button-importSelected"]').trigger('click')
  await flushPromises()

  expect(runFaActionAwaitMock).toHaveBeenCalled()
  expect(w.find('.import-export-qdialog-inner').exists()).toBe(false)
  w.unmount()
  window.faContentBridgeAPIs.faAppConfig = prevAppConfig
})

/**
 * DialogImportExportAppConfig
 * QStepper v-model should respond to update:modelValue from the stepper shell.
 */
test('Test that DialogImportExportAppConfig QStepper stub honours update:modelValue', async () => {
  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportAppConfig' }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogImportExportAppConfig-button-export"]').trigger('click')
  await flushPromises()

  const stepper = w.findComponent({ name: 'QStepper' })
  expect(stepper.exists()).toBe(true)
  await stepper.get('.import-export-qstepper-emit-import').trigger('click')
  await flushPromises()

  w.unmount()
})

/**
 * DialogImportExportAppConfig
 * QDialog v-model should respond to update:modelValue false from the dialog shell.
 */
test('Test that DialogImportExportAppConfig QDialog stub honours update:modelValue false', async () => {
  const w = mount(DialogImportExportAppConfig, {
    global: importExportDialogGlobal,
    props: { directInput: 'ImportExportAppConfig' }
  })

  await flushPromises()
  const dlg = w.findComponent({ name: 'QDialog' })
  expect(dlg.exists()).toBe(true)
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()

  expect(w.find('.import-export-qdialog-inner').exists()).toBe(false)
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
  const spy = vi.spyOn(dialogStores, 'S_DialogComponent').mockImplementation(() => {
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
  spy.mockRestore()
  w.unmount()
})
