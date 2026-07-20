import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectAppControlBarTabContextMenuOpenWiring } from '../projectAppControlBarTabContextMenuOpenWiring'

test('Test that createProjectAppControlBarTabContextMenuOpenWiring opens menu from tab contextmenu capture', async () => {
  const Harness = defineComponent({
    setup () {
      const tabContextMenuMountRef = ref<HTMLElement | null>(null)
      const wiring = createProjectAppControlBarTabContextMenuOpenWiring({
        tabContextMenuMountRef
      })

      return {
        tabContextMenuMountRef,
        ...wiring
      }
    },
    template: `
      <div class="projectAppControlBarTabs__tab">
        <div ref="tabContextMenuMountRef" />
      </div>
    `
  })

  const wrapper = mount(Harness)
  await flushPromises()

  const tabWrapper = wrapper.find('.projectAppControlBarTabs__tab')
  expect(tabWrapper.exists()).toBe(true)
  expect(wrapper.vm.tabMenuTargetElement).toBe(tabWrapper.element)

  tabWrapper.element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
  expect(wrapper.vm.isTabContextMenuOpen).toBe(true)

  wrapper.unmount()
})
