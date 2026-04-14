import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { registerDialogProgramSettingsWatchers } from 'app/src/components/dialogs/DialogProgramSettings/scripts/dialogProgramSettingsDialogStore'
import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'
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
