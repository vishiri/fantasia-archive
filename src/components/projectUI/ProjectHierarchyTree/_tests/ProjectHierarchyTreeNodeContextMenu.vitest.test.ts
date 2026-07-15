/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import ProjectHierarchyTreeNodeContextMenu from '../ProjectHierarchyTreeNodeContextMenu.vue'

const hierarchyTreeContextMenuI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          contextMenu: {
            addNewDocumentUnderThis: 'Add new document under this',
            collapseAllUnderNode: 'Collapse all under this node',
            copyDocument: 'Copy document',
            deleteDocument: 'Delete document',
            editDocument: 'Edit document',
            expandAllUnderNode: 'Expand all under this node',
            openDocument: 'Open document'
          }
        },
        projectDocumentControlBar: {
          copyBackgroundColor: 'Copy background color',
          copyName: 'Copy name',
          copyTextColor: 'Copy text color'
        }
      }
    }
  }
})

function mountHierarchyTreeContextMenu (
  overrides: {
    addNewRowIcon?: string | null
    addNewRowLabel?: string | null
    showsBulkExpandRows?: boolean
    showsCopyRows?: boolean
  } = {}
) {
  const isOpen = ref(true)
  const onAddNewClick = vi.fn()
  const onExpandAllClick = vi.fn()
  const onCollapseAllClick = vi.fn()
  const onCopyNameClick = vi.fn()
  const onCopyTextColorClick = vi.fn()
  const onCopyBackgroundColorClick = vi.fn()
  const onAddNewDocumentUnderThisClick = vi.fn()
  const onCopyDocumentClick = vi.fn()
  const onDeleteDocumentClick = vi.fn()
  const onEditDocumentClick = vi.fn()
  const onHide = vi.fn()
  const onOpenDocumentClick = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeNodeContextMenu, {
    props: {
      addNewRowIcon: overrides.addNewRowIcon ?? null,
      addNewRowLabel: overrides.addNewRowLabel ?? null,
      anchorNodeId: 'world-1',
      isOpen: true,
      menuPointerPosition: {
        left: 120,
        top: 80
      },
      onAddNewClick,
      onAddNewDocumentUnderThisClick,
      onCollapseAllClick,
      onCopyBackgroundColorClick,
      onCopyDocumentClick,
      onCopyNameClick,
      onCopyTextColorClick,
      onDeleteDocumentClick,
      onEditDocumentClick,
      onExpandAllClick,
      onHide,
      onOpenDocumentClick,
      showsBulkExpandRows: overrides.showsBulkExpandRows ?? true,
      showsCopyRows: overrides.showsCopyRows ?? false,
      'onUpdate:isOpen': (value: boolean) => {
        isOpen.value = value
      }
    },
    global: {
      plugins: [hierarchyTreeContextMenuI18n],
      stubs: {
        QIcon: true,
        QItem: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>'
        },
        QItemSection: {
          template: '<span><slot /></span>'
        },
        QList: {
          template: '<div><slot /></div>'
        },
        QMenu: {
          emits: ['hide', 'update:modelValue'],
          props: ['modelValue', 'target'],
          template: '<div data-test-locator="projectHierarchyTree-nodeContextMenu" :data-test-menu-target="target ? \'set\' : \'unset\'"><button data-test-locator="projectHierarchyTree-nodeContextMenu-close" type="button" @click="$emit(\'update:modelValue\', false)" /><button data-test-locator="projectHierarchyTree-nodeContextMenu-hide" type="button" @click="$emit(\'hide\')" /><slot /></div>'
        },
        QSeparator: {
          template: '<hr data-test-locator="projectHierarchyTree-nodeContextMenu-separator" />'
        }
      }
    }
  })

  return {
    isOpen,
    onAddNewClick,
    onAddNewDocumentUnderThisClick,
    onCollapseAllClick,
    onCopyBackgroundColorClick,
    onCopyDocumentClick,
    onCopyNameClick,
    onCopyTextColorClick,
    onDeleteDocumentClick,
    onEditDocumentClick,
    onExpandAllClick,
    onHide,
    onOpenDocumentClick,
    wrapper
  }
}

test('ProjectHierarchyTreeNodeContextMenu renders expand and collapse actions', () => {
  const { wrapper } = mountHierarchyTreeContextMenu()
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-expandAll"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-collapseAll"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu"]').attributes('data-test-hierarchy-node-id')).toBe('world-1')
  const pointerAnchor = wrapper.find('.projectHierarchyTreeNodeContextMenu__pointerAnchor')
  expect(pointerAnchor.exists()).toBe(true)
  expect(pointerAnchor.attributes('style')).toContain('left: 120px')
  expect(pointerAnchor.attributes('style')).toContain('top: 80px')
  expect(wrapper.text()).toContain('Expand all under this node')
  expect(wrapper.text()).toContain('Collapse all under this node')
})

test('ProjectHierarchyTreeNodeContextMenu omits anchor metadata when props are null', () => {
  const wrapper = mount(ProjectHierarchyTreeNodeContextMenu, {
    props: {
      addNewRowIcon: null,
      addNewRowLabel: null,
      anchorNodeId: null,
      isOpen: false,
      menuPointerPosition: null,
      onAddNewClick: vi.fn(),
      onAddNewDocumentUnderThisClick: vi.fn(),
      onCollapseAllClick: vi.fn(),
      onCopyBackgroundColorClick: vi.fn(),
      onCopyDocumentClick: vi.fn(),
      onCopyNameClick: vi.fn(),
      onCopyTextColorClick: vi.fn(),
      onDeleteDocumentClick: vi.fn(),
      onEditDocumentClick: vi.fn(),
      onExpandAllClick: vi.fn(),
      onHide: vi.fn(),
      onOpenDocumentClick: vi.fn(),
      showsBulkExpandRows: false,
      showsCopyRows: false,
      'onUpdate:isOpen': vi.fn()
    },
    global: {
      plugins: [hierarchyTreeContextMenuI18n],
      stubs: {
        QIcon: true,
        QItem: {
          template: '<div><slot /></div>'
        },
        QItemSection: {
          template: '<span><slot /></span>'
        },
        QList: {
          template: '<div><slot /></div>'
        },
        QMenu: {
          props: ['target'],
          template: '<div data-test-locator="projectHierarchyTree-nodeContextMenu" :data-test-menu-target="target ? \'set\' : \'unset\'"><slot /></div>'
        }
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu"]').attributes('data-test-hierarchy-node-id')).toBeUndefined()
  expect(wrapper.find('.projectHierarchyTreeNodeContextMenu__pointerAnchor').attributes('style')).toContain('opacity: 0')
  wrapper.unmount()
})

test('ProjectHierarchyTreeNodeContextMenu renders add-new row and separator for placements', async () => {
  const { onAddNewClick, wrapper } = mountHierarchyTreeContextMenu({
    addNewRowIcon: 'mdi-plus',
    addNewRowLabel: 'Add new building'
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-addNew"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-separator"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Add new building')
  const menuHtml = wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu"]').html()
  expect(menuHtml.indexOf('projectHierarchyTree-nodeContextMenu-expandAll')).toBeLessThan(
    menuHtml.indexOf('projectHierarchyTree-nodeContextMenu-addNew')
  )
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-addNew"]').trigger('click')
  expect(onAddNewClick).toHaveBeenCalled()
})

test('ProjectHierarchyTreeNodeContextMenu renders copy rows for document rows', async () => {
  const {
    onAddNewDocumentUnderThisClick,
    onCopyBackgroundColorClick,
    onCopyDocumentClick,
    onCopyNameClick,
    onCopyTextColorClick,
    onDeleteDocumentClick,
    onEditDocumentClick,
    onOpenDocumentClick,
    wrapper
  } = mountHierarchyTreeContextMenu({
    showsBulkExpandRows: false,
    showsCopyRows: true
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyName"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyTextColor"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyBackgroundColor"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-openDocument"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-editDocument"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyDocument"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentUnderThis"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-deleteDocument"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Copy name')
  expect(wrapper.text()).toContain('Open document')
  expect(wrapper.text()).toContain('Add new document under this')
  expect(wrapper.text()).toContain('Delete document')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyName"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyTextColor"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyBackgroundColor"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-openDocument"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-editDocument"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-copyDocument"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentUnderThis"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-deleteDocument"]').trigger('click')
  expect(onCopyNameClick).toHaveBeenCalled()
  expect(onCopyTextColorClick).toHaveBeenCalled()
  expect(onCopyBackgroundColorClick).toHaveBeenCalled()
  expect(onOpenDocumentClick).toHaveBeenCalled()
  expect(onEditDocumentClick).toHaveBeenCalled()
  expect(onCopyDocumentClick).toHaveBeenCalled()
  expect(onAddNewDocumentUnderThisClick).toHaveBeenCalled()
  expect(onDeleteDocumentClick).toHaveBeenCalled()
})

test('ProjectHierarchyTreeNodeContextMenu delegates menu item clicks and hide', async () => {
  const { isOpen, onCollapseAllClick, onExpandAllClick, onHide, wrapper } = mountHierarchyTreeContextMenu()

  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-expandAll"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-collapseAll"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-hide"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-close"]').trigger('click')

  expect(onExpandAllClick).toHaveBeenCalled()
  expect(onCollapseAllClick).toHaveBeenCalled()
  expect(onHide).toHaveBeenCalled()
  expect(isOpen.value).toBe(false)
})
