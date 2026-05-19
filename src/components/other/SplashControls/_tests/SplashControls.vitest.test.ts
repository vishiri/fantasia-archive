import { mount, flushPromises } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import * as faActionRun from 'app/src/scripts/actionManager/faActionManagerRun'

import SplashControls from '../SplashControls.vue'

/**
 * SplashControls
 * Create new project wires to openNewProjectDialog.
 */
test('Test that splash Create new project triggers openNewProjectDialog', async () => {
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
 * Load existing project wires to loadExistingProject.
 */
test('Test that splash Load existing project triggers loadExistingProject', async () => {
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
 * Resume latest hides until MRU refresh returns rows.
 */
test('Test that resume-latest split stays absent without recent projects', async () => {
  const w = mount(SplashControls, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="splashPage-btn-resume-latest"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="splashPage-btn-new"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-load"]').exists()).toBe(true)

  w.unmount()
})

/**
 * SplashControls
 * Resume-latest main segment loads the newest MRU path; dropdown rows reuse paths.
 */
test('Test that resume-latest split loads MRU paths via faActionManager', async () => {
  window.faContentBridgeAPIs.projectManagement.getRecentProjects = vi.fn(async () => {
    return [
      {
        filePath: '/newest.faproject',
        name: 'Newest'
      },
      {
        filePath: '/older.faproject',
        name: 'Older'
      }
    ]
  })

  const spy = vi.spyOn(faActionRun, 'runFaAction').mockImplementation(() => undefined)

  const w = mount(SplashControls, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="splashPage-btn-resume-latest"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-recentProject-0"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-recentProject-1"]').exists()).toBe(true)

  await w.get('[data-test-locator="splashPage-btn-resume-latest"]').trigger('click')
  expect(spy).toHaveBeenCalledWith('loadExistingProject', { filePath: '/newest.faproject' })

  spy.mockClear()

  await w.get('[data-test-locator="splashPage-recentProject-1"]').trigger('click')
  expect(spy).toHaveBeenCalledWith('loadExistingProject', { filePath: '/older.faproject' })

  spy.mockRestore()
  w.unmount()
})

/**
 * SplashControls
 * Welcome line, title row with wings, and primary splash actions.
 */
test('Test that SplashControls exposes splash title row and primary action locators', async () => {
  const w = mount(SplashControls, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()

  expect(w.get('[data-test-locator="splashPage-title"]').text()).toBe('splashPage.title')
  expect(w.find('[data-test-locator="splashPage-btn-new"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="splashPage-btn-load"]').exists()).toBe(true)

  w.unmount()
})
