import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import * as faActionRun from 'app/src/scripts/actionManager/faActionManagerRun'

import SplashControls from '../SplashControls.vue'

/**
 * SplashControls
 * New project wires to openNewProjectDialog.
 */
test('Test that splash New project triggers openNewProjectDialog', async () => {
  const spy = vi.spyOn(faActionRun, 'runFaAction').mockImplementation(() => undefined)
  const w = mount(SplashControls, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })
  await w.get('[data-test-locator="splashPage-btn-new"]').trigger('click')
  expect(spy).toHaveBeenCalledWith('openNewProjectDialog', undefined)
  spy.mockRestore()
  w.unmount()
})

/**
 * SplashControls
 * Load project wires to loadExistingProject.
 */
test('Test that splash Load project triggers loadExistingProject', async () => {
  const spy = vi.spyOn(faActionRun, 'runFaAction').mockImplementation(() => undefined)
  const w = mount(SplashControls, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })
  await w.get('[data-test-locator="splashPage-btn-load"]').trigger('click')
  expect(spy).toHaveBeenCalledWith('loadExistingProject', {})
  spy.mockRestore()
  w.unmount()
})

/**
 * SplashControls
 * Welcome line, title row with wings, and primary splash actions.
 */
test('Test that SplashControls exposes splash title row and primary action locators', () => {
  const w = mount(SplashControls, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.get('[data-test-locator="splashPage-title"]').text()).toBe('splashPage.title')
  expect(w.find('[data-test-locator="splashPage-btn-resume"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-new"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-load"]').exists()).toBe(true)

  w.unmount()
})
