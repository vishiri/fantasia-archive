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

test('Test that createDocumentWorkspacePageTagsField ignores writes while tags are unloaded', () => {
  const updateTagsDraft = vi.fn()
  const api = createDocumentWorkspacePageTagsField({
    computed,
    documentTab: computed(() => {
      return {
        editState: true,
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
    updateTagsDraft
  })
  expect(api.tagsFieldReadOnly.value).toBe(true)
  expect(api.tagsModel.value).toEqual([])
  api.tagsModel.value = []
  expect(updateTagsDraft).not.toHaveBeenCalled()
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

test('Test that createDocumentWorkspacePageTagsField drops options after the world changes', async () => {
  const worldId = ref('world-1')
  let resolveList: (items: Array<{ id: string, name: string }>) => void = () => {}
  const pendingItems = new Promise<Array<{ id: string, name: string }>>((resolve) => {
    resolveList = resolve
  })
  const api = createDocumentWorkspacePageTagsField({
    computed,
    documentTab: computed(() => {
      return {
        editState: true,
        tagsDraft: [],
        worldId: worldId.value
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    listTagsForWorld: vi.fn(() => pendingItems),
    ref,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-1'),
    updateTagsDraft: vi.fn()
  })
  api.onTagsRequestOptions()
  worldId.value = 'world-2'
  resolveList([{
    id: 'alien',
    name: 'Alien'
  }])
  await Promise.resolve()
  expect(api.tagsOptions.value).toEqual([])
})

test('Test that createDocumentWorkspacePageTagsField clears options when the next request is another world', async () => {
  let resolveNext: (items: Array<{ id: string, name: string }>) => void = () => {}
  const nextItems = new Promise<Array<{ id: string, name: string }>>((resolve) => {
    resolveNext = resolve
  })
  const worldId = ref('world-1')
  const listTagsForWorld = vi.fn()
    .mockResolvedValueOnce([{
      id: 'from-world-1',
      name: 'From world 1'
    }])
    .mockReturnValueOnce(nextItems)
  const api = createDocumentWorkspacePageTagsField({
    computed,
    documentTab: computed(() => {
      return {
        editState: true,
        tagsDraft: [],
        worldId: worldId.value
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    listTagsForWorld,
    ref,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-2'),
    updateTagsDraft: vi.fn()
  })
  api.onTagsRequestOptions()
  await Promise.resolve()
  expect(api.tagsOptions.value).toEqual([{
    id: 'from-world-1',
    name: 'From world 1'
  }])
  worldId.value = 'world-2'
  api.onTagsRequestOptions()
  expect(api.tagsOptions.value).toEqual([])
  resolveNext([{
    id: 'from-world-2',
    name: 'From world 2'
  }])
  await Promise.resolve()
  expect(api.tagsOptions.value).toEqual([{
    id: 'from-world-2',
    name: 'From world 2'
  }])
})

test('Test that createDocumentWorkspacePageTagsField ignores a stale tag list response', async () => {
  let resolveSlow: (items: Array<{ id: string, name: string }>) => void = () => {}
  const slowItems = new Promise<Array<{ id: string, name: string }>>((resolve) => {
    resolveSlow = resolve
  })
  const listTagsForWorld = vi.fn()
    .mockReturnValueOnce(slowItems)
    .mockResolvedValueOnce([{
      id: 'fresh',
      name: 'Fresh'
    }])
  const api = createDocumentWorkspacePageTagsField({
    computed,
    documentTab: computed(() => {
      return {
        editState: true,
        tagsDraft: [],
        worldId: 'world-1'
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    listTagsForWorld,
    ref,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-1'),
    updateTagsDraft: vi.fn()
  })
  api.onTagsRequestOptions()
  api.onTagsRequestOptions()
  await Promise.resolve()
  expect(api.tagsOptions.value).toEqual([{
    id: 'fresh',
    name: 'Fresh'
  }])
  resolveSlow([{
    id: 'stale',
    name: 'Stale'
  }])
  await Promise.resolve()
  expect(api.tagsOptions.value).toEqual([{
    id: 'fresh',
    name: 'Fresh'
  }])
})

test('Test that createDocumentWorkspacePageTagsField clears options when the tag list fails', async () => {
  const api = createDocumentWorkspacePageTagsField({
    computed,
    documentTab: computed(() => {
      return {
        editState: true,
        tagsDraft: [],
        worldId: 'world-1'
      } as never
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    listTagsForWorld: vi.fn(async () => {
      throw new Error('tags down')
    }),
    ref,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    routeDocumentId: computed(() => 'doc-1'),
    updateTagsDraft: vi.fn()
  })
  api.tagsOptions.value = [{
    id: 'stale',
    name: 'Stale'
  }]
  api.onTagsRequestOptions()
  await Promise.resolve()
  await Promise.resolve()
  expect(api.tagsOptions.value).toEqual([])
})
