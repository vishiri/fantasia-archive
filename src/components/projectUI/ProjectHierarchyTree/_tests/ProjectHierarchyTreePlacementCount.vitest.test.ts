/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test } from 'vitest'

import ProjectHierarchyTreePlacementCount from '../ProjectHierarchyTreePlacementCount.vue'

const placementCountI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          placementCountTooltip: {
            categoryCount: 'Category count:',
            documentCount: 'Document count:',
            totalCount: 'Document & categories count:'
          }
        }
      }
    }
  }
})

test('Test that ProjectHierarchyTreePlacementCount renders visible segments and divider', () => {
  const wrapper = mount(ProjectHierarchyTreePlacementCount, {
    global: {
      plugins: [placementCountI18n],
      stubs: {
        QTooltip: true
      }
    },
    props: {
      categoryCount: 2,
      display: {
        segments: [
          {
            kind: 'document',
            value: 3
          },
          {
            kind: 'category',
            value: 2
          }
        ],
        showDivider: true,
        shows: true
      },
      documentCount: 3,
      testLocator: 'projectHierarchyTree-placementCount-test'
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-placementCount-test"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-placementCount-test"]').text()).toBe('(3 | 2)')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-placementCount-test-document"]').text()).toBe('3')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-placementCount-test-category"]').text()).toBe('2')
  expect(wrapper.find('.projectHierarchyTreePlacementCount__divider').exists()).toBe(true)
})

test('Test that ProjectHierarchyTreePlacementCount renders tooltip labels', () => {
  const wrapper = mount(ProjectHierarchyTreePlacementCount, {
    global: {
      plugins: [placementCountI18n],
      stubs: {
        QTooltip: {
          template: '<div><slot /></div>'
        }
      }
    },
    props: {
      categoryCount: 2,
      display: {
        segments: [
          {
            kind: 'document',
            value: 3
          },
          {
            kind: 'category',
            value: 2
          }
        ],
        showDivider: true,
        shows: true
      },
      documentCount: 3,
      testLocator: 'projectHierarchyTree-placementCount-test'
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-placementCountTooltip"]').exists()).toBe(true)
})

test('Test that ProjectHierarchyTreePlacementCount hides when display.shows is false', () => {
  const wrapper = mount(ProjectHierarchyTreePlacementCount, {
    global: {
      plugins: [placementCountI18n],
      stubs: {
        QTooltip: true
      }
    },
    props: {
      categoryCount: 0,
      display: {
        segments: [],
        showDivider: false,
        shows: false
      },
      documentCount: 0
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-placementCount"]').exists()).toBe(false)
})
