import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

const clearSearchQueryMock = vi.fn()
const searchQueryRef = { value: '' }
const isSearchFocusedRef = { value: false }

vi.mock('../scripts/projectHierarchyTreeSearch_manager', () => {
  return {
    useProjectHierarchyTreeSearch: () => {
      return {
        clearSearchQuery: clearSearchQueryMock,
        isSearchFocused: isSearchFocusedRef,
        layoutMode: { value: 'fixed375' },
        searchQuery: searchQueryRef,
        searchWrapperStyle: { value: { width: '375px' } }
      }
    }
  }
})

import ProjectHierarchyTreeSearch from '../ProjectHierarchyTreeSearch.vue'

function mountProjectHierarchyTreeSearch () {
  return mount(ProjectHierarchyTreeSearch, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QInput: {
          emits: ['blur', 'focus', 'update:modelValue'],
          props: ['modelValue', 'label'],
          template: `
            <div data-test-locator="projectHierarchyTreeSearch-input">
              <span data-test-locator="projectHierarchyTreeSearch-label">{{ label }}</span>
              <slot v-if="modelValue !== ''" name="prepend" />
              <slot name="append" />
            </div>
          `
        },
        QIcon: {
          template: '<button data-test-locator="projectHierarchyTreeSearch-clear" @click="$emit(\'click\')" />'
        }
      }
    }
  })
}

test('Test that ProjectHierarchyTreeSearch renders the search input label', () => {
  const wrapper = mountProjectHierarchyTreeSearch()

  expect(wrapper.find('[data-test-locator="projectHierarchyTreeSearch"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTreeSearch-label"]').text()).toBe(
    'projectUI.projectHierarchyTreeSearch.label'
  )
  wrapper.unmount()
})

test('Test that ProjectHierarchyTreeSearch shows a clear icon when the query is non-empty', async () => {
  searchQueryRef.value = 'alpha'

  const wrapper = mountProjectHierarchyTreeSearch()

  const clearButton = wrapper.find('[data-test-locator="projectHierarchyTreeSearch-clear"]')
  expect(clearButton.exists()).toBe(true)
  await clearButton.trigger('click')
  expect(clearSearchQueryMock).toHaveBeenCalled()
  searchQueryRef.value = ''
  wrapper.unmount()
})
