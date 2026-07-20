import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import ProjectHierarchyTreeNode from '../ProjectHierarchyTreeNode.vue'
import { resolveProjectHierarchyTreeDocumentAppearanceChrome } from '../scripts/projectHierarchyTreeDocumentAppearanceChromeWiring'
import { expectCssColorValue } from 'app/helpers/vitestCssColorExpect'

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
  expect((wrapper.element as HTMLElement).style.color).toBe('')
  expectCssColorValue(
    (wrapper.find('.projectHierarchyTreeNode__label').element as HTMLElement).style.color,
    '#112233'
  )
  expect(wrapper.find('.projectHierarchyTreeNode__label').exists()).toBe(true)
  expect(wrapper.find('.projectHierarchyTreeNode__icon--layoutKind').exists()).toBe(false)
})

/**
 * Empty world color uses the theme primary CSS variable.
 */
test('Test that ProjectHierarchyTreeNode uses primary-bright fallback when world color is blank', () => {
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
        nodeKind: 'world',
        worldColor: ''
      },
      stat: {
        open: true
      }
    }
  })
  expect((wrapper.find('.projectHierarchyTreeNode__label').element as HTMLElement).style.color).toBe(
    'var(--fa-color-primary-bright)'
  )
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

test('Test that ProjectHierarchyTreeNode shows mdi-folder-open for category documents', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        },
        ProjectHierarchyTreePlacementCount: true
      }
    },
    props: {
      node: {
        ...baseNode,
        documentId: 'doc-1',
        icon: 'mdi-account',
        isCategory: true,
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('.q-icon').attributes('name')).toBe('mdi-folder-open')
})

test('Test that ProjectHierarchyTreeNode shows dead marker and strikethrough for dead documents', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        },
        ProjectHierarchyTreePlacementCount: true
      }
    },
    props: {
      node: {
        ...baseNode,
        documentId: 'doc-dead',
        icon: 'mdi-account',
        isDead: true,
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-node-document-deadMarker"]').text()).toBe('†')
  expect(wrapper.find('.projectHierarchyTreeNode__label--dead').exists()).toBe(true)
})

test('Test that ProjectHierarchyTreeNode applies muted grey for minor documents without text color', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        },
        ProjectHierarchyTreePlacementCount: true
      }
    },
    props: {
      node: {
        ...baseNode,
        documentId: 'doc-minor',
        documentTextColor: '',
        icon: 'mdi-account',
        isMinor: true,
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  const label = wrapper.find('[data-test-locator="projectHierarchyTree-node-document-label"]')
  expect(label.attributes('style')).toContain('var(--fa-color-text-muted)')
})

test('Test that ProjectHierarchyTreeNode shows finished check mark before dead dagger', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        },
        ProjectHierarchyTreePlacementCount: true
      }
    },
    props: {
      node: {
        ...baseNode,
        documentId: 'doc-finished-dead',
        icon: 'mdi-account',
        isDead: true,
        isFinished: true,
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  const finishedMarker = wrapper.find('[data-test-locator="projectHierarchyTree-node-document-finishedMarker"]')
  const deadMarker = wrapper.find('[data-test-locator="projectHierarchyTree-node-document-deadMarker"]')
  expect(finishedMarker.text()).toBe('✓')
  expect(deadMarker.text()).toBe('†')
  expect(finishedMarker.element.nextElementSibling).toBe(deadMarker.element)
})

test('Test that ProjectHierarchyTreeNode renders order number badge when label prop is set', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        ProjectHierarchyTreeOrderNumberBadge: {
          props: ['label'],
          template: '<span data-test-locator="order-number-badge-stub">{{ label }}</span>'
        },
        ProjectHierarchyTreePlacementCount: true,
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        }
      }
    },
    props: {
      node: {
        ...baseNode,
        nodeKind: 'document',
        treeOrderNumber: 12
      },
      orderNumberBadgeLabel: '12',
      stat: {
        open: false
      }
    }
  })

  expect(wrapper.find('[data-test-locator="order-number-badge-stub"]').text()).toBe('12')
})

test('Test that ProjectHierarchyTreeNode renders placement counts from display prop', () => {
  const wrapper = mount(ProjectHierarchyTreeNode, {
    global: {
      stubs: {
        ProjectHierarchyTreePlacementCount: {
          props: ['categoryCount', 'documentCount', 'display'],
          template: '<span data-test-locator="placement-count-stub" />'
        },
        QIcon: {
          props: ['name'],
          template: '<i class="q-icon" :name="name" />'
        }
      }
    },
    props: {
      node: {
        ...baseNode,
        categoryCount: 3,
        documentCount: 7,
        nodeKind: 'templatePlacement'
      },
      placementCountDisplay: {
        categoryCount: 3,
        display: {
          segments: [
            {
              kind: 'document',
              value: 7
            },
            {
              kind: 'category',
              value: 3
            }
          ],
          showDivider: true,
          shows: true
        },
        documentCount: 7
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('[data-test-locator="placement-count-stub"]').exists()).toBe(true)
})

/**
 * ProjectHierarchyTreeNode renders add-new rows with grey palette token and plus icon.
 */
test('Test that ProjectHierarchyTreeNode renders add-new row with grey palette class', () => {
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
        documentId: null,
        documentTemplateId: 'template-1',
        icon: 'mdi-plus',
        id: 'placement-1__add-new',
        label: 'Add new character',
        nodeKind: 'addNewDocument',
        titlePluralTranslations: { 'en-US': 'Characters' },
        titleSingularTranslations: { 'en-US': 'Character' }
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('.projectHierarchyTreeNode--addNewDocument').exists()).toBe(true)
  expect(wrapper.find('.q-icon').attributes('name')).toBe('mdi-plus')
  expect((wrapper.element as HTMLElement).style.color).toBe('')
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

test('Test that ProjectHierarchyTreeNode applies text-only document appearance without background class', () => {
  const node = {
    ...baseNode,
    documentBackgroundColor: '',
    documentId: 'doc-1',
    documentTextColor: '#aabbcc',
    nodeKind: 'document' as const
  }
  expect(resolveProjectHierarchyTreeDocumentAppearanceChrome(node)).toEqual({
    color: '#aabbcc'
  })
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
      node,
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.classes()).toContain('projectHierarchyTreeNode--customDocumentAppearance')
  const appearanceClasses = wrapper.classes().filter((className) => {
    return className.includes('customDocument')
  })
  expect(appearanceClasses).toEqual(['projectHierarchyTreeNode--customDocumentAppearance'])
  expect((wrapper.element as HTMLElement).style.backgroundColor).toBe('')
  expectCssColorValue(
    (wrapper.find('.projectHierarchyTreeNode__label').element as HTMLElement).style.color,
    '#aabbcc'
  )
  wrapper.unmount()
})

test('Test that ProjectHierarchyTreeNode renders template placement icons through placement display resolver', () => {
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
        icon: 'mdi-account',
        nodeKind: 'templatePlacement'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.find('.q-icon').exists()).toBe(true)
  wrapper.unmount()
})

/**
 * ProjectHierarchyTreeNode applies saved document appearance colors to document rows.
 */
test('Test that ProjectHierarchyTreeNode applies document appearance chrome colors', () => {
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
        documentBackgroundColor: '#221100',
        documentId: 'doc-1',
        documentTextColor: '#aabbcc',
        nodeKind: 'document'
      },
      stat: {
        open: false
      }
    }
  })
  expect(wrapper.classes()).toContain('projectHierarchyTreeNode--customDocumentAppearance')
  expect(wrapper.classes()).toContain('projectHierarchyTreeNode--customDocumentBackground')
  expect((wrapper.element as HTMLElement).style.color).toBe('')
  expectCssColorValue((wrapper.element as HTMLElement).style.backgroundColor, '#221100')
  expect((wrapper.element as HTMLElement).style.getPropertyValue('--projectHierarchyTreeNode-backgroundColor').trim()).toBe('#221100')
  expect((wrapper.element as HTMLElement).style.getPropertyValue('--projectHierarchyTreeNode-focusHelperColor').trim()).toBe('#221100')
  expectCssColorValue(
    (wrapper.find('.projectHierarchyTreeNode__label').element as HTMLElement).style.color,
    '#aabbcc'
  )
  expectCssColorValue(
    (wrapper.find('.projectHierarchyTreeNode__icon').element as HTMLElement).style.color,
    '#aabbcc'
  )
})

test('Test that ProjectHierarchyTreeNode resyncs kind class when node kind changes', async () => {
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  document.body.appendChild(treeNode)

  const wrapper = mount(ProjectHierarchyTreeNode, {
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

  await wrapper.setProps({
    node: {
      ...baseNode,
      nodeKind: 'world'
    }
  })
  expect(treeNode.classList.contains('projectHierarchyTree-treeNode--world')).toBe(true)
  expect(treeNode.classList.contains('projectHierarchyTree-treeNode--group')).toBe(false)

  wrapper.unmount()
  treeNode.remove()
})

test('Test that ProjectHierarchyTreeNode resyncs kind class after template updates', async () => {
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  document.body.appendChild(treeNode)

  const wrapper = mount(ProjectHierarchyTreeNode, {
    attachTo: treeNode,
    props: {
      node: {
        ...baseNode,
        nodeKind: 'document',
        documentId: 'doc-1'
      },
      stat: {
        open: false
      }
    }
  })
  expect(treeNode.classList.contains('projectHierarchyTree-treeNode--document')).toBe(true)

  await wrapper.setProps({
    stat: {
      open: true
    }
  })
  expect(treeNode.classList.contains('projectHierarchyTree-treeNode--document')).toBe(true)

  wrapper.unmount()
  treeNode.remove()
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

test('Test that ProjectHierarchyTreeNode clears row kind class on unmount', () => {
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

  expect(wrapper.find('.projectHierarchyTreeNode--activeTabDocument').exists()).toBe(true)
  wrapper.unmount()
})
