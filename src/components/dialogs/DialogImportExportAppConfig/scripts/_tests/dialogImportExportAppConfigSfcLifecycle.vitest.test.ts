/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harnesses for composable tests */
import { defineComponent, nextTick, reactive, ref, toRef } from 'vue'
import type { Pinia } from 'pinia'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { beforeEach, expect, test, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const S_DialogComponentMock = vi.fn()

vi.mock('app/src/stores/S_Dialog', () => {
  return {
    S_DialogComponent: S_DialogComponentMock
  }
})

const registerComponentDialogStackGuardMock = vi.fn()

vi.mock('app/src/scripts/appGlobalManagementUI/dialogManagement', () => {
  return {
    registerComponentDialogStackGuard: registerComponentDialogStackGuardMock
  }
})

let pinia: Pinia

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
  S_DialogComponentMock.mockReset()
  registerComponentDialogStackGuardMock.mockReset()
})

test('useDialogImportExportAppConfigLifecycle opens from directInput prop', async () => {
  S_DialogComponentMock.mockImplementation(() => ({
    dialogToOpen: 'AboutFantasiaArchive',
    dialogUUID: ''
  }))

  const { useDialogImportExportAppConfigLifecycle } = await import(
    '../dialogImportExportAppConfigSfcLifecycle'
  )

  const Wrapper = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'ImportExportAppConfig' | undefined
      }
    },
    setup (props) {
      const dialogModel = ref(false)
      const directInput = toRef(props, 'directInputProp')
      useDialogImportExportAppConfigLifecycle({
        dialogModel,
        directInput
      })
      return {
        dialogModel
      }
    },
    template: '<span />'
  })

  const wrapper = mount(Wrapper, {
    props: { directInputProp: undefined },
    global: { plugins: [pinia] }
  })

  await wrapper.setProps({ directInputProp: 'ImportExportAppConfig' })
  await nextTick()
  expect(wrapper.vm.dialogModel).toBe(true)
})

test('useDialogImportExportAppConfigLifecycle opens on mount when directInput is already set', async () => {
  S_DialogComponentMock.mockImplementation(() => ({
    dialogToOpen: 'AboutFantasiaArchive',
    dialogUUID: ''
  }))

  const { useDialogImportExportAppConfigLifecycle } = await import(
    '../dialogImportExportAppConfigSfcLifecycle'
  )

  const Wrapper = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'ImportExportAppConfig' | undefined
      }
    },
    setup (props) {
      const dialogModel = ref(false)
      const directInput = toRef(props, 'directInputProp')
      useDialogImportExportAppConfigLifecycle({
        dialogModel,
        directInput
      })
      return {
        dialogModel
      }
    },
    template: '<span />'
  })

  const wrapper = mount(Wrapper, {
    props: { directInputProp: 'ImportExportAppConfig' },
    global: { plugins: [pinia] }
  })
  await nextTick()
  expect(wrapper.vm.dialogModel).toBe(true)
})

test('useDialogImportExportAppConfigLifecycle opens when the dialog store requests ImportExportAppConfig', async () => {
  const storeState = reactive({
    dialogToOpen: 'ImportExportAppConfig' as const,
    dialogUUID: 'a'
  })
  S_DialogComponentMock.mockImplementation(() => storeState)

  const { useDialogImportExportAppConfigLifecycle } = await import(
    '../dialogImportExportAppConfigSfcLifecycle'
  )

  const Wrapper = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'ImportExportAppConfig' | undefined
      }
    },
    setup (props) {
      const dialogModel = ref(false)
      const directInput = toRef(props, 'directInputProp')
      useDialogImportExportAppConfigLifecycle({
        dialogModel,
        directInput
      })
      return {
        dialogModel
      }
    },
    template: '<span />'
  })

  const wrapper = mount(Wrapper, {
    props: { directInputProp: undefined },
    global: { plugins: [pinia] }
  })
  storeState.dialogUUID = 'b'
  await nextTick()
  expect(wrapper.vm.dialogModel).toBe(true)
})

test('useDialogImportExportAppConfigLifecycle does not open for other dialog targets', async () => {
  const storeState = reactive({
    dialogToOpen: 'AppSettings' as const,
    dialogUUID: 'a'
  })
  S_DialogComponentMock.mockImplementation(() => storeState)

  const { useDialogImportExportAppConfigLifecycle } = await import(
    '../dialogImportExportAppConfigSfcLifecycle'
  )

  const Wrapper = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => 'ImportExportAppConfig' | undefined
      }
    },
    setup (props) {
      const dialogModel = ref(false)
      const directInput = toRef(props, 'directInputProp')
      useDialogImportExportAppConfigLifecycle({
        dialogModel,
        directInput
      })
      return {
        dialogModel
      }
    },
    template: '<span />'
  })

  const wrapper = mount(Wrapper, {
    props: { directInputProp: undefined },
    global: { plugins: [pinia] }
  })
  storeState.dialogUUID = 'b'
  await nextTick()
  expect(wrapper.vm.dialogModel).toBe(false)
})

test('useDialogImportExportAppConfigLifecycle keeps the dialog closed when directInput never targets ImportExportAppConfig', async () => {
  S_DialogComponentMock.mockImplementation(() => ({
    dialogToOpen: 'AboutFantasiaArchive',
    dialogUUID: ''
  }))

  const { useDialogImportExportAppConfigLifecycle } = await import(
    '../dialogImportExportAppConfigSfcLifecycle'
  )

  const Wrapper = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => T_dialogName | undefined
      }
    },
    setup (props) {
      const dialogModel = ref(false)
      const directInput = toRef(props, 'directInputProp')
      useDialogImportExportAppConfigLifecycle({
        dialogModel,
        directInput
      })
      return {
        dialogModel
      }
    },
    template: '<span />'
  })

  const wrapper = mount(Wrapper, {
    props: { directInputProp: 'AppSettings' },
    global: { plugins: [pinia] }
  })
  await nextTick()
  expect(wrapper.vm.dialogModel).toBe(false)

  await wrapper.setProps({ directInputProp: 'KeybindSettings' })
  await nextTick()
  expect(wrapper.vm.dialogModel).toBe(false)
})

test('useDialogImportExportAppConfigLifecycle ignores store flips that yield no resolvable Pinia dialog slice', async () => {
  const storeState = reactive({
    dialogToOpen: 'AppSettings' as const,
    dialogUUID: 'a',
    shouldThrow: false
  })
  S_DialogComponentMock.mockImplementation(() => {
    if (storeState.shouldThrow) {
      throw new Error('store unavailable')
    }
    return storeState
  })

  const { useDialogImportExportAppConfigLifecycle } = await import(
    '../dialogImportExportAppConfigSfcLifecycle'
  )

  const Wrapper = defineComponent({
    props: {
      directInputProp: {
        default: undefined,
        type: String as () => T_dialogName | undefined
      }
    },
    setup (props) {
      const dialogModel = ref(false)
      const directInput = toRef(props, 'directInputProp')
      useDialogImportExportAppConfigLifecycle({
        dialogModel,
        directInput
      })
      return {
        dialogModel
      }
    },
    template: '<span />'
  })

  mount(Wrapper, {
    props: { directInputProp: undefined },
    global: { plugins: [pinia] }
  })

  storeState.dialogUUID = 'b'
  await nextTick()
  storeState.shouldThrow = true
  storeState.dialogUUID = 'c'
  await nextTick()
})
