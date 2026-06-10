import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldsPanel from '../DialogProjectSettingsWorldsPanel.vue'

/**
 * DialogProjectSettingsWorldsPanel
 * Renders the Project's Worlds panel title.
 */
test('Test that DialogProjectSettingsWorldsPanel renders the worlds panel title', () => {
  const w = mount(DialogProjectSettingsWorldsPanel, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-panel-worlds-title"]').text()).toContain(
    'dialogs.projectSettings.panels.worlds.title'
  )
})
