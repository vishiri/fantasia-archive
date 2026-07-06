import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ProjectHierarchyTreeNode from '../ProjectHierarchyTreeNode.vue'

const baseNode = {
  children: [],
  childrenLoaded: false,
  documentId: null,
  groupId: null,
  hasChildren: true,
  icon: 'mdi-account',
  id: 'node-1',
  label: 'Row label',
  placementId: 'placement-1',
  worldColor: '#112233',
  worldId: 'world-1'
}

/**
 * ProjectHierarchyTreeNode renders world rows with earth icon and world color.
 */
test('Test that ProjectHierarchyTreeNode renders world row chrome', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        }
      }
    },
    props: {
      node: {
        ...baseNode,
        icon: '',
        nodeKind: 'world'
      },
      stat: {
        open: true
      }
    }
  })
  expect(wrapper.find('[data-test-node-kind="world"]').exists()).toBe(true)
  expect(wrapper.find('.projectHierarchyTreeNode--world').exists()).toBe(true)
  expect(wrapper.find('.q-icon').exists()).toBe(true)
  expect(wrapper.find('.q-focus-helper').exists()).toBe(true)
  expect((wrapper.element as HTMLElement).style.color).toBe('rgb(17, 34, 51)')
  expect(wrapper.find('.projectHierarchyTreeNode__label').exists()).toBe(true)
  expect(wrapper.find('.projectHierarchyTreeNode__icon--layoutKind').exists()).toBe(false)
})

/**
 * ProjectHierarchyTreeNode constrains group, placement, and document icons to layout sizing.
 */
test('Test that ProjectHierarchyTreeNode applies layout icon sizing for non-world rows', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        }
      }
    },
    props: {
      node: {
        ...baseNode,
        nodeKind: 'templatePlacement'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('.projectHierarchyTreeNode__icon--layoutKind').exists()).toBe(true)
})

/**
 * ProjectHierarchyTreeNode shows default document icon when template placement icon unset.
 */
test('Test that ProjectHierarchyTreeNode shows default icon for unset template placement', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        }
      }
    },
    props: {
      node: {
        ...baseNode,
        icon: '',
        nodeKind: 'templatePlacement'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('.q-icon').attributes('name')).toBe('mdi-file-outline')
})

/**
 * ProjectHierarchyTreeNode shows document rows with their placement template icon.
 */
test('Test that ProjectHierarchyTreeNode shows document rows with placement icon', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        }
      }
    },
    props: {
      node: {
        ...baseNode,
        documentId: 'doc-1',
        icon: 'mdi-account',
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('.q-icon').attributes('name')).toBe('mdi-account')
  expect(wrapper.find('.projectHierarchyTreeNode__icon--layoutKind').exists()).toBe(true)
})

/**
 * ProjectHierarchyTreeNode hides lazy placeholder rows.
 */
test('Test that ProjectHierarchyTreeNode hides lazy placeholder rows', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    props: {
      node: {
        ...baseNode,
        id: 'placement-1__lazy',
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-node-document"]').exists()).toBe(false)
})

/**
 * ProjectHierarchyTreeNode applies document row class for click affordance.
 */
test('Test that ProjectHierarchyTreeNode applies document row class', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    props: {
      node: {
        ...baseNode,
        documentId: 'doc-1',
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.classes()).toContain('projectHierarchyTreeNode--document')
  expect(wrapper.classes()).not.toContain('projectHierarchyTree__dragHandle')
})

/**
 * ProjectHierarchyTreeNode mirrors hover highlight for the active workspace tab document row.
 */
test('Test that ProjectHierarchyTreeNode applies active tab highlight only for matching document rows', async () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    props: {
      activeDocumentId: 'doc-1',
      node: {
        ...baseNode,
        documentId: 'doc-1',
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.classes()).toContain('projectHierarchyTreeNode--activeTabDocument')

  await wrapper.setProps({
    activeDocumentId: 'doc-2'
  })
  expect(wrapper.classes()).not.toContain('projectHierarchyTreeNode--activeTabDocument')
})

/**
 * ProjectHierarchyTreeNode syncs a kind class onto the parent he-tree tree-node wrapper.
 */
test('Test that ProjectHierarchyTreeNode syncs tree-node kind class', () => {
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  document.body.appendChild(treeNode)

  mount(ProjectHierarchyTreeNode, {
    attachTo: treeNode,
    props: {
      node: {
        ...baseNode,
        nodeKind: 'group'
      },
      stat: {
        open: false
      }
    }
  })

  expect(treeNode.classList.contains('projectHierarchyTree-treeNode--group')).toBe(true)
  treeNode.remove()
})
