/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test, vi } from 'vitest'

import ProjectHierarchyTreeDocumentButtonGroup from '../ProjectHierarchyTreeDocumentButtonGroup.vue'

const projectHierarchyTreeDocumentButtonGroupI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          contextMenu: {
            addNewDocumentUnderThis: 'Add new document under this',
            editDocument: 'Edit document',
            openDocument: 'Open document'
          }
        }
      }
    }
  }
})

function mountDocumentButtonGroup (
  props: {
    showsAddUnder?: boolean
    showsEdit?: boolean
    showsOpen?: boolean
  } = {}
) {
  return mount(ProjectHierarchyTreeDocumentButtonGroup, {
    global: {
      plugins: [projectHierarchyTreeDocumentButtonGroupI18n],
      stubs: {
        QTooltip: {
          template: '<span><slot /></span>'
        }
      }
    },
    props: {
      showsAddUnder: props.showsAddUnder ?? true,
      showsEdit: props.showsEdit ?? true,
      showsOpen: props.showsOpen ?? true
    }
  })
}

/**
 * ProjectHierarchyTreeDocumentButtonGroup
 * Renders one button per visibility flag in Open, Edit, Add under order.
 */
test('Test that ProjectHierarchyTreeDocumentButtonGroup renders visible buttons only', () => {
  const wrapper = mountDocumentButtonGroup({
    showsAddUnder: false,
    showsEdit: true,
    showsOpen: true
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-documentButton-open"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-documentButton-edit"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-documentButton-addUnder"]').exists()).toBe(false)
})

/**
 * ProjectHierarchyTreeDocumentButtonGroup
 * Button activation emits the matching action event.
 */
test('Test that ProjectHierarchyTreeDocumentButtonGroup emits action events from button clicks', async () => {
  const wrapper = mountDocumentButtonGroup()
  const locators = ['open', 'edit', 'addUnder'] as const

  for (const locator of locators) {
    const button = wrapper.get(`[data-test-locator="projectHierarchyTree-documentButton-${locator}"]`)
    await button.trigger('click')
    await button.trigger('contextmenu')
    button.element.dispatchEvent(new MouseEvent('auxclick', {
      bubbles: true,
      button: 1
    }))
  }

  expect(wrapper.emitted('openActivate')).toHaveLength(3)
  expect(wrapper.emitted('editActivate')).toHaveLength(3)
  expect(wrapper.emitted('addUnderActivate')).toHaveLength(3)
})

/**
 * ProjectHierarchyTreeDocumentButtonGroup
 * Button pointer handlers stop row interaction before tree row handlers run.
 */
test('Test that ProjectHierarchyTreeDocumentButtonGroup stops row pointer events on buttons', async () => {
  const rowPointerDown = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeDocumentButtonGroup, {
    attachTo: document.body,
    global: {
      plugins: [projectHierarchyTreeDocumentButtonGroupI18n],
      stubs: {
        QTooltip: {
          template: '<span><slot /></span>'
        }
      }
    },
    props: {
      showsAddUnder: true,
      showsEdit: true,
      showsOpen: true
    }
  })

  const host = document.createElement('div')
  host.addEventListener('pointerdown', rowPointerDown)
  document.body.appendChild(host)
  host.appendChild(wrapper.element)

  await wrapper.get('[data-test-locator="projectHierarchyTree-documentButton-open"]').trigger('pointerdown')
  await wrapper.get('[data-test-locator="projectHierarchyTree-documentButton-edit"]').trigger('pointerdown')
  await wrapper.get('[data-test-locator="projectHierarchyTree-documentButton-addUnder"]').trigger('pointerdown')
  expect(wrapper.emitted('openActivate')).toBeUndefined()

  await wrapper.get('[data-test-locator="projectHierarchyTree-documentButton-open"]').trigger('contextmenu')
  expect(wrapper.emitted('openActivate')).toHaveLength(1)
  await wrapper.get('[data-test-locator="projectHierarchyTree-documentButton-edit"]').trigger('contextmenu')
  expect(wrapper.emitted('editActivate')).toHaveLength(1)
  await wrapper.get('[data-test-locator="projectHierarchyTree-documentButton-addUnder"]').trigger('contextmenu')
  expect(wrapper.emitted('addUnderActivate')).toHaveLength(1)
  expect(rowPointerDown).not.toHaveBeenCalled()

  wrapper.unmount()
  host.remove()
})
