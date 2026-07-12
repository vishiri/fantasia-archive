import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { bindProjectHierarchyTreeAddNewDocumentLanguageRefresh } from '../projectHierarchyTreeAddNewDocumentLanguageRefreshWiring'

test('Test that add-new language refresh wiring updates labels when preferred language changes', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([
    {
      children: [
        {
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
          titlePluralTranslations: {
            'en-US': 'Characters',
            'de': 'Figuren'
          },
          titleSingularTranslations: {
            'en-US': 'Character',
            'de': 'Figur'
          },
          worldColor: '#336699',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      documentTemplateId: 'template-1',
      groupId: null,
      hasChildren: true,
      icon: 'mdi-account',
      id: 'placement-1',
      label: 'Characters',
      nodeKind: 'templatePlacement',
      placementId: 'placement-1',
      titlePluralTranslations: {
        'en-US': 'Characters',
        'de': 'Figuren'
      },
      titleSingularTranslations: {
        'en-US': 'Character',
        'de': 'Figur'
      },
      worldColor: '#336699',
      worldId: 'world-1'
    }
  ])
  let preferredLanguageCode: 'en-US' | 'de' = 'en-US'
  const stop = vi.fn()
  bindProjectHierarchyTreeAddNewDocumentLanguageRefresh({
    getPreferredLanguageCode: () => preferredLanguageCode,
    treeData,
    watch: ((_source: unknown, callback: () => void) => {
      callback()
      preferredLanguageCode = 'de'
      callback()
      return {
        pause: vi.fn(),
        resume: vi.fn(),
        stop
      }
    }) as never
  })
  const addNewNode = treeData.value[0]?.children[0]
  expect(addNewNode?.label).toBe('Add new figur')
  expect(stop).not.toHaveBeenCalled()
})
