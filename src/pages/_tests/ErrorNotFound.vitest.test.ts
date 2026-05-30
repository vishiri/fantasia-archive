import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { expect, test } from 'vitest'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import ErrorNotFound from '../ErrorNotFound/ErrorNotFound.vue'

/**
 * ErrorNotFound
 * Fullscreen route wires ErrorCard with title and details, matching ErrorCard markup: errorCard-title, mascot, then errorCard-details.
 */
test('Test that ErrorNotFound renders ErrorCard title hook, details block, and error mascot', () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const w = mount(ErrorNotFound, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [pinia]
    }
  })

  expect(w.find('[data-test-locator="errorNotFoundPage"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="errorCard"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="errorCard"]').attributes('data-test-error-card-width')).toBe('600')

  const titleEl = w.get('[data-test-locator="errorCard-title"]')
  expect(titleEl.text()).toBe('errorNotFound.title')

  const detailsEl = w.get('[data-test-locator="errorCard-details"]')
  expect(detailsEl.text()).toContain('errorNotFound.subTitleFirst')
  expect(detailsEl.text()).toContain('errorNotFound.subTitleSecond')

  expect(w.get('[data-test-locator="fantasiaMascotImage-image"]').attributes('data-test-image')).toBe(
    'error'
  )

  expect(w.find('[data-test-locator="errorNotFound-btn-resume-current"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="errorNotFound-btn-return-to-start"]').exists()).toBe(true)

  w.unmount()
})

/**
 * Resume current project appears when a session file path is loaded.
 */
test('Test that ErrorNotFound shows resume current project when session is active', () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  S_FaActiveProject().$patch({
    activeProject: {
      filePath: 'C:\\Projects\\demo.faproject',
      id: 'project-uuid-1',
      name: 'Demo project'
    }
  })

  const w = mount(ErrorNotFound, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      plugins: [pinia]
    }
  })

  const resumeBtn = w.find('[data-test-locator="errorNotFound-btn-resume-current"]')
  expect(resumeBtn.exists()).toBe(true)
  expect(resumeBtn.classes()).toContain('q-mt-xl')

  w.unmount()
})
