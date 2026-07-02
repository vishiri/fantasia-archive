import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import ProjectHierarchyTree from '../ProjectHierarchyTree.vue'

const treeData = ref([
  {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-1',
    label: 'Doc 1',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
])

vi.mock('../scripts/projectHierarchyTree_manager', () => {
  return {
    useProjectHierarchyTree: () => ({
      eachDraggableHandler: () => true,
      eachDroppableHandler: () => true,
      heTreeNodeKey: (_stat: { data: { id: string } }) => 'doc-1',
      onBeforeDragStart: vi.fn(),
      onNodeClick: vi.fn(),
      onNodeClose: vi.fn(),
      onNodeOpen: vi.fn(),
      onNonWorldOpenIconClick: vi.fn(),
      onNonWorldOpenIconPointerDown: vi.fn(),
      onWorldNodeRowClick: vi.fn(),
      onWorldNodeRowPointerDown: vi.fn(),
      onTreeAfterDrop: vi.fn(),
      onTreeDataUpdate: vi.fn(),
      onTreeDragEndCleanup: vi.fn(),
      isTreeDragActive: ref(false),
      rootDroppableHandler: () => false,
      setTreeComponentRef: vi.fn(),
      setTreeScrollHostRef: vi.fn(),
      treeData,
      treeMountKey: ref(0),
      treeRootClassList: ref({}),
      treeStyle: ref({
        height: '100%'
      })
    })
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
    setup (props, { slots }) {
      return () => h('div', {
        'data-test-locator': 'projectHierarchyTree-stub'
      }, (props.modelValue as unknown[]).map((node) => {
        return slots.default?.({
          node,
          stat: {
            children: [],
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
        ProjectHierarchyTreeNode: true
      }
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-host"]').exists()).toBe(true)
})
