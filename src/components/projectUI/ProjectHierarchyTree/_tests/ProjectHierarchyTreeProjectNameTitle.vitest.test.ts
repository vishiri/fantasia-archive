import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ProjectHierarchyTreeProjectNameTitle from '../ProjectHierarchyTreeProjectNameTitle.vue'

/**
 * ProjectHierarchyTreeProjectNameTitle
 * Renders the project display name in the hierarchy tree header.
 */
test('Test that ProjectHierarchyTreeProjectNameTitle renders project display name', () => {
  const wrapper = mount(ProjectHierarchyTreeProjectNameTitle, {
    props: {
      projectDisplayName: 'Storybook Sample Project'
    }
  })

  const title = wrapper.get('[data-test-locator="projectHierarchyTree-projectName"]')
  expect(title.text()).toBe('Storybook Sample Project')
  expect(title.classes()).toContain('projectHierarchyTree__projectName')

  wrapper.unmount()
})
