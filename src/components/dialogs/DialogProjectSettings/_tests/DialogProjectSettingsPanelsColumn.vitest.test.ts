import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsPanelsColumn from '../DialogProjectSettingsPanelsColumn.vue'
import {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB
} from '../scripts/functions/dialogProjectSettingsDialogInput'

/**
 * DialogProjectSettingsPanelsColumn
 * Forwards project name updates from the general settings panel.
 */
test('Test that DialogProjectSettingsPanelsColumn forwards project name updates', async () => {
  const w = mount(DialogProjectSettingsPanelsColumn, {
    props: {
      projectName: 'Panel name',
      projectNameHasError: false,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
      worlds: null
    },
    global: {
      stubs: {
        DialogProjectSettingsGeneralPanel: {
          props: ['projectName'],
          emits: ['update:projectName'],
          template: '<button type="button" @click="$emit(\'update:projectName\', \'Updated\')" />'
        },
        DialogProjectSettingsWorldsPanel: true,
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.find('button').trigger('click')

  expect(w.emitted('update:projectName')?.[0]).toEqual(['Updated'])
})

/**
 * DialogProjectSettingsPanelsColumn
 * Renders the worlds settings panel when the worlds tab is selected.
 */
test('Test that DialogProjectSettingsPanelsColumn renders the worlds settings panel', () => {
  const w = mount(DialogProjectSettingsPanelsColumn, {
    props: {
      projectName: 'Panel name',
      projectNameHasError: false,
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB,
      worlds: []
    },
    global: {
      stubs: {
        DialogProjectSettingsGeneralPanel: true,
        DialogProjectSettingsWorldsPanel: {
          template: '<div data-test-locator="dialogProjectSettings-worlds-panel-stub" />'
        },
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-panel-stub"]').exists()).toBe(true)
})
