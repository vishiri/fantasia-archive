/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import ProjectHierarchyTreeOpenIcon from '../ProjectHierarchyTreeOpenIcon.vue'

const QIconStub = defineComponent({
  name: 'QIconStub',
  props: {
    name: {
      required: true,
      type: String
    }
  },
  setup (props, { attrs }) {
    return () => h('i', {
      class: attrs.class,
      'data-test-locator': 'projectHierarchyTree-openIcon',
      'data-test-name': props.name
    })
  }
})

test('Test that ProjectHierarchyTreeOpenIcon defers open class when pending expand animation', async () => {
  const rafQueue: FrameRequestCallback[] = []
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    rafQueue.push(callback)
    return rafQueue.length
  })
  const wrapper = mount(ProjectHierarchyTreeOpenIcon, {
    global: {
      stubs: {
        QIcon: QIconStub
      }
    },
    props: {
      expanded: true,
      pendingExpandAnimation: true
    }
  })
  await nextTick()
  expect(rafQueue).toHaveLength(1)
  expect(wrapper.get('[data-test-locator="projectHierarchyTree-openIcon"]').classes()).not.toContain(
    'projectHierarchyTree__openIcon--open'
  )
  rafQueue[0]?.(performance.now())
  await nextTick()
  expect(rafQueue).toHaveLength(2)
  rafQueue[1]?.(performance.now())
  await nextTick()
  expect(wrapper.get('[data-test-locator="projectHierarchyTree-openIcon"]').classes()).toContain(
    'projectHierarchyTree__openIcon--open'
  )
  wrapper.unmount()
  vi.restoreAllMocks()
})

test('Test that ProjectHierarchyTreeOpenIcon applies open class immediately when not pending animation', async () => {
  const wrapper = mount(ProjectHierarchyTreeOpenIcon, {
    global: {
      stubs: {
        QIcon: QIconStub
      }
    },
    props: {
      expanded: true,
      pendingExpandAnimation: false
    }
  })
  await nextTick()
  expect(wrapper.get('[data-test-locator="projectHierarchyTree-openIcon"]').classes()).toContain(
    'projectHierarchyTree__openIcon--open'
  )
  wrapper.unmount()
})

test('Test that ProjectHierarchyTreeOpenIcon cancels pending frames on collapse and unmount', async () => {
  const rafQueue: FrameRequestCallback[] = []
  const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
    rafQueue.push(callback)
    return rafQueue.length
  })
  const wrapper = mount(ProjectHierarchyTreeOpenIcon, {
    global: {
      stubs: {
        QIcon: QIconStub
      }
    },
    props: {
      expanded: true,
      pendingExpandAnimation: true
    }
  })
  await nextTick()
  expect(rafQueue).toHaveLength(1)
  await wrapper.setProps({
    expanded: false,
    pendingExpandAnimation: false
  })
  await nextTick()
  expect(cancelSpy).toHaveBeenCalled()
  expect(wrapper.get('[data-test-locator="projectHierarchyTree-openIcon"]').classes()).not.toContain(
    'projectHierarchyTree__openIcon--open'
  )
  await wrapper.setProps({
    expanded: true,
    pendingExpandAnimation: true
  })
  await nextTick()
  wrapper.unmount()
  expect(cancelSpy).toHaveBeenCalled()
  vi.restoreAllMocks()
})

test('Test that ProjectHierarchyTreeOpenIcon emits click and pointerdown', async () => {
  const wrapper = mount(ProjectHierarchyTreeOpenIcon, {
    global: {
      stubs: {
        QIcon: QIconStub
      }
    },
    props: {
      expanded: false,
      pendingExpandAnimation: false
    }
  })
  await wrapper.get('[data-test-locator="projectHierarchyTree-openIcon"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-openIcon"]').trigger('pointerdown')
  expect(wrapper.emitted('click')).toHaveLength(1)
  expect(wrapper.emitted('pointerdown')).toHaveLength(1)
  wrapper.unmount()
})
