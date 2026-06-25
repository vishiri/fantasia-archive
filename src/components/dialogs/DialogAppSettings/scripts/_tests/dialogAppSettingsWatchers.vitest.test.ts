import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { registerDialogAppSettingsWatchers } from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettings_manager'
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent } from 'src/stores/S_Dialog'

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * registerDialogAppSettingsWatchers
 * Reacts to component dialog store UUID changes and opens AppSettings when the store requests it.
 */
test('store dialogUUID change calls openDialog for AppSettings', async () => {
  const dialogStore = S_DialogComponent()
  dialogStore.dialogToOpen = 'AppSettings'

  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const selectedCategoryTab = ref('')

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props: {},
    selectedCategoryTab
  })

  dialogStore.generateDialogUUID()
  await nextTick()

  expect(openDialog).toHaveBeenCalledWith('AppSettings')
})

/**
 * registerDialogAppSettingsWatchers
 * Ignores UUID bumps when the store is not targeting AppSettings.
 */
test('store dialogUUID change does not open when dialogToOpen is not AppSettings', async () => {
  const dialogStore = S_DialogComponent()
  dialogStore.dialogToOpen = 'AboutFantasiaArchive'

  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const selectedCategoryTab = ref('')

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props: {},
    selectedCategoryTab
  })

  dialogStore.generateDialogUUID()
  await nextTick()

  expect(openDialog).not.toHaveBeenCalled()
})

/**
 * registerDialogAppSettingsWatchers
 * directInput watcher opens when AppSettings is fed through reactive props after registration.
 */
test('directInput watcher calls openDialog when AppSettings is set on props', async () => {
  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: 'AppSettings' }>({})

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props,
    selectedCategoryTab
  })

  props.directInput = 'AppSettings'
  await nextTick()

  expect(openDialog).toHaveBeenCalledWith('AppSettings')
})

/**
 * registerDialogAppSettingsWatchers
 * onMounted opens immediately when directInput is already AppSettings (component-test stabilization path).
 */
test('onMounted calls openDialog when directInput is AppSettings at mount time', async () => {
  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: 'AppSettings' }>({
    directInput: 'AppSettings'
  })

  const Root = defineComponent({
    setup () {
      registerDialogAppSettingsWatchers({
        openDialog,
        appSettingsTree,
        props,
        selectedCategoryTab
      })
      return () => null
    }
  })

  mount(Root)
  await flushPromises()

  expect(openDialog).toHaveBeenCalledWith('AppSettings')
})

/**
 * registerDialogAppSettingsWatchers
 * directInput watcher ignores non-AppSettings dialog names after AppSettings was handled.
 */
test('directInput watcher does not call openDialog for a different dialog name', async () => {
  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: T_dialogName | undefined }>({})

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props,
    selectedCategoryTab
  })

  await nextTick()
  expect(openDialog).toHaveBeenCalledTimes(0)

  props.directInput = 'AppSettings'
  await nextTick()
  expect(openDialog).toHaveBeenCalledWith('AppSettings')
  expect(openDialog).toHaveBeenCalledTimes(1)

  props.directInput = 'AboutFantasiaArchive'
  await nextTick()

  expect(openDialog).toHaveBeenCalledTimes(1)
})

/**
 * registerDialogAppSettingsWatchers
 * directInput watcher skips empty string values without opening the dialog.
 */
test('directInput watcher ignores empty string directInput', async () => {
  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: T_dialogName | undefined }>({})

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props,
    selectedCategoryTab
  })

  props.directInput = 'AppSettings'
  await nextTick()
  expect(openDialog).toHaveBeenCalledTimes(1)

  props.directInput = ''
  await nextTick()
  expect(openDialog).toHaveBeenCalledTimes(1)
})

/**
 * registerDialogAppSettingsWatchers
 * Keeps selectedCategoryTab on the first tree key when the tree gains categories and the tab is unknown.
 */
test('appSettingsTree watch assigns first category when tab is missing from new keys', async () => {
  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const selectedCategoryTab = ref('ghost-tab')

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props: {},
    selectedCategoryTab
  })

  await nextTick()
  expect(selectedCategoryTab.value).toBe('')

  appSettingsTree.value = {
    alpha: {
      subCategories: {},
      title: 'A'
    },
    beta: {
      subCategories: {},
      title: 'B'
    }
  }
  await nextTick()
  expect(selectedCategoryTab.value).toBe('alpha')
})

/**
 * registerDialogAppSettingsWatchers
 * Resets selectedCategoryTab when the tree loses all categories.
 */
test('appSettingsTree watch clears tab when tree becomes empty', async () => {
  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({
    solo: {
      subCategories: {},
      title: 'S'
    }
  })
  const selectedCategoryTab = ref('solo')

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props: {},
    selectedCategoryTab
  })

  await nextTick()
  expect(selectedCategoryTab.value).toBe('solo')

  appSettingsTree.value = {}
  await nextTick()
  expect(selectedCategoryTab.value).toBe('')
})

/**
 * registerDialogAppSettingsWatchers
 * Leaves a valid selectedCategoryTab in place when the tree still contains that key.
 */
test('appSettingsTree watch keeps existing tab when it remains valid', async () => {
  const openDialog = vi.fn()
  const appSettingsTree = ref<T_appSettingsRenderTree>({
    keep: {
      subCategories: {},
      title: 'K'
    }
  })
  const selectedCategoryTab = ref('keep')

  registerDialogAppSettingsWatchers({
    openDialog,
    appSettingsTree,
    props: {},
    selectedCategoryTab
  })

  await nextTick()
  expect(selectedCategoryTab.value).toBe('keep')

  appSettingsTree.value = {
    ...appSettingsTree.value,
    other: {
      subCategories: {},
      title: 'O'
    }
  }
  await nextTick()
  expect(selectedCategoryTab.value).toBe('keep')
})
