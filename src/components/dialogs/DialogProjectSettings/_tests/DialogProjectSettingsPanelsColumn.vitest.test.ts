import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsPanelsColumn from '../DialogProjectSettingsPanelsColumn.vue'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from '../scripts/dialogProjectSettingsConstants'

/**
 * DialogProjectSettingsPanelsColumn
 * Forwards project name updates from the general settings panel.
 */
test('Test that DialogProjectSettingsPanelsColumn forwards project name updates', async () => {
  const w = mount(DialogProjectSettingsPanelsColumn, {
    props: {
      projectName: 'Panel name',
      selectedCategoryTab: FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
    },
    global: {
      stubs: {
        DialogProjectSettingsGeneralPanel: {
          props: ['projectName'],
          emits: ['update:projectName'],
          template: '<button type="button" @click="$emit(\'update:projectName\', \'Updated\')" />'
        },
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.find('button').trigger('click')

  expect(w.emitted('update:projectName')?.[0]).toEqual(['Updated'])
})
