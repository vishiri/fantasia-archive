/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import ProjectHierarchyTree from '../ProjectHierarchyTree.vue'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

const treeHandlers = vi.hoisted(() => ({
  onAddNewDocumentFromContextMenuClick: vi.fn(),
  onAddNewDocumentUnderThisFromContextMenuClick: vi.fn(),
  onBeforeDragOpen: vi.fn(),
  onBeforeDragStart: vi.fn(),
  onCollapseAllUnderNodeClick: vi.fn(),
  onCopyBackgroundColorFromContextMenuClick: vi.fn(),
  onCopyDocumentFromContextMenuClick: vi.fn(),
  onCopyNameFromContextMenuClick: vi.fn(),
  onCopyTextColorFromContextMenuClick: vi.fn(),
  onDeleteDocumentFromContextMenuClick: vi.fn(),
  onDocumentRowAuxClick: vi.fn(),
  onEditDocumentFromContextMenuClick: vi.fn(),
  onExpandAllUnderNodeClick: vi.fn(),
  onNodeClick: vi.fn(),
  onNodeClose: vi.fn(),
  onNodeContextMenuHide: vi.fn(),
  onNodeOpen: vi.fn(),
  onNodeRowContextMenu: vi.fn(),
  onOpenDocumentFromContextMenuClick: vi.fn(),
  onNonWorldOpenIconClick: vi.fn(),
  onNonWorldOpenIconPointerDown: vi.fn(),
  onTreeAfterDrop: vi.fn(),
  onTreeDataUpdate: vi.fn(),
  onTreeDragEndCleanup: vi.fn(),
  onWorldNodeRowClick: vi.fn(),
  onWorldNodeRowPointerDown: vi.fn()
}))

const treeOpenRequest = vi.hoisted(() => ({
  handler: null as ((documentId: string, mode: string, treeMeta: unknown) => void) | null
}))

const treeRefWiring = vi.hoisted(() => ({
  setTreeComponentRef: vi.fn(),
  setTreeScrollHostRef: vi.fn()
}))

const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([
  {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World 1',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
])

const treeContextMenuState = {
  addNewRowIcon: ref<string | null>(null),
  addNewRowLabel: ref<string | null>(null),
  anchorNodeId: ref<string | null>(null),
  isOpen: ref(false),
  menuPointerPosition: ref<{ left: number, top: number } | null>(null),
  showsBulkExpandRows: ref(false),
  showsCopyRows: ref(false)
}

const projectHierarchyTreeI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          contextMenu: {
            collapseAllUnderNode: 'Collapse all under this node',
            expandAllUnderNode: 'Expand all under this node'
          }
        }
      }
    }
  }
})

const projectHierarchyTreeContextMenuStubs = {
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
    template: '<div data-test-locator="projectHierarchyTree-nodeContextMenu-host"><slot /></div>'
  }
}

const projectHierarchyTreeNodeContextMenuStub = {
  name: 'ProjectHierarchyTreeNodeContextMenu',
  props: [
    'addNewRowIcon',
    'addNewRowLabel',
    'anchorNodeId',
    'isOpen',
    'menuPointerPosition',
    'onAddNewClick',
    'onAddNewDocumentUnderThisClick',
    'onCollapseAllClick',
    'onCopyBackgroundColorClick',
    'onCopyDocumentClick',
    'onCopyNameClick',
    'onCopyTextColorClick',
    'onDeleteDocumentClick',
    'onEditDocumentClick',
    'onExpandAllClick',
    'onHide',
    'onOpenDocumentClick',
    'showsBulkExpandRows',
    'showsCopyRows'
  ],
  template: '<div data-test-locator="projectHierarchyTree-nodeContextMenu-stub" />'
}

function mountProjectHierarchyTree (
  options: Parameters<typeof mount<typeof ProjectHierarchyTree>>[1] = {},
  withNodeContextMenu = false
) {
  const contextMenuStubs = withNodeContextMenu
    ? projectHierarchyTreeContextMenuStubs
    : {
        ProjectHierarchyTreeNodeContextMenu: projectHierarchyTreeNodeContextMenuStub
      }

  return mount(ProjectHierarchyTree, {
    ...options,
    global: {
      plugins: [projectHierarchyTreeI18n],
      ...options.global,
      stubs: {
        ...contextMenuStubs,
        ...options.global?.stubs
      }
    }
  })
}

vi.mock('../scripts/projectHierarchyTree_manager', () => {
  return {
    useProjectHierarchyTree: (options: {
      onDocumentOpenRequest: (documentId: string, mode: string, treeMeta: unknown) => void
    }) => {
      treeOpenRequest.handler = options.onDocumentOpenRequest
      return {
        activeDocumentId: ref(null),
        contextMenuAddNewRowIcon: treeContextMenuState.addNewRowIcon,
        contextMenuAddNewRowLabel: treeContextMenuState.addNewRowLabel,
        contextMenuAnchorNodeId: treeContextMenuState.anchorNodeId,
        contextMenuShowsBulkExpandRows: treeContextMenuState.showsBulkExpandRows,
        contextMenuShowsCopyRows: treeContextMenuState.showsCopyRows,
        eachDraggableHandler: () => true,
        eachDroppableHandler: () => true,
        heTreeNodeKey: (_stat: { data: { id: string } }) => 'world-1',
        isNodeContextMenuOpen: treeContextMenuState.isOpen,
        isTreeDragActive: ref(false),
        nodeMenuPointerPosition: treeContextMenuState.menuPointerPosition,
        onAddNewDocumentFromContextMenuClick: treeHandlers.onAddNewDocumentFromContextMenuClick,
        onAddNewDocumentUnderThisFromContextMenuClick:
          treeHandlers.onAddNewDocumentUnderThisFromContextMenuClick,
        onBeforeDragOpen: treeHandlers.onBeforeDragOpen,
        onBeforeDragStart: treeHandlers.onBeforeDragStart,
        onCollapseAllUnderNodeClick: treeHandlers.onCollapseAllUnderNodeClick,
        onCopyBackgroundColorFromContextMenuClick: treeHandlers.onCopyBackgroundColorFromContextMenuClick,
        onCopyDocumentFromContextMenuClick: treeHandlers.onCopyDocumentFromContextMenuClick,
        onCopyNameFromContextMenuClick: treeHandlers.onCopyNameFromContextMenuClick,
        onCopyTextColorFromContextMenuClick: treeHandlers.onCopyTextColorFromContextMenuClick,
        onDeleteDocumentFromContextMenuClick: treeHandlers.onDeleteDocumentFromContextMenuClick,
        onDocumentRowAuxClick: treeHandlers.onDocumentRowAuxClick,
        onEditDocumentFromContextMenuClick: treeHandlers.onEditDocumentFromContextMenuClick,
        onExpandAllUnderNodeClick: treeHandlers.onExpandAllUnderNodeClick,
        onNodeClick: treeHandlers.onNodeClick,
        onNodeClose: treeHandlers.onNodeClose,
        onNodeContextMenuHide: treeHandlers.onNodeContextMenuHide,
        onNodeOpen: treeHandlers.onNodeOpen,
        onNodeRowContextMenu: treeHandlers.onNodeRowContextMenu,
        onOpenDocumentFromContextMenuClick: treeHandlers.onOpenDocumentFromContextMenuClick,
        onNonWorldOpenIconClick: treeHandlers.onNonWorldOpenIconClick,
        onNonWorldOpenIconPointerDown: treeHandlers.onNonWorldOpenIconPointerDown,
        onTreeAfterDrop: treeHandlers.onTreeAfterDrop,
        onTreeDataUpdate: treeHandlers.onTreeDataUpdate,
        onTreeDragEndCleanup: treeHandlers.onTreeDragEndCleanup,
        onWorldNodeRowClick: treeHandlers.onWorldNodeRowClick,
        onWorldNodeRowPointerDown: treeHandlers.onWorldNodeRowPointerDown,
        rootDroppableHandler: () => false,
        setTreeComponentRef: treeRefWiring.setTreeComponentRef,
        setTreeScrollHostRef: treeRefWiring.setTreeScrollHostRef,
        treeData,
        treeMountKey: ref(0),
        treeRootClassList: ref({}),
        treeStyle: ref({
          height: '100%'
        })
      }
    }
  }
})

vi.mock('@he-tree/vue', () => {
  const Draggable = defineComponent({
    name: 'DraggableStub',
    props: {
      modelValue: {
        required: true,
        type: Array
      }
    },
    emits: [
      'after-drop',
      'before-drag-open',
      'before-drag-start',
      'click:node',
      'close:node',
      'dragend',
      'open:node',
      'update:modelValue'
    ],
    setup (props, { slots, emit }) {
      return () => h('div', {
        'data-test-locator': 'projectHierarchyTree-stub',
        onClick: () => emit('click:node'),
        onDragend: () => emit('dragend'),
        onDrop: () => emit('after-drop')
      }, (props.modelValue as unknown[]).map((node) => {
        return slots.default?.({
          node,
          stat: {
            children: [{}],
            open: false
          }
        })
      }))
    }
  })
  return {
    Draggable,
    dragContext: {
      dragNode: null
    }
  }
})

/**
 * ProjectHierarchyTree renders tree rows when layout data exists.
 */
test('Test that ProjectHierarchyTree renders tree rows when layout data exists', () => {
  const wrapper = mountProjectHierarchyTree({
    global: {
      stubs: {
        ProjectHierarchyTreeNode: {
          props: ['node', 'stat'],
          template: '<div data-test-locator="projectHierarchyTree-node-stub" />'
        },
        QIcon: {
          emits: ['click', 'pointerdown'],
          template: '<button data-test-locator="projectHierarchyTree-openIcon" type="button" @click.stop="$emit(\'click\', $event)" @pointerdown.stop="$emit(\'pointerdown\', $event)" />'
        }
      }
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-host"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-stub"]').exists()).toBe(true)
  expect(treeRefWiring.setTreeScrollHostRef).toHaveBeenCalled()
  expect(treeRefWiring.setTreeComponentRef).toHaveBeenCalled()
  wrapper.unmount()
})

test('Test that ProjectHierarchyTree forwards row and tree interaction handlers', async () => {
  const wrapper = mountProjectHierarchyTree({
    global: {
      stubs: {
        ProjectHierarchyTreeNode: {
          props: ['node', 'stat'],
          template: '<div data-test-locator="projectHierarchyTree-node-stub" />'
        },
        QIcon: {
          emits: ['click', 'pointerdown'],
          template: '<button data-test-locator="projectHierarchyTree-openIcon" type="button" @click.stop="$emit(\'click\', $event)" @pointerdown.stop="$emit(\'pointerdown\', $event)" />'
        }
      }
    }
  })

  const row = wrapper.get('.projectHierarchyTree__nodeRow')
  await row.trigger('click')
  await row.trigger('pointerdown')
  await row.trigger('auxclick', { button: 1 })
  await row.trigger('contextmenu')

  const openIcon = wrapper.get('[data-test-locator="projectHierarchyTree-openIcon"]')
  await openIcon.trigger('click')
  await openIcon.trigger('pointerdown')

  const draggable = wrapper.findComponent({ name: 'DraggableStub' })
  await draggable.vm.$emit('click:node')
  await draggable.vm.$emit('close:node')
  await draggable.vm.$emit('open:node')
  await draggable.vm.$emit('after-drop')
  await draggable.vm.$emit('before-drag-open')
  await draggable.vm.$emit('before-drag-start')
  await draggable.vm.$emit('dragend')
  await draggable.vm.$emit('update:modelValue', treeData.value)

  expect(treeHandlers.onWorldNodeRowClick).toHaveBeenCalled()
  expect(treeHandlers.onWorldNodeRowPointerDown).toHaveBeenCalled()
  expect(treeHandlers.onDocumentRowAuxClick).toHaveBeenCalled()
  expect(treeHandlers.onNodeRowContextMenu).toHaveBeenCalled()
  expect(treeHandlers.onNonWorldOpenIconClick).toHaveBeenCalled()
  expect(treeHandlers.onNonWorldOpenIconPointerDown).toHaveBeenCalled()
  expect(treeHandlers.onNodeClick).toHaveBeenCalled()
  expect(treeHandlers.onNodeClose).toHaveBeenCalled()
  expect(treeHandlers.onNodeOpen).toHaveBeenCalled()
  expect(treeHandlers.onBeforeDragOpen).toHaveBeenCalled()
  expect(treeHandlers.onBeforeDragStart).toHaveBeenCalled()
  expect(treeHandlers.onTreeAfterDrop).toHaveBeenCalled()
  expect(treeHandlers.onTreeDataUpdate).toHaveBeenCalled()
  expect(treeHandlers.onTreeDragEndCleanup).toHaveBeenCalled()

  wrapper.unmount()
})

test('Test that ProjectHierarchyTree forwards document open requests to the parent', () => {
  const wrapper = mountProjectHierarchyTree({
    global: {
      stubs: {
        ProjectHierarchyTreeNode: {
          props: ['node', 'stat'],
          template: '<div data-test-locator="projectHierarchyTree-node-stub" />'
        },
        QIcon: true
      }
    }
  })

  treeOpenRequest.handler?.('doc-9', 'preview', {
    source: 'tree'
  })
  expect(wrapper.emitted('document-open-request')?.[0]).toEqual([
    'doc-9',
    'preview',
    {
      source: 'tree'
    }
  ])

  wrapper.unmount()
})

test('Test that ProjectHierarchyTree renders open icon for expandable document rows', () => {
  treeData.value = [{
    children: [],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent doc',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }]
  const wrapper = mountProjectHierarchyTree({
    global: {
      stubs: {
        ProjectHierarchyTreeNode: {
          props: ['node', 'stat'],
          template: '<div data-test-locator="projectHierarchyTree-node-stub" />'
        },
        QIcon: {
          emits: ['click', 'pointerdown'],
          template: '<button data-test-locator="projectHierarchyTree-openIcon" type="button" @click.stop="$emit(\'click\', $event)" @pointerdown.stop="$emit(\'pointerdown\', $event)" />'
        }
      }
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-openIcon"]').exists()).toBe(true)
  wrapper.unmount()
  treeData.value = [{
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World 1',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }]
})

test('Test that ProjectHierarchyTree omits open icon for leaf document rows', () => {
  treeData.value = [{
    children: [],
    childrenLoaded: true,
    documentId: 'doc-leaf',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-leaf',
    label: 'Leaf doc',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }]
  const wrapper = mountProjectHierarchyTree({
    global: {
      stubs: {
        ProjectHierarchyTreeNode: {
          props: ['node', 'stat'],
          template: '<div data-test-locator="projectHierarchyTree-node-stub" />'
        },
        QIcon: {
          emits: ['click', 'pointerdown'],
          template: '<button data-test-locator="projectHierarchyTree-openIcon" type="button" @click.stop="$emit(\'click\', $event)" @pointerdown.stop="$emit(\'pointerdown\', $event)" />'
        }
      }
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-openIcon"]').exists()).toBe(false)
  wrapper.unmount()
  treeData.value = [{
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World 1',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }]
})

test('Test that ProjectHierarchyTree mounts node context menu with handler props', async () => {
  treeContextMenuState.anchorNodeId.value = 'world-1'
  treeContextMenuState.isOpen.value = true
  treeContextMenuState.menuPointerPosition.value = {
    left: 120,
    top: 80
  }

  const wrapper = mountProjectHierarchyTree({
    global: {
      stubs: {
        ProjectHierarchyTreeNode: {
          props: ['node', 'stat'],
          template: '<div data-test-locator="projectHierarchyTree-node-stub" />'
        },
        QIcon: true
      }
    }
  }, true)

  const contextMenu = wrapper.findComponent({ name: 'ProjectHierarchyTreeNodeContextMenu' })
  expect(contextMenu.exists()).toBe(true)
  expect(contextMenu.props('onExpandAllClick')).toBe(treeHandlers.onExpandAllUnderNodeClick)
  expect(contextMenu.props('onCollapseAllClick')).toBe(treeHandlers.onCollapseAllUnderNodeClick)
  expect(contextMenu.props('onAddNewClick')).toBe(treeHandlers.onAddNewDocumentFromContextMenuClick)
  expect(contextMenu.props('onHide')).toBe(treeHandlers.onNodeContextMenuHide)
  await contextMenu.vm.$emit('update:isOpen', false)
  expect(treeContextMenuState.isOpen.value).toBe(false)
  wrapper.unmount()
  treeContextMenuState.anchorNodeId.value = null
  treeContextMenuState.isOpen.value = false
  treeContextMenuState.menuPointerPosition.value = null
})

test('Test that ProjectHierarchyTree wires context menu handler on add-new rows without opening menu', async () => {
  treeData.value = [{
    children: [],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: 'template-1',
    groupId: null,
    hasChildren: false,
    icon: 'mdi-plus',
    id: 'placement-1__add-new',
    label: 'Add new character',
    nodeKind: 'addNewDocument',
    placementId: 'placement-1',
    titlePluralTranslations: { 'en-US': 'Characters' },
    titleSingularTranslations: { 'en-US': 'Character' },
    worldColor: '#336699',
    worldId: 'world-1'
  }]
  const wrapper = mountProjectHierarchyTree({
    global: {
      stubs: {
        ProjectHierarchyTreeNode: {
          props: ['node', 'stat'],
          template: '<div data-test-locator="projectHierarchyTree-node-stub" />'
        },
        QIcon: true
      }
    }
  })
  const row = wrapper.get('.projectHierarchyTree__nodeRow')
  await row.trigger('contextmenu')
  expect(treeHandlers.onNodeRowContextMenu).toHaveBeenCalled()
  wrapper.unmount()
  treeData.value = [{
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World 1',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }]
})
