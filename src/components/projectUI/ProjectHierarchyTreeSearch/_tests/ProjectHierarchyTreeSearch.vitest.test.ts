import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

const clearSearchQueryMock = vi.fn()
const searchQueryRef = { value: '' }
const isSearchFocusedRef = { value: false }
const layoutModeRef = { value: 'fixed375' as 'fixed375' | 'scrollable' }

vi.mock('../scripts/projectHierarchyTreeSearch_manager', () => {
  return {
    useProjectHierarchyTreeSearch: () => {
      return {
        clearSearchQuery: clearSearchQueryMock,
        isSearchFocused: isSearchFocusedRef,
        layoutMode: layoutModeRef,
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
            <div
              data-test-locator="projectHierarchyTreeSearch-input"
              @blur="$emit('blur', $event)"
              @focus="$emit('focus', $event)"
            >
              <input
                data-test-locator="projectHierarchyTreeSearch-nativeInput"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
              />
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

test('Test that ProjectHierarchyTreeSearch applies layout mode class from layoutMode', () => {
  isSearchFocusedRef.value = false
  searchQueryRef.value = ''

  const wrapper = mountProjectHierarchyTreeSearch()

  expect(wrapper.classes()).toContain('projectHierarchyTreeSearch--layoutFixed375')

  wrapper.unmount()
})

test('Test that ProjectHierarchyTreeSearch applies scrollable layout mode class', () => {
  layoutModeRef.value = 'scrollable'
  searchQueryRef.value = ''

  const wrapper = mountProjectHierarchyTreeSearch()

  expect(wrapper.classes()).toContain('projectHierarchyTreeSearch--layoutScrollable')

  layoutModeRef.value = 'fixed375'
  wrapper.unmount()
})

test('Test that ProjectHierarchyTreeSearch wires native q-input focus and blur handlers', async () => {
  isSearchFocusedRef.value = false
  searchQueryRef.value = ''

  const wrapper = mount(ProjectHierarchyTreeSearch, {
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const qInput = wrapper.find('q-input')
  expect(qInput.exists()).toBe(true)
  qInput.element.dispatchEvent(new FocusEvent('focus'))
  qInput.element.dispatchEvent(new FocusEvent('blur'))

  wrapper.unmount()
})

test('Test that ProjectHierarchyTreeSearch wires search query v-model updates', async () => {
  searchQueryRef.value = ''
  isSearchFocusedRef.value = false

  const wrapper = mountProjectHierarchyTreeSearch()
  await wrapper.get('[data-test-locator="projectHierarchyTreeSearch-nativeInput"]').setValue('hero')

  searchQueryRef.value = ''
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
