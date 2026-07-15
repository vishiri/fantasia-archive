import { computed, ref, watch } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createUseDialogDeleteOpenedDocument } from '../functions/createUseDialogDeleteOpenedDocument'

const treeDocumentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentBackgroundColor: null,
  documentId: 'doc-missing',
  documentTextColor: null,
  groupId: 'group-1',
  hasChildren: false,
  icon: '',
  id: 'doc-missing',
  label: 'Saved Hero',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

function mountDeleteDialog (input: {
  pendingDeleteDocumentId?: string | null
  tabDisplayName?: string | null
  tabLabel?: string
  treeData?: I_faProjectHierarchyTreeHeTreeNode[]
} = {}) {
  const pendingDeleteDocumentId = ref<string | null>(input.pendingDeleteDocumentId ?? null)
  const confirmDeleteOpenedDocument = vi.fn(async () => undefined)
  const dismissPendingDelete = vi.fn()
  const findTabByDocumentId = vi.fn((documentId: string) => {
    if (input.tabDisplayName === null) {
      return null
    }
    return {
      displayNameDraft: input.tabDisplayName ?? documentId,
      tabLabel: input.tabLabel ?? 'Template'
    }
  })

  const useDialog = createUseDialogDeleteOpenedDocument({
    S_FaOpenedDocuments: () => ({
      confirmDeleteOpenedDocument,
      dismissPendingDelete,
      findTabByDocumentId
    }) as never,
    S_FaProjectHierarchyTree: () => ({
      treeData: input.treeData ?? []
    }),
    findProjectHierarchyTreeDocumentNodeByDocumentId: (treeData, documentId) => {
      return treeData.find((node) => node.documentId === documentId) ?? null
    },
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    ref: ref as <T>(value: T) => I_ref<T>,
    resolveOpenedDocumentTabListLabel: ({ displayNameDraft, tabLabel }) => {
      const draft = displayNameDraft.trim()
      if (draft.length > 0) {
        return draft
      }
      return tabLabel
    },
    storeToRefs: () => ({
      pendingDeleteDocumentId
    }) as never,
    watch: (source, effect) => {
      watch(source, effect, { immediate: true })
    }
  })

  return {
    api: useDialog(),
    confirmDeleteOpenedDocument,
    dismissPendingDelete,
    pendingDeleteDocumentId
  }
}

test('Test that delete dialog document name is empty when no tab is pending delete', () => {
  const { api } = mountDeleteDialog({ pendingDeleteDocumentId: null })
  expect(api.documentName.value).toBe('')
  expect(api.dialogOpen.value).toBe(false)
})

test('Test that delete dialog document name uses opened tab list label when available', () => {
  const { api } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-a',
    tabDisplayName: 'Chapter XXXVI – Battle of Feris Highlands',
    tabLabel: 'Chapter'
  })
  expect(api.documentName.value).toBe('Chapter XXXVI – Battle of Feris Highlands')
  expect(api.dialogOpen.value).toBe(true)
})

test('Test that delete dialog document name falls back to tab label when draft is blank', () => {
  const { api } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-a',
    tabDisplayName: '   ',
    tabLabel: 'Placeholder'
  })
  expect(api.documentName.value).toBe('Placeholder')
})

test('Test that delete dialog document name falls back to hierarchy tree label when tab is missing', () => {
  const { api } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-missing',
    tabDisplayName: null,
    treeData: [{
      ...treeDocumentNode
    }]
  })
  expect(api.documentName.value).toBe('Saved Hero')
})

test('Test that delete dialog document name falls back to document id when tab and tree node are missing', () => {
  const { api } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-missing',
    tabDisplayName: null
  })
  expect(api.documentName.value).toBe('doc-missing')
})

test('Test that onDialogHide dismisses pending delete when still set', () => {
  const { api, dismissPendingDelete } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-a'
  })
  api.onDialogHide()
  expect(dismissPendingDelete).toHaveBeenCalledTimes(1)
})

test('Test that onDialogHide is a no-op when no tab is pending delete', () => {
  const { api, dismissPendingDelete } = mountDeleteDialog({
    pendingDeleteDocumentId: null
  })
  api.onDialogHide()
  expect(dismissPendingDelete).not.toHaveBeenCalled()
})

test('Test that onConfirmDelete closes dialog and confirms delete for pending tab', () => {
  const { api, confirmDeleteOpenedDocument } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-a'
  })
  api.onConfirmDelete()
  expect(api.dialogOpen.value).toBe(false)
  expect(confirmDeleteOpenedDocument).toHaveBeenCalledWith('doc-a')
})

test('Test that onConfirmDelete is a no-op when no tab is pending delete', () => {
  const { api, confirmDeleteOpenedDocument } = mountDeleteDialog({
    pendingDeleteDocumentId: null
  })
  api.onConfirmDelete()
  expect(confirmDeleteOpenedDocument).not.toHaveBeenCalled()
})
