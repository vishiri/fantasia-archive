import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, reactive } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { registerDialogProjectSettingsWatchers } from '../dialogProjectSettings_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * registerDialogProjectSettingsWatchers
 * Opens ProjectSettings when the dialog store UUID changes for that dialog.
 */
test('Test that store dialogUUID change calls openDialog for ProjectSettings', async () => {
  const dialogStore = S_DialogComponent()
  dialogStore.dialogToOpen = 'ProjectSettings'

  const openDialog = vi.fn()

  registerDialogProjectSettingsWatchers({
    openDialog,
    props: {}
  })

  dialogStore.generateDialogUUID()
  await nextTick()

  expect(openDialog).toHaveBeenCalledWith('ProjectSettings')
})

/**
 * registerDialogProjectSettingsWatchers
 * Ignores UUID bumps when another dialog is targeted.
 */
test('Test that store dialogUUID change does not open for other dialogs', async () => {
  const dialogStore = S_DialogComponent()
  dialogStore.dialogToOpen = 'NewProject'

  const openDialog = vi.fn()

  registerDialogProjectSettingsWatchers({
    openDialog,
    props: {}
  })

  dialogStore.generateDialogUUID()
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
