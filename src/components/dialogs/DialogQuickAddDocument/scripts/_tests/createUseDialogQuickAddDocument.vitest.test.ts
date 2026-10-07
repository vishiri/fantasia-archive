import { computed, nextTick, ref, watch } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { I_createUseDialogQuickAddDocumentDeps } from 'app/types/I_createUseDialogQuickAddDocument'
import type { I_dialogQuickAddDocumentTemplateSource } from 'app/types/I_dialogQuickAddDocument'
import type { I_dialogQuickAddDocumentWorldSource } from 'app/types/I_dialogQuickAddDocument'

import { runDialogQuickAddDocumentSession } from '../dialogQuickAddDocumentSessionWiring'
import { createUseDialogQuickAddDocument } from '../functions/createUseDialogQuickAddDocument'
import {
  buildDialogQuickAddDocumentTemplateOptions,
  buildDialogQuickAddDocumentWorldOptions,
  findDialogQuickAddDocumentWorldById,
  pickFirstDialogQuickAddDocumentWorldId
} from '../functions/dialogQuickAddDocumentOptions'
import {
  isDialogQuickAddDocumentDirectInput,
  isDialogQuickAddDocumentStoreTarget
} from '../functions/dialogQuickAddDocumentDialogInput'

function makeWorld (
  id: string,
  sortOrder: number,
  templateIds: string[]
): I_dialogQuickAddDocumentWorldSource {
  return {
    color: '#2196f3',
    displayNameTranslations: { 'en-US': id },
    id,
    sortOrder,
    templateLayout: {
      groups: [],
      placements: templateIds.map((documentTemplateId, index) => ({
        documentTemplateId,
        groupId: null,
        groupSortOrder: null,
        rootSortOrder: index
      }))
    }
  }
}

function makeTemplate (id: string, plural: string): I_dialogQuickAddDocumentTemplateSource {
  return {
    icon: `mdi-${id}`,
    id,
    titlePluralTranslations: { 'en-US': plural },
    titleSingularTranslations: { 'en-US': plural }
  }
}

function createDeps (overrides?: Partial<I_createUseDialogQuickAddDocumentDeps>): {
  createTemporaryDocument: ReturnType<typeof vi.fn>
  deps: I_createUseDialogQuickAddDocumentDeps
  openPopupCalls: { count: number }
} {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc')
  const openPopupCalls = { count: 0 }
  const worlds = [
    makeWorld('world-b', 1, ['tpl-place']),
    makeWorld('world-a', 0, ['tpl-hero'])
  ]
  const templates = [
    makeTemplate('tpl-hero', 'Heroes'),
    makeTemplate('tpl-place', 'Places')
  ]
  const dialogStore = {
    dialogToOpen: 'QuickAddDocument' as const,
    dialogUUID: 'uuid-1'
  }
  const deps: I_createUseDialogQuickAddDocumentDeps = {
    buildTemplateOptions: buildDialogQuickAddDocumentTemplateOptions,
    buildWorldOptions: buildDialogQuickAddDocumentWorldOptions,
    computed,
    createTemporaryDocument,
    findWorldById: findDialogQuickAddDocumentWorldById,
    isDialogQuickAddDocumentDirectInput,
    isDialogQuickAddDocumentStoreTarget,
    loadQuickAddDocumentSources: async () => ({
      templates,
      worlds
    }),
    nextTick,
    onBeforeUnmount: () => undefined,
    onMounted: (hook) => {
      hook()
    },
    pickFirstWorldId: pickFirstDialogQuickAddDocumentWorldId,
    pickWorldIdWithSavedPreference: ({ worlds, savedWorldId, pickFirstWorldId }) => {
      if (savedWorldId !== null && savedWorldId.length > 0) {
        const match = worlds.find((world) => world.id === savedWorldId)
        if (match !== undefined) {
          return match.id
        }
      }
      return pickFirstWorldId(worlds)
    },
    readLastSelectedWorldId: async () => null,
    ref,
    registerComponentDialogStackGuard: vi.fn(),
    reportTemporaryDocumentCreateFailure: vi.fn(),
    resolveDialogComponentStoreOrNull: () => dialogStore,
    resolveNewDocumentDisplayName: () => 'Heroes',
    resolvePreferredLanguageCode: () => 'en-US',
    resolveTemplateOptionLabel: (template) => {
      return template.titlePluralTranslations['en-US'] ?? template.id
    },
    resolveWorldOptionLabel: (translations) => translations['en-US'] ?? '',
    runDialogQuickAddDocumentSession,
    sleep: async () => undefined,
    templateFocusMs: 0,
    watch,
    writeLastSelectedWorldId: async () => undefined,
    ...overrides
  }
  return {
    createTemporaryDocument,
    deps,
    openPopupCalls
  }
}

/**
 * isDialogQuickAddDocumentDirectInput / isDialogQuickAddDocumentStoreTarget
 * Guard QuickAddDocument store and prop open paths.
 */
test('Test that dialogQuickAddDocumentDialogInput matchers accept only QuickAddDocument', () => {
  expect(isDialogQuickAddDocumentDirectInput('QuickAddDocument')).toBe(true)
  expect(isDialogQuickAddDocumentDirectInput('NewProject')).toBe(false)
  expect(isDialogQuickAddDocumentStoreTarget('QuickAddDocument')).toBe(true)
  expect(isDialogQuickAddDocumentStoreTarget('AboutFantasiaArchive')).toBe(false)
})

/**
 * createUseDialogQuickAddDocument
 * Opens via directInput, hydrates worlds, and creates a temporary document on template pick.
 */
test('Test that createUseDialogQuickAddDocument creates temporary document then closes', async () => {
  const { createTemporaryDocument, deps, openPopupCalls } = createDeps()
  const useDialog = createUseDialogQuickAddDocument(deps)
  const api = useDialog({ directInput: 'QuickAddDocument' })
  await flushPromises()

  expect(api.dialogModel.value).toBe(true)
  expect(api.selectedWorldId.value).toBe('world-a')
  expect(api.showWorldSelect.value).toBe(true)
  expect(api.worldOptions.value.map((row) => row.id)).toEqual(['world-a', 'world-b'])

  api.templateSelectRef.value = {
    openPopup: (): void => {
      openPopupCalls.count += 1
    }
  }
  api.onDialogShow()
  await flushPromises()

  expect(openPopupCalls.count).toBeGreaterThan(0)

  await api.onTemplateSelect({
    id: 'tpl-hero',
    name: 'Heroes'
  })
  expect(createTemporaryDocument).toHaveBeenCalledWith({
    displayName: 'Heroes',
    templateId: 'tpl-hero',
    worldId: 'world-a'
  })
  expect(api.dialogModel.value).toBe(false)
})

/**
 * createUseDialogQuickAddDocument
 * World change clears template and re-opens the template select after hydrate skip flag clears.
 */
test('Test that createUseDialogQuickAddDocument world change clears template and reopens popup', async () => {
  const { deps, openPopupCalls } = createDeps({
    onMounted: () => undefined
  })
  const useDialog = createUseDialogQuickAddDocument(deps)
  const api = useDialog({})
  api.dialogModel.value = true
  api.templateSelectRef.value = {
    openPopup: (): void => {
      openPopupCalls.count += 1
    }
  }
  api.onDialogShow()
  await flushPromises()

  openPopupCalls.count = 0
  api.onWorldSelect({
    id: 'world-b',
    name: 'world-b'
  })
  await flushPromises()

  expect(api.selectedWorldId.value).toBe('world-b')
  expect(api.selectedTemplateId.value).toBeNull()
  expect(openPopupCalls.count).toBeGreaterThan(0)
  api.onDialogHide()
  expect(api.selectedWorldId.value).toBeNull()
})

/**
 * runDialogQuickAddDocumentSession selectedWorldOption / selectedTemplateOption
 * Null ids and unmatched ids yield null; matching ids resolve option rows from world/template lists.
 */
test('Test that runDialogQuickAddDocumentSession selected options resolve and null out', async () => {
  const { deps } = createDeps({
    onMounted: () => undefined
  })
  const useDialog = createUseDialogQuickAddDocument(deps)
  const api = useDialog({})

  expect(api.selectedWorldOption.value).toBeNull()
  expect(api.selectedTemplateOption.value).toBeNull()

  api.dialogModel.value = true
  api.onDialogShow()
  await flushPromises()

  expect(api.selectedWorldId.value).toBe('world-a')
  expect(api.selectedWorldOption.value).toMatchObject({
    id: 'world-a',
    name: 'world-a'
  })
  expect(api.selectedTemplateOption.value).toBeNull()

  api.selectedTemplateId.value = 'tpl-hero'
  expect(api.selectedTemplateOption.value).toMatchObject({
    id: 'tpl-hero',
    name: 'Heroes'
  })

  api.selectedWorldId.value = 'missing-world'
  expect(api.selectedWorldOption.value).toBeNull()
  api.selectedTemplateId.value = 'missing-template'
  expect(api.selectedTemplateOption.value).toBeNull()

  api.onDialogHide()
  expect(api.selectedWorldId.value).toBeNull()
  expect(api.selectedTemplateId.value).toBeNull()
  expect(api.selectedWorldOption.value).toBeNull()
  expect(api.selectedTemplateOption.value).toBeNull()
})

/**
 * runDialogQuickAddDocumentSession onWorldFilterEnter
 * Enter on the world filter re-runs onWorldSelect for the current world option.
 */
test('Test that runDialogQuickAddDocumentSession onWorldFilterEnter reselects current world', async () => {
  const openPopup = vi.fn()
  const { deps } = createDeps({
    onMounted: () => undefined,
    sleep: async () => undefined,
    templateFocusMs: 0
  })
  const useDialog = createUseDialogQuickAddDocument(deps)
  const api = useDialog({})

  api.dialogModel.value = true
  api.onDialogShow()
  await flushPromises()
  api.templateSelectRef.value = { openPopup }

  api.onWorldFilterEnter(new Event('keydown'))
  await flushPromises()
  expect(openPopup).toHaveBeenCalledTimes(2)

  api.selectedWorldId.value = null
  openPopup.mockClear()
  api.onWorldFilterEnter(new Event('keydown'))
  await flushPromises()
  expect(openPopup).not.toHaveBeenCalled()
})

test('Test that runDialogQuickAddDocumentSession onWorldFilterEnter keeps a world chosen during the wait', async () => {
  let releaseSleep: (() => void) | undefined
  const openPopup = vi.fn()
  const { deps } = createDeps({
    onMounted: () => undefined,
    sleep: () => {
      return new Promise<void>((resolve) => {
        releaseSleep = resolve
      })
    },
    templateFocusMs: 0
  })
  const useDialog = createUseDialogQuickAddDocument(deps)
  const api = useDialog({})
  api.dialogModel.value = true
  api.onDialogShow()
  await flushPromises()
  api.templateSelectRef.value = { openPopup }
  openPopup.mockClear()
  api.onWorldFilterEnter(new Event('keydown'))
  api.selectedWorldId.value = 'world-b'
  releaseSleep?.()
  await flushPromises()
  expect(api.selectedWorldId.value).toBe('world-b')
})

/**
 * runDialogQuickAddDocumentSession bindTemplateSelectRef
 * Forwards FaSelectInput-like exposes into session.templateSelectRef; ignores non-select values.
 */
test('Test that runDialogQuickAddDocumentSession bindTemplateSelectRef wires FaSelectInput ref', () => {
  const { deps } = createDeps({
    onMounted: () => undefined
  })
  const useDialog = createUseDialogQuickAddDocument(deps)
  const api = useDialog({})
  const select = {
    openPopup: vi.fn()
  }

  api.bindTemplateSelectRef({ nope: true })
  expect(api.templateSelectRef.value).toBeNull()
  api.bindTemplateSelectRef(select)
  expect(api.templateSelectRef.value?.openPopup).toBe(select.openPopup)
})
