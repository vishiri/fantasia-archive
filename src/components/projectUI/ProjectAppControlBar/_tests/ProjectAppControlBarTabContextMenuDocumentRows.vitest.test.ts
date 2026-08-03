import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectAppControlBarTabContextMenuDocumentRows from '../ProjectAppControlBarTabContextMenuDocumentRows.vue'

test('Test that ProjectAppControlBarTabContextMenuDocumentRows delegates document row clicks', async () => {
  const onAddNewDocumentUnderThisClick = vi.fn()
  const onCopyDocumentClick = vi.fn()

  const wrapper = mount(ProjectAppControlBarTabContextMenuDocumentRows, {
    props: {
      addNewDocumentUnderThisLabel: 'Add new document under this',
      copyDocumentLabel: 'Copy document',
      onAddNewDocumentUnderThisClick,
      onCopyDocumentClick
    },
    global: {
      stubs: {
        QIcon: { template: '<span />' },
        QItem: {
          emits: ['click'],
          template: '<div @click="$emit(\'click\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' },
        QSeparator: {
          inheritAttrs: false,
          template: '<hr v-bind="$attrs" />'
        }
      }
    }
  })

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyDocument"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-addNewDocumentUnderThis"]').trigger('click')

  const copyDocument = wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyDocument"]')
  expect(copyDocument.element.previousElementSibling?.classList.contains('projectAppControlBarTabContextMenu__separatorPrimaryBright')).toBe(true)

  expect(onCopyDocumentClick).toHaveBeenCalled()
  expect(onAddNewDocumentUnderThisClick).toHaveBeenCalled()

  wrapper.unmount()
})
