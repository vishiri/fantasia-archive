import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectHierarchyTreeNodeContextMenuCopyRows from '../ProjectHierarchyTreeNodeContextMenuCopyRows.vue'

test('Test that ProjectHierarchyTreeNodeContextMenuCopyRows delegates copy row clicks', async () => {
  const onCopyBackgroundColorClick = vi.fn()
  const onCopyNameClick = vi.fn()
  const onCopyTextColorClick = vi.fn()

  const wrapper = mount(ProjectHierarchyTreeNodeContextMenuCopyRows, {
    props: {
      copyBackgroundColorLabel: 'Copy background color',
      copyNameLabel: 'Copy name',
      copyTextColorLabel: 'Copy text color',
      onCopyBackgroundColorClick,
      onCopyNameClick,
      onCopyTextColorClick
    },
    global: {
      stubs: {
        QIcon: { template: '<span />' },
        QItem: {
          emits: ['click'],
          template: '<div @click="$emit(\'click\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' },
        QSeparator: { template: '<hr />' }
      }
    }
  })

  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyName"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyTextColor"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyBackgroundColor"]').trigger('click')

  expect(onCopyNameClick).toHaveBeenCalled()
  expect(onCopyTextColorClick).toHaveBeenCalled()
  expect(onCopyBackgroundColorClick).toHaveBeenCalled()

  wrapper.unmount()
})
