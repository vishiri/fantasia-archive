/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

import * as faActionRun from 'app/src/scripts/actionManager/faActionManagerRun'
import * as faWelcomeScreenAutoLoad from 'app/src/scripts/projectManagement/faWelcomeScreenAutoLoadProject'

import SplashControlsResumeDropdown from '../SplashControlsResumeDropdown.vue'

const resolveSplashResumeDropdownArrowElementMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/components/other/SplashControls/scripts/resolveSplashResumeDropdownArrowElement', () => {
  return {
    resolveSplashResumeDropdownArrowElement: resolveSplashResumeDropdownArrowElementMock
  }
})

beforeEach(() => {
  setActivePinia(createPinia())
  resolveSplashResumeDropdownArrowElementMock.mockReturnValue(null)
  window.faContentBridgeAPIs.projectManagement.getRecentProjects = vi.fn(async () => {
    return [
      {
        filePath: '/newest.faproject',
        name: 'Newest'
      }
    ]
  })
})

/**
 * SplashControlsResumeDropdown
 * Renders the resume split button when recent projects exist after refresh.
 */
test('Test that SplashControlsResumeDropdown shows resume control when recent projects exist', async () => {
  const w = mount(SplashControlsResumeDropdown, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="splashPage-btn-resume-latest"]').exists()).toBe(true)
  w.unmount()
})

/**
 * SplashControlsResumeDropdown
 * Primary segment triggers welcome auto-load when no active session is open.
 */
test('Test that SplashControlsResumeDropdown primary segment calls welcome auto-load', async () => {
  const autoLoadSpy = vi.spyOn(
    faWelcomeScreenAutoLoad,
    'openWelcomeScreenAutoLoadProject'
  ).mockResolvedValue(false)

  const w = mount(SplashControlsResumeDropdown, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="splashPage-btn-resume-latest"]').trigger('click')

  expect(autoLoadSpy).toHaveBeenCalledOnce()

  autoLoadSpy.mockRestore()
  w.unmount()
})

/**
 * SplashControlsResumeDropdown
 * Recent project rows dispatch loadExistingProject with the row path.
 */
test('Test that SplashControlsResumeDropdown recent row loads project by path', async () => {
  const actionSpy = vi.spyOn(faActionRun, 'runFaAction').mockImplementation(() => undefined)

  const w = mount(SplashControlsResumeDropdown, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="splashPage-recentProject-0"]').trigger('click')

  expect(actionSpy).toHaveBeenCalledWith('loadExistingProject', { filePath: '/newest.faproject' })

  actionSpy.mockRestore()
  w.unmount()
})
