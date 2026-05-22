import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { expect, test, vi } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { i18n } from 'app/i18n/externalFileLoader'
import * as faActionRun from 'app/src/scripts/actionManager/faActionManagerRun'
import * as faWelcomeScreenAutoLoad from 'app/src/scripts/projectManagement/faWelcomeScreenAutoLoadProject'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import SplashControls from '../SplashControls.vue'
import SplashControlsResumeDropdown from '../SplashControlsResumeDropdown.vue'

const resolveSplashResumeDropdownArrowElementMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/components/other/SplashControls/scripts/resolveSplashResumeDropdownArrowElement', () => {
  return {
    resolveSplashResumeDropdownArrowElement: resolveSplashResumeDropdownArrowElementMock
  }
})

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

  const actionSpy = vi.spyOn(faActionRun, 'runFaAction').mockImplementation(() => undefined)
  const autoLoadSpy = vi.spyOn(
    faWelcomeScreenAutoLoad,
    'openWelcomeScreenAutoLoadProject'
  ).mockResolvedValue(false)

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
  expect(autoLoadSpy).toHaveBeenCalledOnce()
  expect(actionSpy).not.toHaveBeenCalledWith('loadExistingProject', {
    filePath: '/newest.faproject',
    resumeActiveSession: true
  })

  actionSpy.mockClear()

  await w.get('[data-test-locator="splashPage-recentProject-1"]').trigger('click')
  expect(actionSpy).toHaveBeenCalledWith('loadExistingProject', { filePath: '/older.faproject' })

  actionSpy.mockRestore()
  autoLoadSpy.mockRestore()
  w.unmount()
})

/**
 * SplashControls
 * Primary resume segment label and path follow the active session when one is loaded.
 */
test('Test that resume primary segment shows Resume Current Project and opens active path', async () => {
  window.faContentBridgeAPIs.projectManagement.getRecentProjects = vi.fn(async () => {
    return [
      {
        filePath: '/newest.faproject',
        name: 'Newest'
      }
    ]
  })

  const tSpy = vi.spyOn(i18n.global, 't')
  const actionSpy = vi.spyOn(faActionRun, 'runFaAction').mockImplementation(() => undefined)

  const w = mount(SplashControlsResumeDropdown, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  S_FaActiveProject().setActiveProject({
    filePath: '/active-session.faproject',
    id: 'id-active',
    name: 'Active Session'
  })

  await flushPromises()

  expect(tSpy.mock.calls.some(([key]) => key === 'splashPage.resumeCurrentProject')).toBe(true)

  await w.get('[data-test-locator="splashPage-btn-resume-latest"]').trigger('click')
  expect(actionSpy).toHaveBeenCalledWith('loadExistingProject', {
    filePath: '/active-session.faproject',
    resumeActiveSession: true
  })

  tSpy.mockRestore()

  actionSpy.mockRestore()
  S_FaActiveProject().clearActiveProject()
  w.unmount()
})

function buildResumeDropdownArrowStub (): HTMLElement {
  const arrow = document.createElement('span')
  arrow.className = 'q-btn-dropdown__arrow-container'
  arrow.setAttribute('data-test-tooltip-text', 'splashPage.browseLatestProjects')
  return arrow
}

function mountResumeDropdownWithSettings (
  settings: I_faUserSettings | null
): ReturnType<typeof mount> {
  resolveSplashResumeDropdownArrowElementMock.mockImplementation(() => {
    return buildResumeDropdownArrowStub()
  })

  const pinia = createPinia()
  setActivePinia(pinia)
  S_FaUserSettings().settings = settings

  window.faContentBridgeAPIs.projectManagement.getRecentProjects = vi.fn(async () => {
    return [
      {
        filePath: '/newest.faproject',
        name: 'Newest'
      }
    ]
  })

  return mount(SplashControlsResumeDropdown, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key: string) => key
      }
    }
  })
}

/**
 * SplashControlsResumeDropdown
 * hideRecentProjectTooltip from S_FaUserSettings removes the browse-latest QTooltip.
 */
test('Test that hideRecentProjectTooltip hides resume dropdown caret tooltip', async () => {
  resolveSplashResumeDropdownArrowElementMock.mockClear()

  const w = mountResumeDropdownWithSettings({
    ...FA_USER_SETTINGS_DEFAULTS,
    hideRecentProjectTooltip: true
  })

  await flushPromises()
  await nextTick()
  await flushPromises()

  expect(w.findComponent({ name: 'QTooltip' }).exists()).toBe(false)
  expect(resolveSplashResumeDropdownArrowElementMock).not.toHaveBeenCalled()

  w.unmount()
})

/**
 * SplashControlsResumeDropdown
 * Turning hideRecentProjectTooltip off again restores the browse-latest tooltip node.
 */
test('Test that hideRecentProjectTooltip off restores resume dropdown caret tooltip', async () => {
  resolveSplashResumeDropdownArrowElementMock.mockClear()

  const w = mountResumeDropdownWithSettings({
    ...FA_USER_SETTINGS_DEFAULTS,
    hideRecentProjectTooltip: true
  })

  await flushPromises()
  await nextTick()
  await flushPromises()
  expect(w.findComponent({ name: 'QTooltip' }).exists()).toBe(false)

  resolveSplashResumeDropdownArrowElementMock.mockClear()

  S_FaUserSettings().settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    hideRecentProjectTooltip: false
  }
  await flushPromises()
  await nextTick()
  await flushPromises()

  expect(resolveSplashResumeDropdownArrowElementMock).toHaveBeenCalled()

  w.unmount()
})

/**
 * SplashControlsResumeDropdown
 * Locale changes re-resolve the browse-latest caret tooltip target.
 */
test('Test that locale change re-resolves resume dropdown caret tooltip target', async () => {
  resolveSplashResumeDropdownArrowElementMock.mockClear()

  const w = mountResumeDropdownWithSettings({
    ...FA_USER_SETTINGS_DEFAULTS,
    hideRecentProjectTooltip: false
  })

  await flushPromises()
  await nextTick()
  await flushPromises()
  resolveSplashResumeDropdownArrowElementMock.mockClear()

  i18n.global.locale.value = 'fr'
  await flushPromises()
  await nextTick()
  await flushPromises()

  expect(resolveSplashResumeDropdownArrowElementMock).toHaveBeenCalled()

  i18n.global.locale.value = 'en-US'
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
