import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

const { worldListItemsRef } = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    worldListItemsRef: ref([
      {
        displayName: 'Alpha',
        id: 'world-a'
      },
      {
        displayName: 'Beta',
        id: 'world-b'
      }
    ])
  }
})

vi.mock('../scripts/projectWorkspaceWorldList_manager', () => {
  return {
    useProjectWorkspaceWorldList: () => {
      return {
        worldListItems: worldListItemsRef
      }
    }
  }
})

import ProjectWorkspaceWorldList from '../ProjectWorkspaceWorldList.vue'

test('Test that ProjectWorkspaceWorldList renders world names in store order', () => {
  worldListItemsRef.value = [
    {
      displayName: 'Alpha',
      id: 'world-a'
    },
    {
      displayName: 'Beta',
      id: 'world-b'
    }
  ]

  const wrapper = mount(ProjectWorkspaceWorldList)

  const items = wrapper.findAll('[data-test-locator="projectWorkspaceWorldList-item"]')
  expect(items).toHaveLength(2)
  expect(items[0]!.text()).toBe('Alpha')
  expect(items[1]!.text()).toBe('Beta')
  expect(items[0]!.attributes('data-test-world-id')).toBe('world-a')
  wrapper.unmount()
})

test('Test that ProjectWorkspaceWorldList hides the list when there are no worlds', () => {
  worldListItemsRef.value = []

  const wrapper = mount(ProjectWorkspaceWorldList)

  expect(wrapper.find('[data-test-locator="projectWorkspaceWorldList"]').exists()).toBe(false)
  wrapper.unmount()
})
