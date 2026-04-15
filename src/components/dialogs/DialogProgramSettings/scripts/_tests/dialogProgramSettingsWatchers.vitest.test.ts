import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { registerDialogProgramSettingsWatchers } from 'app/src/components/dialogs/DialogProgramSettings/scripts/dialogProgramSettingsDialogStore'
import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent } from 'src/stores/S_Dialog'

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * registerDialogProgramSettingsWatchers
 * Reacts to component dialog store UUID changes and opens ProgramSettings when the store requests it.
 */
test('store dialogUUID change calls openDialog for ProgramSettings', async () => {
  const dialogStore = S_DialogComponent()
  dialogStore.dialogToOpen = 'ProgramSettings'

  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const selectedCategoryTab = ref('')

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props: {},
    selectedCategoryTab
  })

  dialogStore.generateDialogUUID()
  await nextTick()

  expect(openDialog).toHaveBeenCalledWith('ProgramSettings')
})

/**
 * registerDialogProgramSettingsWatchers
 * Ignores UUID bumps when the store is not targeting ProgramSettings.
 */
test('store dialogUUID change does not open when dialogToOpen is not ProgramSettings', async () => {
  const dialogStore = S_DialogComponent()
  dialogStore.dialogToOpen = 'AboutFantasiaArchive'

  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const selectedCategoryTab = ref('')

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props: {},
    selectedCategoryTab
  })

  dialogStore.generateDialogUUID()
  await nextTick()

  expect(openDialog).not.toHaveBeenCalled()
})

/**
 * registerDialogProgramSettingsWatchers
 * directInput watcher opens when ProgramSettings is fed through reactive props after registration.
 */
test('directInput watcher calls openDialog when ProgramSettings is set on props', async () => {
  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: 'ProgramSettings' }>({})

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props,
    selectedCategoryTab
  })

  props.directInput = 'ProgramSettings'
  await nextTick()

  expect(openDialog).toHaveBeenCalledWith('ProgramSettings')
})

/**
 * registerDialogProgramSettingsWatchers
 * onMounted opens immediately when directInput is already ProgramSettings (component-test stabilization path).
 */
test('onMounted calls openDialog when directInput is ProgramSettings at mount time', async () => {
  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: 'ProgramSettings' }>({
    directInput: 'ProgramSettings'
  })

  const Root = defineComponent({
    setup () {
      registerDialogProgramSettingsWatchers({
        openDialog,
        programSettingsTree,
        props,
        selectedCategoryTab
      })
      return () => null
    }
  })

  mount(Root)
  await flushPromises()

  expect(openDialog).toHaveBeenCalledWith('ProgramSettings')
})

/**
 * registerDialogProgramSettingsWatchers
 * directInput watcher ignores non-ProgramSettings dialog names after ProgramSettings was handled.
 */
test('directInput watcher does not call openDialog for a different dialog name', async () => {
  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: T_dialogName }>({})

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props,
    selectedCategoryTab
  })

  await nextTick()
  expect(openDialog).toHaveBeenCalledTimes(0)

  props.directInput = 'ProgramSettings'
  await nextTick()
  expect(openDialog).toHaveBeenCalledWith('ProgramSettings')
  expect(openDialog).toHaveBeenCalledTimes(1)

  props.directInput = 'AboutFantasiaArchive'
  await nextTick()

  expect(openDialog).toHaveBeenCalledTimes(1)
})

/**
 * registerDialogProgramSettingsWatchers
 * directInput watcher skips empty string values without opening the dialog.
 */
test('directInput watcher ignores empty string directInput', async () => {
  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const selectedCategoryTab = ref('')
  const props = reactive<{ directInput?: T_dialogName }>({})

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props,
    selectedCategoryTab
  })

  props.directInput = 'ProgramSettings'
  await nextTick()
  expect(openDialog).toHaveBeenCalledTimes(1)

  props.directInput = ''
  await nextTick()
  expect(openDialog).toHaveBeenCalledTimes(1)
})

/**
 * registerDialogProgramSettingsWatchers
 * Keeps selectedCategoryTab on the first tree key when the tree gains categories and the tab is unknown.
 */
test('programSettingsTree watch assigns first category when tab is missing from new keys', async () => {
  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const selectedCategoryTab = ref('ghost-tab')

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props: {},
    selectedCategoryTab
  })

  await nextTick()
  expect(selectedCategoryTab.value).toBe('')

  programSettingsTree.value = {
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
 * registerDialogProgramSettingsWatchers
 * Resets selectedCategoryTab when the tree loses all categories.
 */
test('programSettingsTree watch clears tab when tree becomes empty', async () => {
  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({
    solo: {
      subCategories: {},
      title: 'S'
    }
  })
  const selectedCategoryTab = ref('solo')

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props: {},
    selectedCategoryTab
  })

  await nextTick()
  expect(selectedCategoryTab.value).toBe('solo')

  programSettingsTree.value = {}
  await nextTick()
  expect(selectedCategoryTab.value).toBe('')
})

/**
 * registerDialogProgramSettingsWatchers
 * Leaves a valid selectedCategoryTab in place when the tree still contains that key.
 */
test('programSettingsTree watch keeps existing tab when it remains valid', async () => {
  const openDialog = vi.fn()
  const programSettingsTree = ref<T_programSettingsRenderTree>({
    keep: {
      subCategories: {},
      title: 'K'
    }
  })
  const selectedCategoryTab = ref('keep')

  registerDialogProgramSettingsWatchers({
    openDialog,
    programSettingsTree,
    props: {},
    selectedCategoryTab
  })

  await nextTick()
  expect(selectedCategoryTab.value).toBe('keep')

  programSettingsTree.value = {
    ...programSettingsTree.value,
    other: {
      subCategories: {},
      title: 'O'
    }
  }
  await nextTick()
  expect(selectedCategoryTab.value).toBe('keep')
})
