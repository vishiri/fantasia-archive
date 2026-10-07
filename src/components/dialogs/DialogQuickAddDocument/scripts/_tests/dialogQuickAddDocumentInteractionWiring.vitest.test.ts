import { expect, test, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { computed, nextTick, reactive, ref, watch } from 'vue'

import type {
  I_createUseDialogQuickAddDocumentDeps,
  I_dialogQuickAddDocumentSession
} from 'app/types/I_createUseDialogQuickAddDocument'
import type { I_dialogQuickAddDocumentTemplateSource } from 'app/types/I_dialogQuickAddDocument'
import type { I_dialogQuickAddDocumentWorldSource } from 'app/types/I_dialogQuickAddDocument'

import {
  wireDialogQuickAddDocumentOpenClose,
  wireDialogQuickAddDocumentSelectHandlers
} from '../dialogQuickAddDocumentInteractionWiring'

function makeSession (): I_dialogQuickAddDocumentSession {
  return {
    dialogModel: ref(false),
    documentName: ref(''),
    focusGeneration: ref(0),
    selectedTemplateId: ref<string | null>(null),
    selectedWorldId: ref<string | null>('world-a'),
    showWorldSelect: computed(() => false),
    skipNextWorldChangeReopen: ref(false),
    templateOptions: computed(() => [{
      icon: 'mdi-x',
      id: 'tpl-hero',
      name: 'Heroes'
    }]),
    templateSelectRef: ref(null),
    templatesById: ref(new Map<string, I_dialogQuickAddDocumentTemplateSource>([
      ['tpl-hero', {
        icon: 'mdi-x',
        id: 'tpl-hero',
        titlePluralTranslations: { 'en-US': 'Heroes' },
        titleSingularTranslations: { 'en-US': 'Hero' }
      }]
    ])),
    worldOptions: computed(() => []),
    worldSelectRef: ref(null),
    worlds: ref<I_dialogQuickAddDocumentWorldSource[]>([])
  }
}

function makeDeps (
  overrides?: Partial<I_createUseDialogQuickAddDocumentDeps>
): I_createUseDialogQuickAddDocumentDeps {
  return {
    buildTemplateOptions: () => [],
    buildWorldOptions: () => [],
    computed,
    createTemporaryDocument: vi.fn(async () => 'temp'),
    findWorldById: () => null,
    isDialogQuickAddDocumentDirectInput: (value) => value === 'QuickAddDocument',
    isDialogQuickAddDocumentStoreTarget: (value) => value === 'QuickAddDocument',
    loadQuickAddDocumentSources: async () => ({
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
    readLastSelectedWorldId: async () => null,
    ref,
    registerComponentDialogStackGuard: vi.fn(),
    reportTemporaryDocumentCreateFailure: vi.fn(),
    resolveDialogComponentStoreOrNull: () => null,
    resolveNewDocumentDisplayName: () => 'Heroes',
    resolvePreferredLanguageCode: () => 'en-US',
    resolveTemplateOptionLabel: () => 'Heroes',
    resolveWorldOptionLabel: () => 'World',
    runDialogQuickAddDocumentSession: () => ({} as never),
    sleep: async () => undefined,
    templateFocusMs: 0,
    watch,
    writeLastSelectedWorldId: async () => undefined,
    ...overrides
  }
}

/**
 * wireDialogQuickAddDocumentOpenClose
 * A second open while the dialog is already showing does not get another @show,
 * so the world-change skip must clear when that hydrate finishes.
 * An older hydrate must not clear the skip a newer open still needs.
 */
test('Test that a superseded Quick Add open leaves the newer world-change skip set', async () => {
  const resolvers: Array<() => void> = []
  const deps = makeDeps({
    loadQuickAddDocumentSources: () => new Promise((resolve) => {
      resolvers.push(() => {
        resolve({
          templates: [],
          worlds: []
        })
      })
    }),
    onBeforeUnmount: () => undefined,
    onMounted: () => undefined
  })
  const session = makeSession()
  session.dialogModel.value = true
  const props = reactive<{ directInput?: 'QuickAddDocument' | undefined }>({})
  wireDialogQuickAddDocumentOpenClose(deps, session, props)

  props.directInput = 'QuickAddDocument'
  await nextTick()
  props.directInput = undefined
  await nextTick()
  props.directInput = 'QuickAddDocument'
  await nextTick()
  expect(session.skipNextWorldChangeReopen.value).toBe(true)
  resolvers[0]?.()
  await flushPromises()
  expect(session.skipNextWorldChangeReopen.value).toBe(true)
  resolvers[1]?.()
  await flushPromises()
  expect(session.dialogModel.value).toBe(true)
  expect(session.skipNextWorldChangeReopen.value).toBe(false)
})

/**
 * wireDialogQuickAddDocumentSelectHandlers
 * Ignores empty template ids and missing world / option rows.
 */
test('Test that onTemplateSelect guards empty id missing world and unknown option', async () => {
  const createTemporaryDocument = vi.fn(async () => 'temp')
  const deps = makeDeps({ createTemporaryDocument })
  const session = makeSession()
  const closeDialog = vi.fn()
  const { onTemplateSelect } = wireDialogQuickAddDocumentSelectHandlers(deps, session, closeDialog)

  await onTemplateSelect(null)
  expect(session.selectedTemplateId.value).toBeNull()

  await onTemplateSelect('')
  expect(createTemporaryDocument).not.toHaveBeenCalled()

  session.selectedWorldId.value = null
  await onTemplateSelect('tpl-hero')
  expect(createTemporaryDocument).not.toHaveBeenCalled()

  session.selectedWorldId.value = 'world-a'
  await onTemplateSelect('missing-tpl')
  expect(createTemporaryDocument).not.toHaveBeenCalled()
  expect(closeDialog).not.toHaveBeenCalled()
})

/**
 * wireDialogQuickAddDocumentSelectHandlers
 * Closes the dialog before awaiting create (FA 1.0 close-first snappiness).
 */
test('Test that onTemplateSelect closes dialog before createTemporaryDocument', async () => {
  const callOrder: string[] = []
  const createTemporaryDocument = vi.fn(async () => {
    callOrder.push('create')
    return 'temp'
  })
  const closeDialog = vi.fn(() => {
    callOrder.push('close')
  })
  const deps = makeDeps({ createTemporaryDocument })
  const session = makeSession()
  const { onTemplateSelect } = wireDialogQuickAddDocumentSelectHandlers(deps, session, closeDialog)

  await onTemplateSelect({
    id: 'tpl-hero',
    name: 'Heroes'
  })
  expect(callOrder).toEqual(['close', 'create'])
  expect(createTemporaryDocument).toHaveBeenCalledWith({
    displayName: 'Heroes',
    templateId: 'tpl-hero',
    worldId: 'world-a'
  })
})

/**
 * wireDialogQuickAddDocumentSelectHandlers
 * Create failure after close is reported and does not stick the in-flight guard.
 */
test('Test that onTemplateSelect reports a create failure and allows another select', async () => {
  const createError = new Error('Could not create the document.')
  const createTemporaryDocument = vi.fn(async (): Promise<string> => 'temp-2')
  createTemporaryDocument.mockRejectedValueOnce(createError)
  const reportTemporaryDocumentCreateFailure = vi.fn()
  const closeDialog = vi.fn()
  const deps = makeDeps({
    createTemporaryDocument,
    reportTemporaryDocumentCreateFailure
  })
  const session = makeSession()
  const { onTemplateSelect } = wireDialogQuickAddDocumentSelectHandlers(deps, session, closeDialog)
  const templateValue = {
    id: 'tpl-hero',
    name: 'Heroes'
  }

  await expect(onTemplateSelect(templateValue)).resolves.toBeUndefined()
  expect(closeDialog).toHaveBeenCalledTimes(1)
  expect(reportTemporaryDocumentCreateFailure).toHaveBeenCalledWith(createError)

  await onTemplateSelect(templateValue)
  expect(createTemporaryDocument).toHaveBeenCalledTimes(2)
})

/**
 * wireDialogQuickAddDocumentSelectHandlers
 * A second template pick while create is running does not add another document.
 */
test('Test that a second template select is ignored while create is in flight', async () => {
  let releaseCreate: (() => void) | undefined
  const createGate = new Promise<string>((resolve) => {
    releaseCreate = () => {
      resolve('temp')
    }
  })
  const createTemporaryDocument = vi.fn(() => createGate)
  const closeDialog = vi.fn()
  const deps = makeDeps({ createTemporaryDocument })
  const session = makeSession()
  const { onTemplateSelect } = wireDialogQuickAddDocumentSelectHandlers(deps, session, closeDialog)
  const templateValue = {
    id: 'tpl-hero',
    name: 'Heroes'
  }
  const firstSelect = onTemplateSelect(templateValue)
  const secondSelect = onTemplateSelect(templateValue)
  await Promise.resolve()
  expect(createTemporaryDocument).toHaveBeenCalledTimes(1)
  const finishCreate = releaseCreate
  if (finishCreate === undefined) {
    throw new Error('missing create resolver')
  }
  finishCreate()
  await firstSelect
  await secondSelect
  expect(createTemporaryDocument).toHaveBeenCalledTimes(1)
  expect(closeDialog).toHaveBeenCalledTimes(1)
})

/**
 * wireDialogQuickAddDocumentSelectHandlers
 * World select clears template and skips reopen while hydrate skip flag is set.
 */
test('Test that onWorldSelect clears template and skips reopen during hydrate', () => {
  const sleep = vi.fn(async () => undefined)
  const deps = makeDeps({ sleep })
  const session = makeSession()
  session.skipNextWorldChangeReopen.value = true
  session.selectedTemplateId.value = 'tpl-hero'
  const { onWorldSelect } = wireDialogQuickAddDocumentSelectHandlers(deps, session, vi.fn())

  onWorldSelect('')
  expect(session.selectedWorldId.value).toBeNull()
  expect(session.selectedTemplateId.value).toBeNull()
  expect(sleep).not.toHaveBeenCalled()
})

/**
 * wireDialogQuickAddDocumentSelectHandlers
 * Same world id still schedules template open (re-click selected world).
 */
test('Test that onWorldSelect schedules template focus when world id unchanged', async () => {
  const openPopup = vi.fn()
  const deps = makeDeps({
    sleep: async () => undefined,
    templateFocusMs: 0
  })
  const session = makeSession()
  session.selectedWorldId.value = 'world-a'
  session.dialogModel.value = true
  session.templateSelectRef.value = { openPopup }
  const { onWorldSelect } = wireDialogQuickAddDocumentSelectHandlers(deps, session, vi.fn())

  onWorldSelect({
    id: 'world-a',
    name: 'Earth'
  })
  await flushPromises()
  expect(session.selectedWorldId.value).toBe('world-a')
  expect(openPopup).toHaveBeenCalledTimes(2)
})

/**
 * wireDialogQuickAddDocumentOpenClose
 * Store UUID watch opens only for QuickAddDocument; dialogModel false cancels focus generation.
 */
test('Test that Quick Add still opens when world hydrate fails', async () => {
  const deps = makeDeps({
    loadQuickAddDocumentSources: async () => {
      throw new Error('worlds down')
    }
  })
  const session = makeSession()
  const props = reactive<{ directInput?: 'QuickAddDocument' }>({})
  wireDialogQuickAddDocumentOpenClose(deps, session, props)
  props.directInput = 'QuickAddDocument'
  await flushPromises()
  expect(session.dialogModel.value).toBe(true)
})

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
  const props: { directInput?: 'QuickAddDocument' | undefined } = {}

  const api = wireDialogQuickAddDocumentOpenClose(deps, session, props)

  dialogStore.dialogToOpen = 'QuickAddDocument'
  dialogStore.dialogUUID = 'uuid-2'
  await nextTick()
  await flushPromises()
  expect(session.dialogModel.value).toBe(true)
  expect(session.documentName.value).toBe('QuickAddDocument')

  session.dialogModel.value = false
  await nextTick()
  expect(session.focusGeneration.value).toBeGreaterThan(5)

  const generationBeforeUnmount = session.focusGeneration.value
  unmountHooks.forEach((hook) => hook())
  expect(session.focusGeneration.value).toBeGreaterThan(generationBeforeUnmount)

  api.closeDialog()
  expect(session.dialogModel.value).toBe(false)
})
