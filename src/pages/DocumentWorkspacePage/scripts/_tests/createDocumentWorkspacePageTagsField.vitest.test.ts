import { expect, test, vi } from 'vitest'
import { computed, ref } from 'vue'

import { createDocumentWorkspacePageTagsField } from '../functions/createDocumentWorkspacePageTagsField'

test('createDocumentWorkspacePageTagsField maps draft to model and persists updates', () => {
  const updateTagsDraft = vi.fn()
  const documentTab = computed(() => {
    return {
      editState: true,
      tagsDraft: [{
        id: 't1',
        name: 'Heroes'
      }],
      worldId: 'world-1'
    } as never
  })
  const api = createDocumentWorkspacePageTagsField({
    computed,
    documentTab,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    listTagsForWorld: vi.fn(async () => [{
      id: 't1',
      name: 'Heroes'
    }]),
    ref,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-1'),
    updateTagsDraft
  })

  expect(api.tagsFieldLabel.value).toBe('documentWorkspacePage.tagsFieldLabel')
  expect(api.tagsFieldReadOnly.value).toBe(false)
  expect(api.tagsModel.value).toEqual([{
    id: 't1',
    name: 'Heroes'
  }])
  api.tagsModel.value = [{
    id: 't2',
    name: 'Places',
    isNew: true
  }]
  expect(updateTagsDraft).toHaveBeenCalledWith('doc-1', [
    {
      id: 't2',
      isNew: true,
      name: 'Places'
    }
  ])
})

test('createDocumentWorkspacePageTagsField is read-only in preview', () => {
  const api = createDocumentWorkspacePageTagsField({
    computed,
    documentTab: computed(() => {
      return {
        editState: false,
        tagsDraft: [],
        worldId: 'world-1'
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    listTagsForWorld: vi.fn(async () => []),
    ref,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-1'),
    updateTagsDraft: vi.fn()
  })
  expect(api.tagsFieldReadOnly.value).toBe(true)
})
