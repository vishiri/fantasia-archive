import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectDocumentControlBarTabContextMenuOpenWiring } from '../projectDocumentControlBarTabContextMenuOpenWiring'

test('Test that createProjectDocumentControlBarTabContextMenuOpenWiring opens menu from tab contextmenu capture', async () => {
  const Harness = defineComponent({
    setup () {
      const tabContextMenuMountRef = ref<HTMLElement | null>(null)
      const wiring = createProjectDocumentControlBarTabContextMenuOpenWiring({
        tabContextMenuMountRef
      })

      return {
        tabContextMenuMountRef,
        ...wiring
      }
    },
    template: `
      <div class="projectDocumentControlBarTabs__tab">
        <div ref="tabContextMenuMountRef" />
      </div>
    `
  })

  const wrapper = mount(Harness)
  await flushPromises()

  const tabWrapper = wrapper.find('.projectDocumentControlBarTabs__tab')
  expect(tabWrapper.exists()).toBe(true)
  expect(wrapper.vm.tabMenuTargetElement).toBe(tabWrapper.element)

  tabWrapper.element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
  expect(wrapper.vm.isTabContextMenuOpen).toBe(true)

  wrapper.unmount()
})
