import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ProjectDocumentControlBarTabWorldIndicator from '../ProjectDocumentControlBarTabWorldIndicator.vue'

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
 * ProjectDocumentControlBarTabWorldIndicator
 * Renders world globe icon when visible and color are both set.
 */
test('Test that ProjectDocumentControlBarTabWorldIndicator renders colored globe when visible', () => {
  const wrapper = mount(ProjectDocumentControlBarTabWorldIndicator, {
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
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabWorldIndicator-doc-1"]').exists()).toBe(true)

  wrapper.unmount()
})

/**
 * ProjectDocumentControlBarTabWorldIndicator
 * Hides globe when color is null or visibility is off.
 */
test('Test that ProjectDocumentControlBarTabWorldIndicator hides globe without color or visibility', () => {
  const hiddenWithoutColor = mount(ProjectDocumentControlBarTabWorldIndicator, {
    props: {
      color: null,
      documentId: 'doc-1',
      visible: true
    },
    global: mountGlobal
  })
  expect(hiddenWithoutColor.find('[data-test-locator="projectDocumentControlBar-tabWorldIndicator-doc-1"]').exists()).toBe(false)
  hiddenWithoutColor.unmount()

  const hiddenWhenInvisible = mount(ProjectDocumentControlBarTabWorldIndicator, {
    props: {
      color: '#ff00ff',
      documentId: 'doc-2',
      visible: false
    },
    global: mountGlobal
  })
  expect(hiddenWhenInvisible.find('[data-test-locator="projectDocumentControlBar-tabWorldIndicator-doc-2"]').exists()).toBe(false)
  hiddenWhenInvisible.unmount()
})

test('Test that ProjectDocumentControlBarTabWorldIndicator accepts custom indicator class', () => {
  const wrapper = mount(ProjectDocumentControlBarTabWorldIndicator, {
    props: {
      color: '#ff00ff',
      documentId: 'doc-3',
      indicatorClass: 'projectDocumentControlBarTabContextMenu__browseTabWorldIndicator',
      visible: true
    },
    global: mountGlobal
  })

  expect(wrapper.find('.projectDocumentControlBarTabContextMenu__browseTabWorldIndicator').exists()).toBe(true)

  wrapper.unmount()
})
