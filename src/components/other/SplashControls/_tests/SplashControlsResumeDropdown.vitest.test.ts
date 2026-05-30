/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock, openWelcomeScreenAutoLoadProjectMock } = vi.hoisted(() => {
  return {
    openWelcomeScreenAutoLoadProjectMock: vi.fn(async () => false),
    runFaActionMock: vi.fn()
  }
})

const resolveSplashResumeDropdownArrowElementMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: (...args: unknown[]) => runFaActionMock(...args),
    runFaActionAwait: vi.fn(async () => true)
  }
})

vi.mock('app/src/scripts/projectManagement/projectManagement_manager', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('app/src/scripts/projectManagement/projectManagement_manager')>()
  return {
    ...actual,
    openWelcomeScreenAutoLoadProject: openWelcomeScreenAutoLoadProjectMock
  }
})

vi.mock('app/src/components/other/SplashControls/scripts/functions/resolveSplashResumeDropdownArrowElement', () => {
  return {
    resolveSplashResumeDropdownArrowElement: resolveSplashResumeDropdownArrowElementMock
  }
})

import SplashControlsResumeDropdown from '../SplashControlsResumeDropdown.vue'

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
  openWelcomeScreenAutoLoadProjectMock.mockReset()
  openWelcomeScreenAutoLoadProjectMock.mockResolvedValue(false)

  const w = mount(SplashControlsResumeDropdown, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="splashPage-btn-resume-latest"]').trigger('click')

  expect(openWelcomeScreenAutoLoadProjectMock).toHaveBeenCalledOnce()
  w.unmount()
})

/**
 * SplashControlsResumeDropdown
 * Recent project rows dispatch loadExistingProject with the row path.
 */
test('Test that SplashControlsResumeDropdown recent row loads project by path', async () => {
  runFaActionMock.mockReset()
  const actionSpy = runFaActionMock

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

  runFaActionMock.mockReset()
  w.unmount()
})
