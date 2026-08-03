import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectAppControlBarTabContextMenuCopyRows from '../ProjectAppControlBarTabContextMenuCopyRows.vue'

test('Test that ProjectAppControlBarTabContextMenuCopyRows delegates copy row clicks', async () => {
  const onCopyBackgroundColorClick = vi.fn()
  const onCopyNameClick = vi.fn()
  const onCopyTextColorClick = vi.fn()

  const wrapper = mount(ProjectAppControlBarTabContextMenuCopyRows, {
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

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyName"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyTextColor"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyBackgroundColor"]').trigger('click')

  expect(onCopyNameClick).toHaveBeenCalled()
  expect(onCopyTextColorClick).toHaveBeenCalled()
  expect(onCopyBackgroundColorClick).toHaveBeenCalled()

  wrapper.unmount()
})
