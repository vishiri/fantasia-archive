/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import ProjectHierarchyTree from '../ProjectHierarchyTree.vue'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

const treeHandlers = vi.hoisted(() => ({
  onAddNewDocumentRowContextMenu: vi.fn(),
  onBeforeDragStart: vi.fn(),
  onDocumentRowAuxClick: vi.fn(),
  onNodeClick: vi.fn(),
  onNodeClose: vi.fn(),
  onNodeOpen: vi.fn(),
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

vi.mock('../scripts/projectHierarchyTree_manager', () => {
  return {
    useProjectHierarchyTree: (options: {
      onDocumentOpenRequest: (documentId: string, mode: string, treeMeta: unknown) => void
    }) => {
      treeOpenRequest.handler = options.onDocumentOpenRequest
      return {
        activeDocumentId: ref(null),
        eachDraggableHandler: () => true,
        eachDroppableHandler: () => true,
        heTreeNodeKey: (_stat: { data: { id: string } }) => 'world-1',
        isTreeDragActive: ref(false),
        onBeforeDragOpen: vi.fn(),
        onBeforeDragStart: treeHandlers.onBeforeDragStart,
        onAddNewDocumentRowContextMenu: treeHandlers.onAddNewDocumentRowContextMenu,
        onDocumentRowAuxClick: treeHandlers.onDocumentRowAuxClick,
        onNodeClick: treeHandlers.onNodeClick,
        onNodeClose: treeHandlers.onNodeClose,
        onNodeOpen: treeHandlers.onNodeOpen,
        onNonWorldOpenIconClick: treeHandlers.onNonWorldOpenIconClick,
        onNonWorldOpenIconPointerDown: treeHandlers.onNonWorldOpenIconPointerDown,
        onTreeAfterDrop: treeHandlers.onTreeAfterDrop,
        onTreeDataUpdate: treeHandlers.onTreeDataUpdate,
        onTreeDragEndCleanup: treeHandlers.onTreeDragEndCleanup,
        onWorldNodeRowClick: treeHandlers.onWorldNodeRowClick,
        onWorldNodeRowPointerDown: treeHandlers.onWorldNodeRowPointerDown,
        rootDroppableHandler: () => false,
        setTreeComponentRef: vi.fn(),
        setTreeScrollHostRef: vi.fn(),
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
  const wrapper = mount(ProjectHierarchyTree, {
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
  wrapper.unmount()
})

test('Test that ProjectHierarchyTree forwards row and tree interaction handlers', async () => {
  const wrapper = mount(ProjectHierarchyTree, {
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
  expect(treeHandlers.onNonWorldOpenIconClick).toHaveBeenCalled()
  expect(treeHandlers.onNonWorldOpenIconPointerDown).toHaveBeenCalled()

  wrapper.unmount()
})

test('Test that ProjectHierarchyTree forwards document open requests to the parent', () => {
  const wrapper = mount(ProjectHierarchyTree, {
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
  const wrapper = mount(ProjectHierarchyTree, {
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
  const wrapper = mount(ProjectHierarchyTree, {
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

test('Test that ProjectHierarchyTree wires add-new context menu handler on add-new rows', async () => {
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
  const wrapper = mount(ProjectHierarchyTree, {
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
  expect(treeHandlers.onAddNewDocumentRowContextMenu).toHaveBeenCalled()
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
