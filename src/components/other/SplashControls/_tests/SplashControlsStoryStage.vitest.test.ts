/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

import SplashControlsStoryStage from './SplashControlsStoryStage.vue'

beforeEach(() => {
  setActivePinia(createPinia())
  window.faContentBridgeAPIs.projectManagement.getRecentProjects = vi.fn(async () => {
    return []
  })
})

/**
 * SplashControlsStoryStage
 * Storybook harness wrapper mounts SplashControls inside the stage shell.
 */
test('Test that SplashControlsStoryStage renders the stage shell and SplashControls', async () => {
  const w = mount(SplashControlsStoryStage, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()

  expect(w.find('.splashControlsStoryStage').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-new"]').exists()).toBe(true)
  w.unmount()
})
