import { computed, ref, watch } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import { createUseDialogDiscardOpenedDocumentTab } from '../functions/createUseDialogDiscardOpenedDocumentTab'

function mountDiscardDialog (input: {
  pendingCloseDocumentId?: string | null
  savedDisplayName?: string
  tabDisplayName?: string | null
  tabLabel?: string
} = {}) {
  const pendingCloseDocumentId = ref<string | null>(input.pendingCloseDocumentId ?? null)
  const confirmDiscardAndClose = vi.fn(async () => undefined)
  const dismissPendingClose = vi.fn()
  const findTabByDocumentId = vi.fn((documentId: string) => {
    if (input.tabDisplayName === null) {
      return null
    }
    return {
      displayNameDraft: input.tabDisplayName ?? documentId,
      savedDisplayName: input.savedDisplayName ?? '',
      tabLabel: input.tabLabel ?? ''
    }
  })

  const useDialog = createUseDialogDiscardOpenedDocumentTab({
    S_FaOpenedDocuments: () => ({
      confirmDiscardAndClose,
      dismissPendingClose,
      findTabByDocumentId
    }) as never,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    ref: ref as <T>(value: T) => I_ref<T>,
    storeToRefs: () => ({
      pendingCloseDocumentId
    }) as never,
    watch: (source, effect) => {
      watch(source, effect, { immediate: true })
    }
  })

  return {
    api: useDialog(),
    confirmDiscardAndClose,
    dismissPendingClose,
    pendingCloseDocumentId
  }
}

test('Test that discard dialog opens when a close is already pending before the watch runs', () => {
  const pendingCloseDocumentId = ref<string | null>('doc-a')
  const useDialog = createUseDialogDiscardOpenedDocumentTab({
    S_FaOpenedDocuments: () => ({
      confirmDiscardAndClose: vi.fn(async () => undefined),
      dismissPendingClose: vi.fn(),
      findTabByDocumentId: () => ({
        displayNameDraft: 'Hero draft',
        savedDisplayName: 'Hero',
        tabLabel: 'Character'
      })
    }) as never,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    ref: ref as <T>(value: T) => I_ref<T>,
    storeToRefs: () => ({
      pendingCloseDocumentId
    }) as never,
    watch: () => undefined
  })

  const api = useDialog()
  expect(api.dialogOpen.value).toBe(true)
  expect(api.documentName.value).toBe('Hero draft')
})

test('Test that discard dialog document name is empty when no tab is pending close', () => {
  const { api } = mountDiscardDialog({ pendingCloseDocumentId: null })
  expect(api.documentName.value).toBe('')
  expect(api.dialogOpen.value).toBe(false)
})

test('Test that discard dialog document name uses tab draft name when available', () => {
  const { api } = mountDiscardDialog({
    pendingCloseDocumentId: 'doc-a',
    tabDisplayName: 'Hero draft'
  })
  expect(api.documentName.value).toBe('Hero draft')
  expect(api.dialogOpen.value).toBe(true)
})

test('Test that discard dialog document name uses the saved name when the draft is blank', () => {
  const { api } = mountDiscardDialog({
    pendingCloseDocumentId: 'doc-a',
    savedDisplayName: 'Hero',
    tabDisplayName: '   ',
    tabLabel: 'Character'
  })
  expect(api.documentName.value).toBe('Hero')
})

test('Test that discard dialog document name uses the tab label when drafts are blank', () => {
  const { api } = mountDiscardDialog({
    pendingCloseDocumentId: 'doc-a',
    savedDisplayName: '   ',
    tabDisplayName: ' ',
    tabLabel: 'Character'
  })
  expect(api.documentName.value).toBe('Character')
})

test('Test that discard dialog document name uses the document id when every label is blank', () => {
  const { api } = mountDiscardDialog({
    pendingCloseDocumentId: 'doc-a',
    savedDisplayName: '',
    tabDisplayName: '',
    tabLabel: '   '
  })
  expect(api.documentName.value).toBe('doc-a')
})

test('Test that discard dialog document name falls back to document id when tab is missing', () => {
  const { api } = mountDiscardDialog({
    pendingCloseDocumentId: 'doc-missing',
    tabDisplayName: null
  })
  expect(api.documentName.value).toBe('doc-missing')
})

test('Test that onDialogHide dismisses pending close when still set', () => {
  const { api, dismissPendingClose } = mountDiscardDialog({
    pendingCloseDocumentId: 'doc-a'
  })
  api.onDialogHide()
  expect(dismissPendingClose).toHaveBeenCalledTimes(1)
})

test('Test that onDialogHide is a no-op when no tab is pending close', () => {
  const { api, dismissPendingClose } = mountDiscardDialog({
    pendingCloseDocumentId: null
  })
  api.onDialogHide()
  expect(dismissPendingClose).not.toHaveBeenCalled()
})

test('Test that onConfirmDiscard closes dialog and confirms discard for pending tab', () => {
  const { api, confirmDiscardAndClose } = mountDiscardDialog({
    pendingCloseDocumentId: 'doc-a'
  })
  api.onConfirmDiscard()
  expect(api.dialogOpen.value).toBe(false)
  expect(confirmDiscardAndClose).toHaveBeenCalledWith('doc-a')
})

test('Test that onConfirmDiscard ignores when no tab is pending close', () => {
  const { api, confirmDiscardAndClose } = mountDiscardDialog({
    pendingCloseDocumentId: null
  })
  api.onConfirmDiscard()
  expect(confirmDiscardAndClose).not.toHaveBeenCalled()
})
