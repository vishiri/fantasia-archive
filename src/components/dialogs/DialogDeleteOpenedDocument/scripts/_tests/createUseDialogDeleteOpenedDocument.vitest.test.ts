import { computed, nextTick, ref, watch } from 'vue'
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
      watch(source, effect)
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

test('Test that delete dialog document name uses the stored document when the tree row is not loaded', async () => {
  const readDocumentDisplayName = vi.fn(async () => ' Hidden Hero ')
  const pendingDeleteDocumentId = ref<string | null>('doc-hidden')
  const useDialog = createUseDialogDeleteOpenedDocument({
    S_FaOpenedDocuments: () => ({
      confirmDeleteOpenedDocument: vi.fn(async () => undefined),
      dismissPendingDelete: vi.fn(),
      findTabByDocumentId: () => null
    }) as never,
    S_FaProjectHierarchyTree: () => ({
      treeData: []
    }),
    findProjectHierarchyTreeDocumentNodeByDocumentId: () => null,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    readDocumentDisplayName,
    ref: ref as <T>(value: T) => I_ref<T>,
    resolveOpenedDocumentTabListLabel: ({ displayNameDraft }) => displayNameDraft,
    storeToRefs: () => ({
      pendingDeleteDocumentId
    }) as never,
    watch: (source, effect) => {
      watch(source, effect)
    }
  })
  const api = useDialog()
  expect(api.documentName.value).toBe('doc-hidden')
  await Promise.resolve()
  await Promise.resolve()
  expect(readDocumentDisplayName).toHaveBeenCalledWith('doc-hidden')
  expect(api.documentName.value).toBe('Hidden Hero')
})

test('Test that delete dialog ignores a name read error after the pending document changes', async () => {
  let rejectRead: (error: Error) => void = () => {}
  const readDocumentDisplayName = vi.fn(() => new Promise<string | null>((_resolve, reject) => {
    rejectRead = reject
  }))
  const reportDocumentNameReadError = vi.fn()
  const pendingDeleteDocumentId = ref<string | null>('doc-hidden')
  const useDialog = createUseDialogDeleteOpenedDocument({
    S_FaOpenedDocuments: () => ({
      confirmDeleteOpenedDocument: vi.fn(async () => undefined),
      dismissPendingDelete: vi.fn(),
      findTabByDocumentId: () => null
    }) as never,
    S_FaProjectHierarchyTree: () => ({
      treeData: []
    }),
    findProjectHierarchyTreeDocumentNodeByDocumentId: () => null,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    readDocumentDisplayName,
    reportDocumentNameReadError,
    ref: ref as <T>(value: T) => I_ref<T>,
    resolveOpenedDocumentTabListLabel: ({ displayNameDraft }) => displayNameDraft,
    storeToRefs: () => ({
      pendingDeleteDocumentId
    }) as never,
    watch: (source, effect) => {
      watch(source, effect)
    }
  })
  useDialog()
  pendingDeleteDocumentId.value = 'doc-other'
  rejectRead(new Error('name read failed'))
  await Promise.resolve()
  expect(reportDocumentNameReadError).not.toHaveBeenCalled()
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

test('Test that onConfirmDelete confirms delete and closes when the pending id clears', async () => {
  const { api, confirmDeleteOpenedDocument, pendingDeleteDocumentId } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-a'
  })
  confirmDeleteOpenedDocument.mockImplementation(async () => {
    pendingDeleteDocumentId.value = null
    return undefined
  })
  api.onConfirmDelete()
  expect(confirmDeleteOpenedDocument).toHaveBeenCalledWith('doc-a')
  await nextTick()
  expect(api.dialogOpen.value).toBe(false)
})

test('Test that onConfirmDelete keeps the dialog open when delete is still running', async () => {
  let resolveDelete: ((value: undefined) => void) | undefined
  const { api, confirmDeleteOpenedDocument, dismissPendingDelete } = mountDeleteDialog({
    pendingDeleteDocumentId: 'doc-a'
  })
  confirmDeleteOpenedDocument.mockImplementation(() => {
    return new Promise<undefined>((resolve) => {
      resolveDelete = resolve
    })
  })
  api.onConfirmDelete()
  api.onConfirmDelete()
  api.onDialogHide()
  expect(confirmDeleteOpenedDocument).toHaveBeenCalledTimes(1)
  expect(dismissPendingDelete).not.toHaveBeenCalled()
  expect(api.dialogOpen.value).toBe(true)
  resolveDelete?.(undefined)
  await Promise.resolve()
  api.onDialogHide()
  expect(dismissPendingDelete).toHaveBeenCalledTimes(1)
})

test('Test that onConfirmDelete is a no-op when no tab is pending delete', () => {
  const { api, confirmDeleteOpenedDocument } = mountDeleteDialog({
    pendingDeleteDocumentId: null
  })
  api.onConfirmDelete()
  expect(confirmDeleteOpenedDocument).not.toHaveBeenCalled()
})
