import { expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { computed, nextTick, reactive, ref, watch } from 'vue'

import type {
  I_createUseDialogQuickSearchDocumentDeps,
  I_dialogQuickSearchDocumentSession
} from 'app/types/I_createUseDialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentDocumentSource } from 'app/types/I_dialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentWorldSource } from 'app/types/I_dialogQuickSearchDocument'

import {
  wireDialogQuickSearchDocumentOpenClose,
  wireDialogQuickSearchDocumentSelectHandlers
} from '../dialogQuickSearchDocumentInteractionWiring'

function makeSession (): I_dialogQuickSearchDocumentSession {
  return {
    dialogModel: ref(false),
    documentName: ref(''),
    documentOptions: computed(() => []),
    documentSelectRef: ref(null),
    documents: ref<I_dialogQuickSearchDocumentDocumentSource[]>([]),
    focusGeneration: ref(0),
    selectedDocumentId: ref<string | null>(null),
    selectedWorldId: ref<string | null>('world-a'),
    showWorldSelect: computed(() => false),
    skipNextWorldChangeReopen: ref(false),
    templateIconsById: ref(new Map()),
    worldOptions: computed(() => []),
    worlds: ref<I_dialogQuickSearchDocumentWorldSource[]>([])
  }
}

function makeDeps (
  overrides?: Partial<I_createUseDialogQuickSearchDocumentDeps>
): I_createUseDialogQuickSearchDocumentDeps {
  return {
    buildDocumentOptions: () => [],
    buildWorldOptions: () => [],
    computed,
    documentFocusMs: 0,
    isDialogQuickSearchDocumentDirectInput: (value) => value === 'QuickSearchDocument',
    isDialogQuickSearchDocumentStoreTarget: (value) => value === 'QuickSearchDocument',
    loadDocumentsForWorld: async () => [],
    loadQuickSearchDocumentSources: async () => ({
      templates: [],
      worlds: []
    }),
    nextTick,
    onBeforeUnmount: (hook) => {
      hook()
    },
    onMounted: () => undefined,
    pickFirstWorldId: () => null,
    pickWorldIdWithSavedPreference: ({ pickFirstWorldId, worlds }) => pickFirstWorldId(worlds),
    readDisableCloseAfterSelectQuickSearch: () => false,
    readLastSelectedWorldId: async () => null,
    ref,
    registerComponentDialogStackGuard: vi.fn(),
    resolveDialogComponentStoreOrNull: () => null,
    resolveDocumentOptionIcon: () => 'mdi-file-outline',
    resolvePreferredLanguageCode: () => 'en-US',
    resolveWorldOptionLabel: () => 'World',
    runDialogQuickSearchDocumentSession: () => ({} as never),
    runFaAction: vi.fn(),
    sleep: async () => undefined,
    watch,
    writeLastSelectedWorldId: async () => undefined,
    ...overrides
  }
}

/**
 * wireDialogQuickSearchDocumentSelectHandlers
 * Ignores empty / array / null document ids and duplicate pending opens.
 */
test('Test that onDocumentSelect guards empty ids and duplicate pending opens', async () => {
  const runFaAction = vi.fn()
  const closeDialog = vi.fn()
  const deps = makeDeps({ runFaAction })
  const session = makeSession()
  const { onDocumentSelect } = wireDialogQuickSearchDocumentSelectHandlers(deps, session, closeDialog)

  onDocumentSelect(null)
  expect(session.selectedDocumentId.value).toBeNull()

  onDocumentSelect('')
  expect(runFaAction).not.toHaveBeenCalled()

  onDocumentSelect([])
  expect(runFaAction).not.toHaveBeenCalled()

  onDocumentSelect({
    id: '',
    name: 'Empty'
  })
  expect(runFaAction).not.toHaveBeenCalled()

  onDocumentSelect({
    id: 'doc-a',
    name: 'Aria'
  })
  onDocumentSelect({
    id: 'doc-a',
    name: 'Aria'
  })
  await flushPromises()
  expect(runFaAction).toHaveBeenCalledTimes(1)
  expect(closeDialog).toHaveBeenCalledTimes(1)
})

/**
 * wireDialogQuickSearchDocumentSelectHandlers
 * World select clears documents when empty and skips reopen while hydrate skip flag is set.
 */
test('Test that onWorldSelect clears docs and skips reopen during hydrate', async () => {
  const loadDocumentsForWorld = vi.fn(async () => [{
    displayName: 'Aria',
    documentTextColor: null,
    id: 'doc-a',
    isCategory: false,
    sortOrder: 0,
    templateId: null
  }])
  const deps = makeDeps({ loadDocumentsForWorld })
  const session = makeSession()
  session.skipNextWorldChangeReopen.value = true
  session.documents.value = [{
    displayName: 'Keep',
    documentTextColor: null,
    id: 'doc-keep',
    isCategory: false,
    sortOrder: 0,
    templateId: null
  }]
  const { onWorldSelect } = wireDialogQuickSearchDocumentSelectHandlers(deps, session, vi.fn())

  onWorldSelect('')
  expect(session.selectedWorldId.value).toBeNull()
  expect(loadDocumentsForWorld).not.toHaveBeenCalled()

  session.skipNextWorldChangeReopen.value = false
  onWorldSelect(null)
  await flushPromises()
  expect(session.documents.value).toEqual([])
  expect(loadDocumentsForWorld).not.toHaveBeenCalled()
})

/**
 * wireDialogQuickSearchDocumentSelectHandlers
 * A slower document list from the previous world does not replace the current world's list.
 */
test('Test that onWorldSelect drops documents after the world changes', async () => {
  const resolvers: Array<(value: I_dialogQuickSearchDocumentDocumentSource[]) => void> = []
  const loadDocumentsForWorld = vi.fn(() => new Promise<I_dialogQuickSearchDocumentDocumentSource[]>((resolve) => {
    resolvers.push(resolve)
  }))
  const deps = makeDeps({ loadDocumentsForWorld })
  const session = makeSession()
  const { onWorldSelect } = wireDialogQuickSearchDocumentSelectHandlers(deps, session, vi.fn())
  const staleDocument: I_dialogQuickSearchDocumentDocumentSource = {
    displayName: 'From A',
    documentTextColor: null,
    id: 'doc-a',
    isCategory: false,
    sortOrder: 0,
    templateId: null
  }
  const currentDocument: I_dialogQuickSearchDocumentDocumentSource = {
    displayName: 'From B',
    documentTextColor: null,
    id: 'doc-b',
    isCategory: false,
    sortOrder: 0,
    templateId: null
  }

  onWorldSelect({
    id: 'world-a',
    name: 'A'
  })
  await Promise.resolve()
  onWorldSelect({
    id: 'world-b',
    name: 'B'
  })
  await Promise.resolve()
  const resolveWorldA = resolvers[0]
  const resolveWorldB = resolvers[1]
  if (resolveWorldA === undefined || resolveWorldB === undefined) {
    throw new Error('missing document resolvers')
  }
  resolveWorldA([staleDocument])
  await flushPromises()
  expect(session.documents.value).toEqual([])
  resolveWorldB([currentDocument])
  await flushPromises()
  expect(session.selectedWorldId.value).toBe('world-b')
  expect(session.documents.value).toEqual([currentDocument])
})

/**
 * wireDialogQuickSearchDocumentOpenClose
 * Aborts open when a newer focus generation supersedes in-flight hydrate.
 */
test('Test that openDialog aborts when focus generation is superseded', async () => {
  let resolveHydrate: (() => void) | undefined
  const deps = makeDeps({
    loadQuickSearchDocumentSources: () => new Promise((resolve) => {
      resolveHydrate = () => {
        resolve({
          templates: [],
          worlds: [{
            color: '#abc',
            displayNameTranslations: { 'en-US': 'World' },
            id: 'world-a',
            sortOrder: 0
          }]
        })
      }
    }),
    onMounted: () => undefined
  })
  const session = makeSession()
  const props = reactive<{ directInput?: 'QuickSearchDocument' | undefined }>({})
  wireDialogQuickSearchDocumentOpenClose(deps, session, props)

  props.directInput = 'QuickSearchDocument'
  await nextTick()
  expect(session.skipNextWorldChangeReopen.value).toBe(true)
  session.focusGeneration.value += 10
  resolveHydrate?.()
  await flushPromises()
  expect(session.dialogModel.value).toBe(false)
  expect(session.skipNextWorldChangeReopen.value).toBe(true)
})

/**
 * wireDialogQuickSearchDocumentOpenClose
 * A second open while the dialog is already showing does not get another @show,
 * so the world-change skip must clear when that hydrate finishes.
 */
test('Test that openDialog clears the world-change skip when the dialog is already open', async () => {
  let resolveHydrate: (() => void) | undefined
  const deps = makeDeps({
    loadQuickSearchDocumentSources: () => new Promise((resolve) => {
      resolveHydrate = () => {
        resolve({
          templates: [],
          worlds: []
        })
      }
    }),
    onBeforeUnmount: () => undefined,
    onMounted: () => undefined
  })
  const session = makeSession()
  session.dialogModel.value = true
  const props = reactive<{ directInput?: 'QuickSearchDocument' | undefined }>({})
  wireDialogQuickSearchDocumentOpenClose(deps, session, props)

  props.directInput = 'QuickSearchDocument'
  await nextTick()
  expect(session.skipNextWorldChangeReopen.value).toBe(true)
  resolveHydrate?.()
  await flushPromises()
  expect(session.dialogModel.value).toBe(true)
  expect(session.skipNextWorldChangeReopen.value).toBe(false)
})
/**
 * wireDialogQuickSearchDocumentOpenClose
 * Store UUID watch opens only for QuickSearchDocument; dialogModel false cancels focus.
 */
test('Test that openClose wiring opens from store and cancels focus on dialog close', async () => {
  const dialogStore = reactive<{
    dialogToOpen: string
    dialogUUID: string
  }>({
    dialogToOpen: 'AboutFantasiaArchive',
    dialogUUID: 'uuid-1'
  })
  const unmountHooks: Array<() => void> = []
  const deps = makeDeps({
    onBeforeUnmount: (hook) => {
      unmountHooks.push(hook)
    },
    resolveDialogComponentStoreOrNull: () => dialogStore as never
  })
  const session = makeSession()
  session.focusGeneration.value = 5
  const props = reactive<{ directInput?: 'QuickSearchDocument' | undefined }>({})

  const api = wireDialogQuickSearchDocumentOpenClose(deps, session, props)

  dialogStore.dialogToOpen = 'QuickSearchDocument'
  dialogStore.dialogUUID = 'uuid-2'
  await nextTick()
  await flushPromises()
  expect(session.dialogModel.value).toBe(true)
  expect(session.documentName.value).toBe('QuickSearchDocument')

  session.dialogModel.value = false
  await nextTick()
  expect(session.focusGeneration.value).toBeGreaterThan(5)

  const generationBeforeUnmount = session.focusGeneration.value
  unmountHooks.forEach((hook) => hook())
  expect(session.focusGeneration.value).toBeGreaterThan(generationBeforeUnmount)

  api.closeDialog()
  expect(session.dialogModel.value).toBe(false)
})

/**
 * wireDialogQuickSearchDocumentOpenClose
 * directInput prop watch opens when the value becomes QuickSearchDocument.
 */
test('Test that openClose wiring opens from directInput prop watch', async () => {
  const deps = makeDeps({
    onMounted: () => undefined
  })
  const session = makeSession()
  const props = reactive<{ directInput?: 'QuickSearchDocument' | undefined }>({})
  wireDialogQuickSearchDocumentOpenClose(deps, session, props)

  props.directInput = 'QuickSearchDocument'
  await nextTick()
  await flushPromises()
  expect(session.dialogModel.value).toBe(true)
  expect(session.documentName.value).toBe('QuickSearchDocument')
})

/**
 * wireDialogQuickSearchDocumentOpenClose
 * Still opens when worlds hydrate throws so the user is not stuck.
 */
test('Test that openDialog still opens when worlds hydrate fails', async () => {
  const deps = makeDeps({
    loadQuickSearchDocumentSources: async () => {
      throw new Error('worlds ipc failed')
    },
    onMounted: () => undefined
  })
  const session = makeSession()
  const props = reactive<{ directInput?: 'QuickSearchDocument' | undefined }>({})
  wireDialogQuickSearchDocumentOpenClose(deps, session, props)

  props.directInput = 'QuickSearchDocument'
  await nextTick()
  await flushPromises()
  expect(session.dialogModel.value).toBe(true)
})
