import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, nextTick, reactive } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { registerDialogProjectSettingsWatchers } from '../dialogProjectSettings_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'

vi.mock('src/stores/S_Dialog', () => {
  return {
    S_DialogComponent: vi.fn()
  }
})

beforeEach(() => {
  vi.mocked(S_DialogComponent).mockReset()
})

/**
 * registerDialogProjectSettingsWatchers
 * Tolerates a missing Pinia dialog store when wiring store-driven opens.
 */
test('Test that registerDialogProjectSettingsWatchers tolerates a missing dialog store', async () => {
  vi.mocked(S_DialogComponent).mockImplementation(() => {
    throw new Error('no pinia')
  })

  const openDialog = vi.fn()

  registerDialogProjectSettingsWatchers({
    openDialog,
    props: {}
  })

  await nextTick()

  expect(openDialog).not.toHaveBeenCalled()
})

/**
 * registerDialogProjectSettingsWatchers
 * Opens ProjectSettings when the dialog store UUID changes for that dialog.
 */
test('Test that store dialogUUID change calls openDialog for ProjectSettings', async () => {
  const dialogStore = reactive({
    dialogToOpen: 'ProjectSettings',
    dialogUUID: 'uuid-1'
  })
  vi.mocked(S_DialogComponent).mockReturnValue(dialogStore as never)

  const openDialog = vi.fn()

  registerDialogProjectSettingsWatchers({
    openDialog,
    props: {}
  })

  dialogStore.dialogUUID = 'uuid-2'
  await nextTick()

  expect(openDialog).toHaveBeenCalledWith('ProjectSettings')
})

/**
 * registerDialogProjectSettingsWatchers
 * Ignores UUID bumps when another dialog is targeted.
 */
test('Test that store dialogUUID change does not open for other dialogs', async () => {
  const dialogStore = reactive({
    dialogToOpen: 'NewProject',
    dialogUUID: 'uuid-1'
  })
  vi.mocked(S_DialogComponent).mockReturnValue(dialogStore as never)

  const openDialog = vi.fn()

  registerDialogProjectSettingsWatchers({
    openDialog,
    props: {}
  })

  dialogStore.dialogUUID = 'uuid-2'
  await nextTick()

  expect(openDialog).not.toHaveBeenCalled()
})

/**
 * registerDialogProjectSettingsWatchers
 * directInput watcher opens when ProjectSettings is set on props after registration.
 */
test('Test that directInput watcher calls openDialog for ProjectSettings', async () => {
  const openDialog = vi.fn()
  const props = reactive<{ directInput?: 'ProjectSettings' }>({})

  registerDialogProjectSettingsWatchers({
    openDialog,
    props
  })

  props.directInput = 'ProjectSettings'
  await nextTick()

  expect(openDialog).toHaveBeenCalledWith('ProjectSettings')
})

/**
 * registerDialogProjectSettingsWatchers
 * onMounted opens immediately when directInput is already ProjectSettings.
 */
test('Test that onMounted calls openDialog when directInput is ProjectSettings at mount time', async () => {
  const openDialog = vi.fn()
  const props = reactive<{ directInput?: 'ProjectSettings' }>({
    directInput: 'ProjectSettings'
  })

  const Root = defineComponent({
    setup () {
      registerDialogProjectSettingsWatchers({
        openDialog,
        props
      })
      return () => null
    }
  })

  mount(Root)
  await flushPromises()

  expect(openDialog).toHaveBeenCalledWith('ProjectSettings')
})

/**
 * registerDialogProjectSettingsWatchers
 * Ignores directInput values that target other dialogs.
 */
test('Test that directInput watcher ignores non-ProjectSettings values', async () => {
  const openDialog = vi.fn()
  const props = reactive<{ directInput?: 'ProjectSettings' | 'NewProject' }>({})

  registerDialogProjectSettingsWatchers({
    openDialog,
    props
  })

  props.directInput = 'NewProject'
  await nextTick()

  expect(openDialog).not.toHaveBeenCalled()
})
