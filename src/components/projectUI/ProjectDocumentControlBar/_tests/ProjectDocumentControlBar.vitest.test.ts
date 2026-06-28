import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

const { showDocumentControlBarRef } = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    showDocumentControlBarRef: ref(true)
  }
})

vi.mock('../scripts/projectDocumentControlBar_manager', () => {
  return {
    useProjectDocumentControlBar: () => {
      return {
        showDocumentControlBar: showDocumentControlBarRef
      }
    }
  }
})

import ProjectDocumentControlBar from '../ProjectDocumentControlBar.vue'

test('Test that ProjectDocumentControlBar renders when showDocumentControlBar is true', () => {
  showDocumentControlBarRef.value = true
  const wrapper = mount(ProjectDocumentControlBar, {
    global: {
      stubs: {
        Teleport: true
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectDocumentControlBar"]').exists()).toBe(true)
  wrapper.unmount()
})

test('Test that ProjectDocumentControlBar is hidden when showDocumentControlBar is false', () => {
  showDocumentControlBarRef.value = false
  const wrapper = mount(ProjectDocumentControlBar, {
    global: {
      stubs: {
        Teleport: true
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectDocumentControlBar"]').exists()).toBe(false)
  wrapper.unmount()
})
