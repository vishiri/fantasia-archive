import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectHierarchyTreeNodeContextMenuDeleteRow from '../ProjectHierarchyTreeNodeContextMenuDeleteRow.vue'

test('Test that ProjectHierarchyTreeNodeContextMenuDeleteRow delegates delete click', async () => {
  const onDeleteDocumentClick = vi.fn()

  const wrapper = mount(ProjectHierarchyTreeNodeContextMenuDeleteRow, {
    props: {
      deleteDocumentLabel: 'Delete document',
      onDeleteDocumentClick
    },
    global: {
      stubs: {
        QIcon: { template: '<span />' },
        QItem: {
          emits: ['click'],
          template: '<div @click="$emit(\'click\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' }
      }
    }
  })

  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-deleteDocument"]').trigger('click')

  expect(onDeleteDocumentClick).toHaveBeenCalled()

  wrapper.unmount()
})
