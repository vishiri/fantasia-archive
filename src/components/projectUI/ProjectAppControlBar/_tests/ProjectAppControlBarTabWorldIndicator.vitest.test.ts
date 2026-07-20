import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ProjectAppControlBarTabWorldIndicator from '../ProjectAppControlBarTabWorldIndicator.vue'

const qIconStub = defineComponent({
  name: 'QIcon',
  inheritAttrs: true,
  props: {
    name: {
      type: String,
      default: ''
    },
    style: {
      type: Object,
      default: undefined
    }
  },
  template: '<i class="q-icon-stub" v-bind="$attrs" :data-icon-name="name" />'
})

const mountGlobal = {
  stubs: {
    QIcon: qIconStub
  }
}

/**
 * ProjectAppControlBarTabWorldIndicator
 * Renders world globe icon when visible and color are both set.
 */
test('Test that ProjectAppControlBarTabWorldIndicator renders colored globe when visible', () => {
  const wrapper = mount(ProjectAppControlBarTabWorldIndicator, {
    props: {
      color: '#ff00ff',
      documentId: 'doc-1',
      visible: true
    },
    global: mountGlobal
  })

  const icon = wrapper.findComponent({ name: 'QIcon' })
  expect(icon.exists()).toBe(true)
  expect(icon.props('name')).toBe('mdi-earth')
  expect(icon.props('style')).toEqual({ color: '#ff00ff' })
  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabWorldIndicator-doc-1"]').exists()).toBe(true)

  wrapper.unmount()
})

/**
 * ProjectAppControlBarTabWorldIndicator
 * Hides globe when color is null or visibility is off.
 */
test('Test that ProjectAppControlBarTabWorldIndicator hides globe without color or visibility', () => {
  const hiddenWithoutColor = mount(ProjectAppControlBarTabWorldIndicator, {
    props: {
      color: null,
      documentId: 'doc-1',
      visible: true
    },
    global: mountGlobal
  })
  expect(hiddenWithoutColor.find('[data-test-locator="projectAppControlBar-tabWorldIndicator-doc-1"]').exists()).toBe(false)
  hiddenWithoutColor.unmount()

  const hiddenWhenInvisible = mount(ProjectAppControlBarTabWorldIndicator, {
    props: {
      color: '#ff00ff',
      documentId: 'doc-2',
      visible: false
    },
    global: mountGlobal
  })
  expect(hiddenWhenInvisible.find('[data-test-locator="projectAppControlBar-tabWorldIndicator-doc-2"]').exists()).toBe(false)
  hiddenWhenInvisible.unmount()
})

test('Test that ProjectAppControlBarTabWorldIndicator accepts custom indicator class', () => {
  const wrapper = mount(ProjectAppControlBarTabWorldIndicator, {
    props: {
      color: '#ff00ff',
      documentId: 'doc-3',
      indicatorClass: 'projectAppControlBarTabContextMenu__browseTabWorldIndicator',
      visible: true
    },
    global: mountGlobal
  })

  expect(wrapper.find('.projectAppControlBarTabContextMenu__browseTabWorldIndicator').exists()).toBe(true)

  wrapper.unmount()
})
